const Timetable = require('../models/Timetable');
const Conflict = require('../models/Conflict');
const Faculty = require('../models/Faculty');
const Room = require('../models/Room');
const TimeSlot = require('../models/TimeSlot');
const FacultyAvailability = require('../models/FacultyAvailability');
const { detectConflicts } = require('./conflictDetector');

/**
 * Automatically resolve conflicts in a timetable
 * Strategy:
 * 1. Detect all conflicts
 * 2. For each conflict, try to find an alternative slot/room/faculty
 * 3. Apply the changes
 * 4. Re-detect conflicts to verify resolution
 */
const resolveConflicts = async (proposalId) => {
    console.log(`Starting conflict resolution for proposal ${proposalId}...`);

    // Step 1: Detect conflicts
    let conflicts = await detectConflicts(proposalId);

    if (conflicts.length === 0) {
        return {
            success: true,
            message: 'No conflicts found',
            conflictsResolved: 0,
            remainingConflicts: 0
        };
    }

    console.log(`Found ${conflicts.length} conflicts to resolve`);

    const resolutionLog = [];
    let resolvedCount = 0;

    // Group conflicts by type for better resolution strategy
    const conflictsByType = {
        faculty: conflicts.filter(c => c.type === 'faculty'),
        room: conflicts.filter(c => c.type === 'room'),
        section: conflicts.filter(c => c.type === 'section')
    };

    // Step 2: Resolve faculty conflicts
    for (const conflict of conflictsByType.faculty) {
        const resolved = await resolveFacultyConflict(conflict, proposalId);
        if (resolved) {
            resolvedCount++;
            resolutionLog.push({
                type: 'faculty',
                conflict: conflict,
                action: resolved
            });
        }
    }

    // Step 3: Resolve room conflicts
    for (const conflict of conflictsByType.room) {
        const resolved = await resolveRoomConflict(conflict, proposalId);
        if (resolved) {
            resolvedCount++;
            resolutionLog.push({
                type: 'room',
                conflict: conflict,
                action: resolved
            });
        }
    }

    // Step 4: Resolve section conflicts
    for (const conflict of conflictsByType.section) {
        const resolved = await resolveSectionConflict(conflict, proposalId);
        if (resolved) {
            resolvedCount++;
            resolutionLog.push({
                type: 'section',
                conflict: conflict,
                action: resolved
            });
        }
    }

    // Step 5: Re-detect conflicts to check what remains
    const remainingConflicts = await detectConflicts(proposalId);

    return {
        success: true,
        message: `Resolved ${resolvedCount} out of ${conflicts.length} conflicts`,
        conflictsResolved: resolvedCount,
        initialConflicts: conflicts.length,
        remainingConflicts: remainingConflicts.length,
        resolutionLog: resolutionLog,
        remainingConflictDetails: remainingConflicts
    };
};

/**
 * Resolve a faculty conflict by finding an alternative timeslot
 */
async function resolveFacultyConflict(conflict, proposalId) {
    try {
        // Find the conflicting timetable entries
        const entries = await Timetable.find({
            facultyId: conflict.entityId,
            timeslotId: conflict.timeslotId,
            proposalId: proposalId
        }).populate('sectionId').populate('courseId').populate('roomId').populate('facultyId').populate('timeslotId');

        if (entries.length < 2) return null;

        // Try to move the second entry to a different timeslot
        const entryToMove = entries[1];
        const originalTimeslot = entryToMove.timeslotId;

        // Find all available timeslots
        const allSlots = await TimeSlot.find();

        for (const slot of allSlots) {
            // Skip the current slot
            if (slot._id.toString() === conflict.timeslotId.toString()) continue;

            // Check if faculty is available
            const facultyAvailable = await checkFacultyAvailability(
                entryToMove.facultyId._id,
                slot._id,
                proposalId
            );
            if (!facultyAvailable) continue;

            // Check if section is free
            const sectionFree = await checkResourceFree(
                'sectionId',
                entryToMove.sectionId._id,
                slot._id,
                proposalId
            );
            if (!sectionFree) continue;

            // Check if room is free
            const roomFree = await checkResourceFree(
                'roomId',
                entryToMove.roomId._id,
                slot._id,
                proposalId
            );

            if (roomFree) {
                // Move the entry to this slot
                await Timetable.findByIdAndUpdate(entryToMove._id, {
                    timeslotId: slot._id
                });

                return {
                    action: 'moved',
                    entryId: entryToMove._id,
                    courseName: entryToMove.courseId?.name || 'Unknown Course',
                    courseType: entryToMove.courseId?.courseType || 'N/A',
                    sectionName: entryToMove.sectionId?.name || 'Unknown Section',
                    facultyName: entryToMove.facultyId?.name || 'Unknown Faculty',
                    roomName: entryToMove.roomId?.name || 'Unknown Room',
                    originalTimeslot: {
                        day: originalTimeslot?.day || 'N/A',
                        slot: originalTimeslot?.slot || 'N/A'
                    },
                    newTimeslot: {
                        day: slot.day,
                        slot: slot.slot
                    },
                    from: conflict.timeslotId,
                    to: slot._id,
                    reason: 'Faculty conflict resolved by rescheduling'
                };
            }
        }

        return null;
    } catch (error) {
        console.error('Error resolving faculty conflict:', error);
        return null;
    }
}

/**
 * Resolve a room conflict by finding an alternative room or timeslot
 */
async function resolveRoomConflict(conflict, proposalId) {
    try {
        // Find the conflicting timetable entries
        const entries = await Timetable.find({
            roomId: conflict.entityId,
            timeslotId: conflict.timeslotId,
            proposalId: proposalId
        }).populate('sectionId').populate('courseId').populate('roomId').populate('facultyId').populate('timeslotId');

        if (entries.length < 2) return null;

        // Try to move the second entry to a different room
        const entryToMove = entries[1];
        const originalRoom = entryToMove.roomId;
        const originalTimeslot = entryToMove.timeslotId;

        // Find alternative rooms of the same type
        const alternativeRooms = await Room.find({
            roomType: originalRoom.roomType,
            capacity: { $gte: entryToMove.sectionId.studentCount },
            _id: { $ne: originalRoom._id }
        });

        for (const room of alternativeRooms) {
            const roomFree = await checkResourceFree(
                'roomId',
                room._id,
                conflict.timeslotId,
                proposalId
            );

            if (roomFree) {
                // Move to this room
                await Timetable.findByIdAndUpdate(entryToMove._id, {
                    roomId: room._id
                });

                return {
                    action: 'room_changed',
                    entryId: entryToMove._id,
                    courseName: entryToMove.courseId?.name || 'Unknown Course',
                    courseType: entryToMove.courseId?.courseType || 'N/A',
                    sectionName: entryToMove.sectionId?.name || 'Unknown Section',
                    facultyName: entryToMove.facultyId?.name || 'Unknown Faculty',
                    timeslot: {
                        day: originalTimeslot?.day || 'N/A',
                        slot: originalTimeslot?.slot || 'N/A'
                    },
                    originalRoom: originalRoom.name || 'Unknown Room',
                    newRoom: room.name || 'Unknown Room',
                    from: originalRoom._id,
                    to: room._id,
                    reason: 'Room conflict resolved by changing room'
                };
            }
        }

        // If no alternative room found, try to reschedule
        const allSlots = await TimeSlot.find();

        for (const slot of allSlots) {
            if (slot._id.toString() === conflict.timeslotId.toString()) continue;

            const facultyAvailable = await checkFacultyAvailability(
                entryToMove.facultyId._id,
                slot._id,
                proposalId
            );
            if (!facultyAvailable) continue;

            const sectionFree = await checkResourceFree(
                'sectionId',
                entryToMove.sectionId._id,
                slot._id,
                proposalId
            );
            if (!sectionFree) continue;

            const roomFree = await checkResourceFree(
                'roomId',
                originalRoom._id,
                slot._id,
                proposalId
            );

            if (roomFree) {
                await Timetable.findByIdAndUpdate(entryToMove._id, {
                    timeslotId: slot._id
                });

                return {
                    action: 'moved',
                    entryId: entryToMove._id,
                    courseName: entryToMove.courseId?.name || 'Unknown Course',
                    courseType: entryToMove.courseId?.courseType || 'N/A',
                    sectionName: entryToMove.sectionId?.name || 'Unknown Section',
                    facultyName: entryToMove.facultyId?.name || 'Unknown Faculty',
                    roomName: originalRoom.name || 'Unknown Room',
                    originalTimeslot: {
                        day: originalTimeslot?.day || 'N/A',
                        slot: originalTimeslot?.slot || 'N/A'
                    },
                    newTimeslot: {
                        day: slot.day,
                        slot: slot.slot
                    },
                    from: conflict.timeslotId,
                    to: slot._id,
                    reason: 'Room conflict resolved by rescheduling'
                };
            }
        }

        return null;
    } catch (error) {
        console.error('Error resolving room conflict:', error);
        return null;
    }
}

/**
 * Resolve a section conflict by rescheduling one of the classes
 */
async function resolveSectionConflict(conflict, proposalId) {
    try {
        // Find the conflicting timetable entries
        const entries = await Timetable.find({
            sectionId: conflict.entityId,
            timeslotId: conflict.timeslotId,
            proposalId: proposalId
        }).populate('sectionId').populate('courseId').populate('roomId').populate('facultyId').populate('timeslotId');

        if (entries.length < 2) return null;

        // Try to move the second entry to a different timeslot
        const entryToMove = entries[1];
        const originalTimeslot = entryToMove.timeslotId;

        const allSlots = await TimeSlot.find();

        for (const slot of allSlots) {
            if (slot._id.toString() === conflict.timeslotId.toString()) continue;

            // Check if faculty is available
            const facultyAvailable = await checkFacultyAvailability(
                entryToMove.facultyId._id,
                slot._id,
                proposalId
            );
            if (!facultyAvailable) continue;

            // Check if section is free
            const sectionFree = await checkResourceFree(
                'sectionId',
                entryToMove.sectionId._id,
                slot._id,
                proposalId
            );
            if (!sectionFree) continue;

            // Try to find a free room
            const roomFree = await checkResourceFree(
                'roomId',
                entryToMove.roomId._id,
                slot._id,
                proposalId
            );

            if (roomFree) {
                await Timetable.findByIdAndUpdate(entryToMove._id, {
                    timeslotId: slot._id
                });

                return {
                    action: 'moved',
                    entryId: entryToMove._id,
                    courseName: entryToMove.courseId?.name || 'Unknown Course',
                    courseType: entryToMove.courseId?.courseType || 'N/A',
                    sectionName: entryToMove.sectionId?.name || 'Unknown Section',
                    facultyName: entryToMove.facultyId?.name || 'Unknown Faculty',
                    roomName: entryToMove.roomId?.name || 'Unknown Room',
                    originalTimeslot: {
                        day: originalTimeslot?.day || 'N/A',
                        slot: originalTimeslot?.slot || 'N/A'
                    },
                    newTimeslot: {
                        day: slot.day,
                        slot: slot.slot
                    },
                    from: conflict.timeslotId,
                    to: slot._id,
                    reason: 'Section conflict resolved by rescheduling'
                };
            } else {
                // Try to find an alternative room
                const alternativeRooms = await Room.find({
                    roomType: entryToMove.roomId.roomType,
                    capacity: { $gte: entryToMove.sectionId.studentCount }
                });

                for (const room of alternativeRooms) {
                    const altRoomFree = await checkResourceFree(
                        'roomId',
                        room._id,
                        slot._id,
                        proposalId
                    );

                    if (altRoomFree) {
                        await Timetable.findByIdAndUpdate(entryToMove._id, {
                            timeslotId: slot._id,
                            roomId: room._id
                        });

                        return {
                            action: 'moved_and_room_changed',
                            entryId: entryToMove._id,
                            courseName: entryToMove.courseId?.name || 'Unknown Course',
                            courseType: entryToMove.courseId?.courseType || 'N/A',
                            sectionName: entryToMove.sectionId?.name || 'Unknown Section',
                            facultyName: entryToMove.facultyId?.name || 'Unknown Faculty',
                            originalTimeslot: {
                                day: originalTimeslot?.day || 'N/A',
                                slot: originalTimeslot?.slot || 'N/A'
                            },
                            newTimeslot: {
                                day: slot.day,
                                slot: slot.slot
                            },
                            originalRoom: entryToMove.roomId?.name || 'Unknown Room',
                            newRoom: room.name || 'Unknown Room',
                            from: conflict.timeslotId,
                            to: slot._id,
                            newRoomId: room._id,
                            reason: 'Section conflict resolved by rescheduling and changing room'
                        };
                    }
                }
            }
        }

        return null;
    } catch (error) {
        console.error('Error resolving section conflict:', error);
        return null;
    }
}

/**
 * Check if a faculty is available at a given timeslot
 */
async function checkFacultyAvailability(facultyId, timeslotId, proposalId) {
    // Check faculty availability
    const availability = await FacultyAvailability.findOne({
        facultyId: facultyId,
        timeslotId: timeslotId,
        isAvailable: false
    });

    if (availability) return false;

    // Check if faculty is already scheduled
    const existing = await Timetable.findOne({
        facultyId: facultyId,
        timeslotId: timeslotId,
        proposalId: proposalId
    });

    return !existing;
}

/**
 * Check if a resource (room/section) is free at a given timeslot
 */
async function checkResourceFree(field, resourceId, timeslotId, proposalId) {
    const existing = await Timetable.findOne({
        [field]: resourceId,
        timeslotId: timeslotId,
        proposalId: proposalId
    });

    return !existing;
}

module.exports = { resolveConflicts };

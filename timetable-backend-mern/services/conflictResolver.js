const Timetable = require('../models/Timetable');
const Conflict = require('../models/Conflict');
const Faculty = require('../models/Faculty');
const Room = require('../models/Room');
const TimeSlot = require('../models/TimeSlot');
const FacultyAvailability = require('../models/FacultyAvailability');
const { detectConflicts } = require('./conflictDetector');

/**
 * Automatically resolve conflicts in a timetable.
 *
 * OPTIMISED VERSION
 * -  Pre-loads all reference data (timeslots, rooms, availability) once.
 * -  Builds an in-memory occupancy index so availability checks are O(1)
 *    instead of hitting the DB each time.
 * -  Falls back to the same strategies: re-slot, re-room, or both.
 */
const resolveConflicts = async (proposalId) => {
    console.log(`Starting conflict resolution for proposal ${proposalId}...`);

    // Step 1 – detect current conflicts
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

    // ── Pre-load reference data (one DB round-trip each) ─────
    const [allSlots, allRooms, unavailabilities, allEntries] = await Promise.all([
        TimeSlot.find().lean(),
        Room.find().lean(),
        FacultyAvailability.find({ isAvailable: false }).lean(),
        Timetable.find({ proposalId })
            .populate('sectionId', 'name studentCount')
            .populate('courseId', 'name code courseType')
            .populate('roomId', 'name capacity roomType')
            .populate('facultyId', 'name')
            .populate('timeslotId', 'day slot startTime endTime')
            .lean()
    ]);

    // ── Build in-memory occupancy index ──────────────────────
    // key = "field:resourceId:timeslotId" → true
    const occupancy = new Set();
    function occKey(field, resId, tsId) {
        return `${field}:${resId}:${tsId}`;
    }
    for (const e of allEntries) {
        if (e.facultyId) occupancy.add(occKey('faculty', e.facultyId._id || e.facultyId, e.timeslotId._id || e.timeslotId));
        if (e.roomId) occupancy.add(occKey('room', e.roomId._id || e.roomId, e.timeslotId._id || e.timeslotId));
        if (e.sectionId) occupancy.add(occKey('section', e.sectionId._id || e.sectionId, e.timeslotId._id || e.timeslotId));
    }

    // Faculty unavailability set
    const facultyUnavailable = new Set();
    for (const u of unavailabilities) {
        facultyUnavailable.add(`${u.facultyId}:${u.timeslotId}`);
    }

    // ── Helper: check faculty availability (in-memory) ──────
    function isFacultyFree(fId, tsId) {
        if (facultyUnavailable.has(`${fId}:${tsId}`)) return false;
        return !occupancy.has(occKey('faculty', fId, tsId));
    }
    function isResourceFree(field, rId, tsId) {
        return !occupancy.has(occKey(field, rId, tsId));
    }

    // ── Helper: update occupancy after a move ───────────────
    function moveOccupancy(entry, newTsId, newRoomId) {
        const oldTs = entry.timeslotId._id || entry.timeslotId;
        const fId = entry.facultyId._id || entry.facultyId;
        const sId = entry.sectionId._id || entry.sectionId;
        const oldRId = entry.roomId._id || entry.roomId;
        const rId = newRoomId || oldRId;

        // Remove old occupancies
        occupancy.delete(occKey('faculty', fId, oldTs));
        occupancy.delete(occKey('room', oldRId, oldTs));
        occupancy.delete(occKey('section', sId, oldTs));

        // Add new occupancies
        occupancy.add(occKey('faculty', fId, newTsId));
        occupancy.add(occKey('room', rId, newTsId));
        occupancy.add(occKey('section', sId, newTsId));
    }

    // ── Resolve ─────────────────────────────────────────────
    const resolutionLog = [];
    let resolvedCount = 0;

    // Group conflicts by type
    const conflictsByType = {
        faculty: conflicts.filter(c => c.type === 'faculty'),
        room: conflicts.filter(c => c.type === 'room'),
        section: conflicts.filter(c => c.type === 'section')
    };

    // Helper to find the pair of conflicting entries
    function findConflictingEntries(field, entityId, timeslotId) {
        return allEntries.filter(e => {
            const eField = e[field]?._id?.toString() || e[field]?.toString();
            const eTs = e.timeslotId?._id?.toString() || e.timeslotId?.toString();
            return eField === entityId.toString() && eTs === timeslotId.toString();
        });
    }

    // ── Faculty conflicts ────────────────────────────────────
    for (const conflict of conflictsByType.faculty) {
        const entries = findConflictingEntries('facultyId', conflict.entityId, conflict.timeslotId);
        if (entries.length < 2) continue;

        const entryToMove = entries[1];
        const originalTimeslot = entryToMove.timeslotId;
        let resolved = false;

        for (const slot of allSlots) {
            if (slot._id.toString() === conflict.timeslotId.toString()) continue;

            const fId = entryToMove.facultyId._id || entryToMove.facultyId;
            const sId = entryToMove.sectionId._id || entryToMove.sectionId;
            const rId = entryToMove.roomId._id || entryToMove.roomId;

            if (!isFacultyFree(fId, slot._id)) continue;
            if (!isResourceFree('section', sId, slot._id)) continue;
            if (!isResourceFree('room', rId, slot._id)) continue;

            // Apply change
            await Timetable.findByIdAndUpdate(entryToMove._id, { timeslotId: slot._id });
            moveOccupancy(entryToMove, slot._id, null);

            resolvedCount++;
            resolutionLog.push({
                type: 'faculty',
                conflict,
                action: {
                    action: 'moved',
                    entryId: entryToMove._id,
                    courseName: entryToMove.courseId?.name || 'Unknown Course',
                    courseType: entryToMove.courseId?.courseType || 'N/A',
                    sectionName: entryToMove.sectionId?.name || 'Unknown Section',
                    facultyName: entryToMove.facultyId?.name || 'Unknown Faculty',
                    roomName: entryToMove.roomId?.name || 'Unknown Room',
                    originalTimeslot: { day: originalTimeslot?.day || 'N/A', slot: originalTimeslot?.slot || 'N/A' },
                    newTimeslot: { day: slot.day, slot: slot.slot },
                    from: conflict.timeslotId,
                    to: slot._id,
                    reason: 'Faculty conflict resolved by rescheduling'
                }
            });
            resolved = true;
            break;
        }
    }

    // ── Room conflicts ───────────────────────────────────────
    for (const conflict of conflictsByType.room) {
        const entries = findConflictingEntries('roomId', conflict.entityId, conflict.timeslotId);
        if (entries.length < 2) continue;

        const entryToMove = entries[1];
        const originalRoom = entryToMove.roomId;
        const originalTimeslot = entryToMove.timeslotId;
        let resolved = false;

        // Strategy 1: find alternative room at same timeslot
        const altRooms = allRooms.filter(r =>
            r.roomType === (originalRoom.roomType || originalRoom) &&
            r._id.toString() !== (originalRoom._id || originalRoom).toString()
        );

        for (const room of altRooms) {
            if (isResourceFree('room', room._id, conflict.timeslotId)) {
                await Timetable.findByIdAndUpdate(entryToMove._id, { roomId: room._id });

                // Update occupancy
                const oldRId = originalRoom._id || originalRoom;
                occupancy.delete(occKey('room', oldRId, conflict.timeslotId));
                occupancy.add(occKey('room', room._id, conflict.timeslotId));

                resolvedCount++;
                resolutionLog.push({
                    type: 'room',
                    conflict,
                    action: {
                        action: 'room_changed',
                        entryId: entryToMove._id,
                        courseName: entryToMove.courseId?.name || 'Unknown Course',
                        courseType: entryToMove.courseId?.courseType || 'N/A',
                        sectionName: entryToMove.sectionId?.name || 'Unknown Section',
                        facultyName: entryToMove.facultyId?.name || 'Unknown Faculty',
                        timeslot: { day: originalTimeslot?.day || 'N/A', slot: originalTimeslot?.slot || 'N/A' },
                        originalRoom: originalRoom.name || 'Unknown Room',
                        newRoom: room.name || 'Unknown Room',
                        from: originalRoom._id,
                        to: room._id,
                        reason: 'Room conflict resolved by changing room'
                    }
                });
                resolved = true;
                break;
            }
        }

        if (resolved) continue;

        // Strategy 2: reschedule to different timeslot
        for (const slot of allSlots) {
            if (slot._id.toString() === conflict.timeslotId.toString()) continue;

            const fId = entryToMove.facultyId._id || entryToMove.facultyId;
            const sId = entryToMove.sectionId._id || entryToMove.sectionId;
            const rId = originalRoom._id || originalRoom;

            if (!isFacultyFree(fId, slot._id)) continue;
            if (!isResourceFree('section', sId, slot._id)) continue;
            if (!isResourceFree('room', rId, slot._id)) continue;

            await Timetable.findByIdAndUpdate(entryToMove._id, { timeslotId: slot._id });
            moveOccupancy(entryToMove, slot._id, null);

            resolvedCount++;
            resolutionLog.push({
                type: 'room',
                conflict,
                action: {
                    action: 'moved',
                    entryId: entryToMove._id,
                    courseName: entryToMove.courseId?.name || 'Unknown Course',
                    courseType: entryToMove.courseId?.courseType || 'N/A',
                    sectionName: entryToMove.sectionId?.name || 'Unknown Section',
                    facultyName: entryToMove.facultyId?.name || 'Unknown Faculty',
                    roomName: originalRoom.name || 'Unknown Room',
                    originalTimeslot: { day: originalTimeslot?.day || 'N/A', slot: originalTimeslot?.slot || 'N/A' },
                    newTimeslot: { day: slot.day, slot: slot.slot },
                    from: conflict.timeslotId,
                    to: slot._id,
                    reason: 'Room conflict resolved by rescheduling'
                }
            });
            break;
        }
    }

    // ── Section conflicts ────────────────────────────────────
    for (const conflict of conflictsByType.section) {
        const entries = findConflictingEntries('sectionId', conflict.entityId, conflict.timeslotId);
        if (entries.length < 2) continue;

        const entryToMove = entries[1];
        const originalTimeslot = entryToMove.timeslotId;

        for (const slot of allSlots) {
            if (slot._id.toString() === conflict.timeslotId.toString()) continue;

            const fId = entryToMove.facultyId._id || entryToMove.facultyId;
            const sId = entryToMove.sectionId._id || entryToMove.sectionId;
            const rId = entryToMove.roomId._id || entryToMove.roomId;

            if (!isFacultyFree(fId, slot._id)) continue;
            if (!isResourceFree('section', sId, slot._id)) continue;

            if (isResourceFree('room', rId, slot._id)) {
                // Same room, different timeslot
                await Timetable.findByIdAndUpdate(entryToMove._id, { timeslotId: slot._id });
                moveOccupancy(entryToMove, slot._id, null);

                resolvedCount++;
                resolutionLog.push({
                    type: 'section',
                    conflict,
                    action: {
                        action: 'moved',
                        entryId: entryToMove._id,
                        courseName: entryToMove.courseId?.name || 'Unknown Course',
                        courseType: entryToMove.courseId?.courseType || 'N/A',
                        sectionName: entryToMove.sectionId?.name || 'Unknown Section',
                        facultyName: entryToMove.facultyId?.name || 'Unknown Faculty',
                        roomName: entryToMove.roomId?.name || 'Unknown Room',
                        originalTimeslot: { day: originalTimeslot?.day || 'N/A', slot: originalTimeslot?.slot || 'N/A' },
                        newTimeslot: { day: slot.day, slot: slot.slot },
                        from: conflict.timeslotId,
                        to: slot._id,
                        reason: 'Section conflict resolved by rescheduling'
                    }
                });
                break;
            } else {
                // Try alternative room at this new timeslot
                const altRooms = allRooms.filter(r =>
                    r.roomType === (entryToMove.roomId?.roomType || '')
                );
                for (const room of altRooms) {
                    if (isResourceFree('room', room._id, slot._id)) {
                        await Timetable.findByIdAndUpdate(entryToMove._id, {
                            timeslotId: slot._id,
                            roomId: room._id
                        });
                        moveOccupancy(entryToMove, slot._id, room._id);

                        resolvedCount++;
                        resolutionLog.push({
                            type: 'section',
                            conflict,
                            action: {
                                action: 'moved_and_room_changed',
                                entryId: entryToMove._id,
                                courseName: entryToMove.courseId?.name || 'Unknown Course',
                                courseType: entryToMove.courseId?.courseType || 'N/A',
                                sectionName: entryToMove.sectionId?.name || 'Unknown Section',
                                facultyName: entryToMove.facultyId?.name || 'Unknown Faculty',
                                originalTimeslot: { day: originalTimeslot?.day || 'N/A', slot: originalTimeslot?.slot || 'N/A' },
                                newTimeslot: { day: slot.day, slot: slot.slot },
                                originalRoom: entryToMove.roomId?.name || 'Unknown Room',
                                newRoom: room.name || 'Unknown Room',
                                from: conflict.timeslotId,
                                to: slot._id,
                                newRoomId: room._id,
                                reason: 'Section conflict resolved by rescheduling and changing room'
                            }
                        });
                        break;
                    }
                }
                // If we resolved within the inner loop, break the outer
                if (resolutionLog.length > 0 && resolutionLog[resolutionLog.length - 1].conflict === conflict) break;
            }
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

module.exports = { resolveConflicts };

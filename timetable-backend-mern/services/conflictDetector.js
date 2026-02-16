const Timetable = require('../models/Timetable');
const Conflict = require('../models/Conflict');

const detectConflicts = async (proposalId) => {
    // If proposalId provided, we delete old conflicts for clean state (optional but good for consistency)
    if (proposalId) {
        await Conflict.deleteMany({ proposalId });
    }

    const conflicts = [];
    const query = proposalId ? { proposalId } : {};
    const entries = await Timetable.find(query)
        .populate('facultyId')
        .populate('roomId')
        .populate('sectionId')
        .populate('timeslotId');

    for (const entry of entries) {
        if (!entry.timeslotId) continue; // Skip if timeslot missing

        const baseQuery = {
            timeslotId: entry.timeslotId._id,
            // Optimization: Only look for conflicts with ID > current ID to avoid A-B / B-A duplicates
            _id: { $gt: entry._id },
        };

        // IMPORTANT: Only check against entries in the same proposal
        if (entry.proposalId) {
            baseQuery.proposalId = entry.proposalId;
        }

        // Faculty conflict
        // Check if faculty exists (populated)
        if (entry.facultyId) {
            const facultyConflict = await Timetable.findOne({
                ...baseQuery,
                facultyId: entry.facultyId._id,
            });

            if (facultyConflict) {
                const timeStr = `${entry.timeslotId.day} ${entry.timeslotId.startTime}-${entry.timeslotId.endTime}`;
                conflicts.push({
                    type: 'faculty',
                    entityId: entry.facultyId._id,
                    entityName: entry.facultyId.name,
                    timeslotId: entry.timeslotId._id,
                    timeslotLabel: timeStr,
                    reason: `Faculty ${entry.facultyId.name} is double booked at ${timeStr}`,
                    proposalId: entry.proposalId || null
                });
            }
        }

        // Room conflict
        if (entry.roomId) {
            const roomConflict = await Timetable.findOne({
                ...baseQuery,
                roomId: entry.roomId._id,
            });

            if (roomConflict) {
                const timeStr = `${entry.timeslotId.day} ${entry.timeslotId.startTime}-${entry.timeslotId.endTime}`;
                conflicts.push({
                    type: 'room',
                    entityId: entry.roomId._id,
                    entityName: `${entry.roomId.name} (${entry.roomId.roomType})`,
                    timeslotId: entry.timeslotId._id,
                    timeslotLabel: timeStr,
                    reason: `Room ${entry.roomId.name} is double booked at ${timeStr}`,
                    proposalId: entry.proposalId || null
                });
            }
        }

        // Section conflict
        if (entry.sectionId) {
            const sectionConflict = await Timetable.findOne({
                ...baseQuery,
                sectionId: entry.sectionId._id,
            });

            if (sectionConflict) {
                const timeStr = `${entry.timeslotId.day} ${entry.timeslotId.startTime}-${entry.timeslotId.endTime}`;
                conflicts.push({
                    type: 'section',
                    entityId: entry.sectionId._id,
                    entityName: entry.sectionId.name,
                    timeslotId: entry.timeslotId._id,
                    timeslotLabel: timeStr,
                    reason: `Section ${entry.sectionId.name} has concurrent classes at ${timeStr}`,
                    proposalId: entry.proposalId || null
                });
            }
        }
    }

    // Save unique conflicts to database
    if (conflicts.length > 0) {
        await Conflict.insertMany(conflicts);
    }

    return conflicts;
};

module.exports = { detectConflicts };

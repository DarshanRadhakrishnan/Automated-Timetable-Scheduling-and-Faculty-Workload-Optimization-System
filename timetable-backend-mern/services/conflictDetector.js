const Timetable = require('../models/Timetable');
const Conflict = require('../models/Conflict');

const detectConflicts = async (proposalId) => {
    // If proposalId provided, we delete old conflicts for clean state (optional but good for consistency)
    if (proposalId) {
        await Conflict.deleteMany({ proposalId });
    }

    const conflicts = [];
    const query = proposalId ? { proposalId } : {};
    const entries = await Timetable.find(query);

    for (const entry of entries) {
        const baseQuery = {
            timeslotId: entry.timeslotId,
            // Optimization: Only look for conflicts with ID > current ID to avoid A-B / B-A duplicates
            _id: { $gt: entry._id },
        };

        // IMPORTANT: Only check against entries in the same proposal
        if (entry.proposalId) {
            baseQuery.proposalId = entry.proposalId;
        }

        // Faculty conflict
        const facultyConflict = await Timetable.findOne({
            ...baseQuery,
            facultyId: entry.facultyId,
        });

        if (facultyConflict) {
            conflicts.push({
                type: 'faculty',
                entityId: entry.facultyId,
                timeslotId: entry.timeslotId,
                reason: `Faculty double booked in proposal ${entry.proposalId}`,
                proposalId: entry.proposalId
            });
        }

        // Room conflict
        const roomConflict = await Timetable.findOne({
            ...baseQuery,
            roomId: entry.roomId,
        });

        if (roomConflict) {
            conflicts.push({
                type: 'room',
                entityId: entry.roomId,
                timeslotId: entry.timeslotId,
                reason: `Room double booked in proposal ${entry.proposalId}`,
                proposalId: entry.proposalId
            });
        }

        // Section conflict
        const sectionConflict = await Timetable.findOne({
            ...baseQuery,
            sectionId: entry.sectionId,
        });

        if (sectionConflict) {
            conflicts.push({
                type: 'section',
                entityId: entry.sectionId,
                timeslotId: entry.timeslotId,
                reason: `Section ${entry.sectionId} has concurrent classes`,
                proposalId: entry.proposalId
            });
        }
    }

    // Save unique conflicts to database
    if (conflicts.length > 0) {
        await Conflict.insertMany(conflicts);
    }

    return conflicts;
};

module.exports = { detectConflicts };

const Timetable = require('../models/Timetable');
const Conflict = require('../models/Conflict');

/**
 * Detect conflicts entirely in-memory.
 * Previous version did N+1 queries (3 findOne() calls per entry = 630+ queries for 210 entries).
 * This version loads all entries once, then detects all conflicts with O(n) in-memory grouping.
 */
const detectConflicts = async (proposalId) => {
    // Clean old conflicts for this proposal
    if (proposalId) {
        await Conflict.deleteMany({ proposalId });
    }

    const query = proposalId ? { proposalId } : {};
    const entries = await Timetable.find(query)
        .populate('facultyId', 'name')
        .populate('roomId', 'name roomType')
        .populate('sectionId', 'name')
        .populate('timeslotId', 'day startTime endTime slot')
        .lean();

    const conflicts = [];

    // ── Group entries by timeslot for O(n) conflict detection ──
    const byTimeslot = new Map();
    for (const entry of entries) {
        if (!entry.timeslotId) continue;
        const tsId = entry.timeslotId._id.toString();
        if (!byTimeslot.has(tsId)) byTimeslot.set(tsId, []);
        byTimeslot.get(tsId).push(entry);
    }

    // For each timeslot group, find duplicate faculty/room/section
    for (const [, group] of byTimeslot) {
        if (group.length < 2) continue;

        // Check faculty conflicts within this timeslot
        const facultySeen = new Map();
        for (const entry of group) {
            if (!entry.facultyId) continue;
            const fId = entry.facultyId._id.toString();
            if (facultySeen.has(fId)) {
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
            } else {
                facultySeen.set(fId, entry);
            }
        }

        // Check room conflicts within this timeslot
        const roomSeen = new Map();
        for (const entry of group) {
            if (!entry.roomId) continue;
            const rId = entry.roomId._id.toString();
            if (roomSeen.has(rId)) {
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
            } else {
                roomSeen.set(rId, entry);
            }
        }

        // Check section conflicts within this timeslot
        const sectionSeen = new Map();
        for (const entry of group) {
            if (!entry.sectionId) continue;
            const sId = entry.sectionId._id.toString();
            if (sectionSeen.has(sId)) {
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
            } else {
                sectionSeen.set(sId, entry);
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

const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const {
    findSubstitutesForFaculty,
    findAlternativeRooms,
    rescheduleHoliday
} = require('../services/reschedulingService');

// 1. Check Faculty Leave Impact
router.post('/check-faculty-leave', async (req, res) => {
    try {
        const { facultyId, day, proposalId } = req.body;
        if (!facultyId || !day) return res.status(400).json({ message: 'Missing facultyId or day' });

        const results = await findSubstitutesForFaculty(facultyId, day, proposalId || 1);
        res.json({
            message: `Found ${results.length} affected classes`,
            data: results
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Check Room Unavailability Impact
router.post('/check-room-maintenance', async (req, res) => {
    try {
        const { roomId, day, proposalId } = req.body;
        if (!roomId || !day) return res.status(400).json({ message: 'Missing roomId or day' });

        const results = await findAlternativeRooms(roomId, day, proposalId || 1);
        res.json({
            message: `Found ${results.length} affected classes`,
            data: results
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// NEW: Dynamic Find Alternatives for Postponing
// This endpoint finds the best alternative slots automatically
router.post('/find-alternatives', async (req, res) => {
    try {
        const { entryId, proposalId } = req.body;
        if (!entryId) return res.status(400).json({ message: 'Missing entryId' });

        const entry = await Timetable.findById(entryId)
            .populate('timeslotId')
            .populate('courseId')
            .populate('sectionId')
            .populate('facultyId')
            .populate('roomId');

        if (!entry) return res.status(404).json({ message: 'Entry not found' });

        const TimeSlot = require('../models/TimeSlot');
        const Room = require('../models/Room');

        const pid = proposalId || entry.proposalId || 1;
        const currentTimeslotId = entry.timeslotId._id.toString();

        // Get all timeslots except the current one
        const allSlots = await TimeSlot.find({ _id: { $ne: currentTimeslotId } });
        const suggestions = [];

        for (const slot of allSlots) {
            // Check 1: Faculty availability
            const facultyBusy = await Timetable.exists({
                facultyId: entry.facultyId._id,
                timeslotId: slot._id,
                proposalId: pid
            });
            if (facultyBusy) continue;

            // Check 2: Section availability
            const sectionBusy = await Timetable.exists({
                sectionId: entry.sectionId._id,
                timeslotId: slot._id,
                proposalId: pid
            });
            if (sectionBusy) continue;

            // Check 3: Room availability
            let targetRoom = entry.roomId;
            let roomChanged = false;

            const roomBusy = await Timetable.exists({
                roomId: entry.roomId._id,
                timeslotId: slot._id,
                proposalId: pid
            });

            if (roomBusy) {
                // Try to find alternative room
                const alternativeRoom = await Room.findOne({
                    _id: { $ne: entry.roomId._id },
                    roomType: entry.roomId.roomType,
                    capacity: { $gte: entry.sectionId.studentCount || 0 }
                });

                if (alternativeRoom) {
                    // Check if alternative room is free
                    const altRoomBusy = await Timetable.exists({
                        roomId: alternativeRoom._id,
                        timeslotId: slot._id,
                        proposalId: pid
                    });

                    if (!altRoomBusy) {
                        targetRoom = alternativeRoom;
                        roomChanged = true;
                    } else {
                        continue; // No room available
                    }
                } else {
                    continue; // No alternative room found
                }
            }

            // This slot is valid!
            suggestions.push({
                timeslotId: slot._id,
                day: slot.day,
                startTime: slot.startTime,
                endTime: slot.endTime,
                roomId: targetRoom._id,
                roomName: targetRoom.name,
                roomChanged: roomChanged,
                score: calculateSlotScore(slot, entry.timeslotId, roomChanged)
            });

            if (suggestions.length >= 5) break; // Limit to 5 suggestions
        }

        // Sort by score (best first)
        suggestions.sort((a, b) => b.score - a.score);

        res.json({
            message: `Found ${suggestions.length} alternative slots`,
            suggestions: suggestions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Helper function to score slots (prefer same day, similar time)
function calculateSlotScore(newSlot, originalSlot, roomChanged) {
    let score = 100;

    // Prefer same day
    if (newSlot.day === originalSlot.day) score += 50;

    // Prefer similar time (calculate time difference)
    const originalHour = parseInt(originalSlot.startTime.split(':')[0]);
    const newHour = parseInt(newSlot.startTime.split(':')[0]);
    const timeDiff = Math.abs(originalHour - newHour);
    score -= timeDiff * 5; // Penalize time difference

    // Penalize room change
    if (roomChanged) score -= 20;

    // Prefer earlier in the week
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayIndex = dayOrder.indexOf(newSlot.day);
    if (dayIndex < 5) score += (5 - dayIndex) * 2; // Prefer weekdays

    return score;
}

// 3. Check Holiday Impact
router.post('/check-holiday', async (req, res) => {
    try {
        const { day, proposalId } = req.body;
        if (!day) return res.status(400).json({ message: 'Missing day' });

        const results = await rescheduleHoliday(day, proposalId || 1);
        res.json({
            message: `Found ${results.length} affected classes`,
            data: results
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. Apply Changes
// This expects an array of "updates" where each update specifies the Timetable Entry ID and the new fields.
router.post('/apply-changes', async (req, res) => {
    try {
        const { updates } = req.body; // Array of { entryId, updates: { facultyId, roomId, timeslotId } }
        if (!updates || !Array.isArray(updates)) {
            return res.status(400).json({ message: 'Invalid updates format' });
        }

        const results = [];
        for (const update of updates) {
            const { entryId, changes, type } = update;

            let result;
            if (type === 'cancel') {
                // Delete the entry
                result = await Timetable.findByIdAndDelete(entryId);
            } else {
                // Update the entry
                result = await Timetable.findByIdAndUpdate(
                    entryId,
                    { $set: changes },
                    { new: true }
                );
            }
            results.push(result);
        }

        res.json({
            message: 'Timetable updated successfully',
            updatedCount: results.length,
            data: results
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

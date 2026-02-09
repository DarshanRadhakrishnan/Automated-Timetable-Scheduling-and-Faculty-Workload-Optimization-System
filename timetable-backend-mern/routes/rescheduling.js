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

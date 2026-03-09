const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const User = require('../models/User');
const { verifyToken, authorize } = require('../middleware/auth');

// All routes require login + student role
router.use(verifyToken);
router.use(authorize(['student', 'admin'])); // admin can also access for testing

// ─────────────────────────────────────────────
// GET /api/student/my-timetable
// Student views only their own section's slots.
// The sectionId is taken from their User profile — not from query params.
// ─────────────────────────────────────────────
router.get('/my-timetable', async (req, res) => {
    try {
        // Load full user to get sectionId
        const user = await User.findById(req.user.id).select('sectionId role');

        if (!user.sectionId) {
            return res.status(400).json({
                success: false,
                message: 'Your account is not linked to any section. Please contact the administrator.'
            });
        }

        const entries = await Timetable.find({ sectionId: user.sectionId })
            .populate('sectionId', 'name program batch')
            .populate('courseId', 'name code')
            .populate('facultyId', 'name department')
            .populate('roomId', 'name capacity')
            .populate('timeslotId', 'day startTime endTime slot')
            .sort({ 'timeslotId.day': 1, 'timeslotId.slot': 1 });

        res.json({
            success: true,
            sectionId: user.sectionId,
            count: entries.length,
            data: entries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving your timetable.',
            error: error.message
        });
    }
});

// ─────────────────────────────────────────────
// GET /api/student/my-timetable/day/:day
// Student views their section's timetable for a specific day.
// ─────────────────────────────────────────────
router.get('/my-timetable/day/:day', async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('sectionId');

        if (!user.sectionId) {
            return res.status(400).json({
                success: false,
                message: 'Your account is not linked to any section.'
            });
        }

        // Get all entries for this section then filter by day via populated timeslot
        const allEntries = await Timetable.find({ sectionId: user.sectionId })
            .populate('courseId', 'name code')
            .populate('facultyId', 'name department')
            .populate('roomId', 'name capacity')
            .populate('timeslotId', 'day startTime endTime slot');

        const day = req.params.day.toLowerCase();
        const filtered = allEntries.filter(entry =>
            entry.timeslotId?.day?.toLowerCase() === day
        );

        res.json({
            success: true,
            day: req.params.day,
            count: filtered.length,
            data: filtered
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving timetable for this day.',
            error: error.message
        });
    }
});

// ─────────────────────────────────────────────
// GET /api/student/my-profile
// Student views their own profile (section info, etc.)
// ─────────────────────────────────────────────
router.get('/my-profile', async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('sectionId', 'name program batch studentCount');

        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving profile.',
            error: error.message
        });
    }
});

module.exports = router;

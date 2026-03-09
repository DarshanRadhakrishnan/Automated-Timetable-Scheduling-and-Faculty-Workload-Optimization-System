const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');
const Timetable = require('../models/Timetable');
const User = require('../models/User');
const { verifyToken, authorize } = require('../middleware/auth');

// ═════════════════════════════════════════════════════════════
// FACULTY SELF-SERVICE ROUTES  (accessible by faculty role)
// Prefix: /api/faculty/me/...
// ═════════════════════════════════════════════════════════════

// GET /api/faculty/me/slots
// Faculty sees only their own scheduled timetable slots
router.get('/me/slots', verifyToken, authorize(['faculty', 'admin']), async (req, res) => {
    try {
        // Resolve the Faculty profile linked to this user account
        const user = await User.findById(req.user.id).select('facultyId');

        if (!user.facultyId) {
            return res.status(400).json({
                success: false,
                message: 'Your account is not linked to a faculty profile. Contact the administrator.'
            });
        }

        const slots = await Timetable.find({ facultyId: user.facultyId })
            .populate('sectionId', 'name program batch')
            .populate('courseId', 'name code')
            .populate('roomId', 'name capacity')
            .populate('timeslotId', 'day startTime endTime slot')
            .sort({ 'timeslotId.day': 1, 'timeslotId.slot': 1 })
            .lean();

        res.json({
            success: true,
            facultyId: user.facultyId,
            count: slots.length,
            data: slots
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving your slots.',
            error: error.message
        });
    }
});

// GET /api/faculty/me/workload
// Faculty sees their workload distribution summary
router.get('/me/workload', verifyToken, authorize(['faculty', 'admin']), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('facultyId');

        if (!user.facultyId) {
            return res.status(400).json({
                success: false,
                message: 'Your account is not linked to a faculty profile.'
            });
        }

        const facultyProfile = await Faculty.findById(user.facultyId);
        if (!facultyProfile) {
            return res.status(404).json({ success: false, message: 'Faculty profile not found.' });
        }

        // Fetch all assigned slots
        const slots = await Timetable.find({ facultyId: user.facultyId })
            .populate('courseId', 'name code')
            .populate('sectionId', 'name')
            .populate('timeslotId', 'day startTime endTime slot')
            .lean();

        // Calculate workload per day
        const perDay = {};
        const perCourse = {};
        for (const slot of slots) {
            const day = slot.timeslotId?.day || 'Unknown';
            const courseName = slot.courseId?.name || 'Unknown';
            perDay[day] = (perDay[day] || 0) + 1;
            perCourse[courseName] = (perCourse[courseName] || 0) + 1;
        }

        const totalAssigned = slots.length;
        const maxLoad = facultyProfile.maxLoad || 0;
        const utilizationPct = maxLoad > 0 ? Math.round((totalAssigned / maxLoad) * 100) : null;

        res.json({
            success: true,
            data: {
                faculty: {
                    id: facultyProfile._id,
                    name: facultyProfile.name,
                    department: facultyProfile.department,
                    maxLoad
                },
                workload: {
                    totalAssignedSlots: totalAssigned,
                    maxLoad,
                    utilizationPercent: utilizationPct,
                    perDay,
                    perCourse
                },
                slots
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error computing workload.',
            error: error.message
        });
    }
});

// GET /api/faculty/me/profile
// Faculty views their own profile
router.get('/me/profile', verifyToken, authorize(['faculty', 'admin']), async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('facultyId', 'name email department maxLoad');

        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching profile.', error: error.message });
    }
});

// GET /api/faculty/me/slots/day/:day
// Faculty views their slots for a specific day
router.get('/me/slots/day/:day', verifyToken, authorize(['faculty', 'admin']), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('facultyId');

        if (!user.facultyId) {
            return res.status(400).json({ success: false, message: 'No faculty profile linked.' });
        }

        const allSlots = await Timetable.find({ facultyId: user.facultyId })
            .populate('sectionId', 'name')
            .populate('courseId', 'name code')
            .populate('roomId', 'name')
            .populate('timeslotId', 'day startTime endTime slot')
            .lean();

        const day = req.params.day.toLowerCase();
        const filtered = allSlots.filter(s => s.timeslotId?.day?.toLowerCase() === day);

        res.json({ success: true, day: req.params.day, count: filtered.length, data: filtered });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving slots for this day.', error: error.message });
    }
});

// ═════════════════════════════════════════════════════════════
// ADMIN-ONLY Faculty CRUD
// ═════════════════════════════════════════════════════════════

// GET /api/faculty  — list all faculties (admin only)
router.get('/', verifyToken, authorize(['admin']), async (req, res) => {
    try {
        const faculties = await Faculty.find();
        res.json({ message: 'Faculties retrieved successfully', count: faculties.length, data: faculties });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving faculties', error: error.message });
    }
});

// GET /api/faculty/:id  — get single faculty (admin only)
router.get('/:id', verifyToken, authorize(['admin']), async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
        res.json({ message: 'Faculty retrieved successfully', data: faculty });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving faculty', error: error.message });
    }
});

// POST /api/faculty  — create faculty profile (admin only)
router.post('/', verifyToken, authorize(['admin']), async (req, res) => {
    try {
        const faculty = new Faculty(req.body);
        await faculty.save();
        res.status(201).json({ message: 'Faculty created successfully', data: faculty });
    } catch (error) {
        res.status(400).json({ message: 'Error creating faculty', error: error.message });
    }
});

// PUT /api/faculty/:id  — update faculty (admin only)
router.put('/:id', verifyToken, authorize(['admin']), async (req, res) => {
    try {
        const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
        res.json({ message: 'Faculty updated successfully', data: faculty });
    } catch (error) {
        res.status(400).json({ message: 'Error updating faculty', error: error.message });
    }
});

// DELETE /api/faculty/:id  — delete faculty (admin only)
router.delete('/:id', verifyToken, authorize(['admin']), async (req, res) => {
    try {
        const faculty = await Faculty.findByIdAndDelete(req.params.id);
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
        res.json({ message: 'Faculty deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting faculty', error: error.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken, authorize } = require('../middleware/auth');

// All routes: must be authenticated AND admin
router.use(verifyToken);
router.use(authorize(['admin']));

// ─────────────────────────────────────────────
// GET /api/admin/users
// List all users (with optional role filter)
// Query: ?role=student|faculty|admin
// ─────────────────────────────────────────────
router.get('/users', async (req, res) => {
    try {
        const filter = {};
        if (req.query.role) filter.role = req.query.role;

        const users = await User.find(filter)
            .select('-password')
            .populate('sectionId', 'name program batch')
            .populate('facultyId', 'name department maxLoad');

        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching users.', error: error.message });
    }
});

// ─────────────────────────────────────────────
// GET /api/admin/users/:id
// Get a single user's details
// ─────────────────────────────────────────────
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('sectionId', 'name program batch studentCount')
            .populate('facultyId', 'name email department maxLoad');

        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching user.', error: error.message });
    }
});

// ─────────────────────────────────────────────
// PUT /api/admin/users/:id
// Update a user's role, sectionId, or facultyId
// Body: { role?, sectionId?, facultyId? }
// ─────────────────────────────────────────────
router.put('/users/:id', async (req, res) => {
    try {
        const allowed = ['role', 'sectionId', 'facultyId', 'username', 'email'];
        const updates = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }

        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
            .select('-password')
            .populate('sectionId', 'name program batch')
            .populate('facultyId', 'name department');

        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        res.json({ success: true, message: 'User updated successfully.', data: user });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error updating user.', error: error.message });
    }
});

// ─────────────────────────────────────────────
// DELETE /api/admin/users/:id
// Delete a user account
// ─────────────────────────────────────────────
router.delete('/users/:id', async (req, res) => {
    try {
        // Prevent self-deletion
        if (req.params.id === req.user.id) {
            return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        res.json({ success: true, message: `User "${user.username}" deleted successfully.` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting user.', error: error.message });
    }
});

// ─────────────────────────────────────────────
// GET /api/admin/users/stats
// Summary: count of users per role
// ─────────────────────────────────────────────
router.get('/stats', async (req, res) => {
    try {
        const [total, admins, faculty, students] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'admin' }),
            User.countDocuments({ role: 'faculty' }),
            User.countDocuments({ role: 'student' })
        ]);

        res.json({
            success: true,
            data: { total, admins, faculty, students }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching user stats.', error: error.message });
    }
});

module.exports = router;

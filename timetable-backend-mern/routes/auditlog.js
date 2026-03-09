const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { verifyToken, authorize } = require('../middleware/auth');

// All audit routes require authentication + admin role
router.use(verifyToken);
router.use(authorize(['admin']));

// GET /api/auditlog - paginated list of audit logs
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.action) filter.action = { $regex: req.query.action, $options: 'i' };
        if (req.query.target) filter.target = { $regex: req.query.target, $options: 'i' };

        const [logs, total] = await Promise.all([
            AuditLog.find(filter)
                .populate('user', 'username email role')
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            AuditLog.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: logs,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch audit logs', error: error.message });
    }
});

// DELETE /api/auditlog - clear all audit logs (super admin)
router.delete('/', async (req, res) => {
    try {
        await AuditLog.deleteMany({});
        res.json({ success: true, message: 'All audit logs cleared.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to clear logs', error: error.message });
    }
});

module.exports = router;

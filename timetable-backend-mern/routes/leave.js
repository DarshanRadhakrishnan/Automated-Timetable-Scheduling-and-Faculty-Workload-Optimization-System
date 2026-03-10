const router = require('express').Router();
const Leave = require('../models/Leave');
const { verifyToken, authorize } = require('../middleware/auth');

// Apply for leave (Faculty only)
router.post('/', verifyToken, authorize(['faculty']), async (req, res) => {
    try {
        const { startDate, endDate, reason } = req.body;
        if (!startDate || !endDate || !reason) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const newLeave = new Leave({
            facultyId: req.user.facultyId || req.body.facultyId, // get from token or body
            startDate,
            endDate,
            reason
        });

        // if req.user.facultyId is not populated during verifyToken, we should fetch User to get facultyId
        // let's do an explicit fetch just in case
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'faculty' || !user.facultyId) {
            return res.status(403).json({ message: 'Faculty profile not found.' });
        }

        newLeave.facultyId = user.facultyId;

        const savedLeave = await newLeave.save();
        res.status(201).json(savedLeave);
    } catch (err) {
        res.status(500).json({ message: 'Failed to apply for leave.', error: err.message });
    }
});

// Get My Leaves (Faculty only)
router.get('/my', verifyToken, authorize(['faculty']), async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        if (!user || !user.facultyId) return res.status(403).json({ message: 'Faculty not found.' });

        const leaves = await Leave.find({ facultyId: user.facultyId }).sort({ createdAt: -1 });
        res.status(200).json(leaves);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get All Leaves (Admin only)
router.get('/', verifyToken, authorize(['admin']), async (req, res) => {
    try {
        const leaves = await Leave.find().populate('facultyId', 'name department').sort({ createdAt: -1 });
        res.status(200).json(leaves);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Leave Status (Admin only)
router.put('/:id/status', verifyToken, authorize(['admin']), async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status.' });
        }

        const leave = await Leave.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('facultyId', 'name');
        if (!leave) return res.status(404).json({ message: 'Leave request not found.' });

        res.status(200).json(leave);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

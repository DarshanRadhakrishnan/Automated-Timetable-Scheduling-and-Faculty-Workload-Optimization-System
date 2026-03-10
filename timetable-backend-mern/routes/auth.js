const router = require('express').Router();
const User = require('../models/User');
const Faculty = require('../models/Faculty');
const Section = require('../models/Section');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken, authorize } = require('../middleware/auth');

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

const signToken = (user) =>
    jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || 'secretKey',
        { expiresIn: '5d' }
    );

// ─────────────────────────────────────────────
// REGISTER — STUDENT
// POST /api/auth/register/student
// Body: { username, email, password, sectionId }
// ─────────────────────────────────────────────
router.post('/register/student', async (req, res) => {
    try {
        const { username, email, password, sectionId } = req.body;

        if (!username || !email || !password || !sectionId) {
            return res.status(400).json({ message: 'username, email, password, and sectionId are required.' });
        }

        // Validate the section exists
        const section = await Section.findById(sectionId);
        if (!section) {
            return res.status(404).json({ message: `Section with id "${sectionId}" not found.` });
        }

        const hashedPassword = await hashPassword(password);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: 'student',
            sectionId
        });

        const user = await newUser.save();
        const accessToken = signToken(user);
        const { password: _p, ...userInfo } = user._doc;

        res.status(201).json({
            message: 'Student registered successfully.',
            user: { ...userInfo, section: { _id: section._id, name: section.name } },
            accessToken
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Email or username already in use.' });
        }
        res.status(500).json({ message: 'Registration failed.', error: err.message });
    }
});

// ─────────────────────────────────────────────
// REGISTER — FACULTY
// POST /api/auth/register/faculty
// Body: { username, email, password, facultyId }
// ─────────────────────────────────────────────
router.post('/register/faculty', async (req, res) => {
    try {
        const { username, email, password, facultyId } = req.body;

        if (!username || !email || !password || !facultyId) {
            return res.status(400).json({ message: 'username, email, password, and facultyId are required.' });
        }

        // Validate the faculty profile exists
        const facultyProfile = await Faculty.findById(facultyId);
        if (!facultyProfile) {
            return res.status(404).json({ message: `Faculty profile with id "${facultyId}" not found.` });
        }

        // Prevent one faculty profile from having multiple user accounts
        const existing = await User.findOne({ facultyId });
        if (existing) {
            return res.status(409).json({ message: 'A user account already exists for this faculty profile.' });
        }

        const hashedPassword = await hashPassword(password);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: 'faculty',
            facultyId
        });

        const user = await newUser.save();
        const accessToken = signToken(user);
        const { password: _p, ...userInfo } = user._doc;

        res.status(201).json({
            message: 'Faculty user registered successfully.',
            user: { ...userInfo, facultyProfile: { _id: facultyProfile._id, name: facultyProfile.name, department: facultyProfile.department } },
            accessToken
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Email or username already in use.' });
        }
        res.status(500).json({ message: 'Registration failed.', error: err.message });
    }
});

// ─────────────────────────────────────────────
// REGISTER — ADMIN  (protected: existing admin only)
// POST /api/auth/register/admin
// Headers: Authorization: Bearer <token>
// Body: { username, email, password }
// ─────────────────────────────────────────────
router.post('/register/admin', verifyToken, authorize(['admin']), async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'username, email, and password are required.' });
        }

        const hashedPassword = await hashPassword(password);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: 'admin'
        });

        const user = await newUser.save();
        const { password: _p, ...userInfo } = user._doc;

        res.status(201).json({
            message: 'Admin user registered successfully.',
            user: userInfo
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Email or username already in use.' });
        }
        res.status(500).json({ message: 'Registration failed.', error: err.message });
    }
});

// ─────────────────────────────────────────────
// OPEN REGISTER — Create Users (Admin / Faculty)
// POST /api/auth/register/open
// Body: { username, email, password, role, department, maxLoad }
// ─────────────────────────────────────────────
router.post('/register/open', async (req, res) => {
    try {
        const { username, email, password, role, department, maxLoad } = req.body;

        if (!username || !email || !password || !role) {
            return res.status(400).json({ message: 'username, email, password, and role are required.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists.' });
        }

        const hashedPassword = await hashPassword(password);

        if (role === 'faculty') {
            const newFac = new Faculty({ name: username, email, department: department || 'General', maxLoad: maxLoad || 15 });
            const savedFac = await newFac.save();

            const newUser = new User({
                username,
                email,
                password: hashedPassword,
                role: 'faculty',
                facultyId: savedFac._id
            });
            const user = await newUser.save();
            const accessToken = signToken(user);
            const { password: _p, ...userInfo } = user._doc;
            return res.status(201).json({ ...userInfo, accessToken });
        } else if (role === 'admin') {
            const newUser = new User({
                username,
                email,
                password: hashedPassword,
                role: 'admin'
            });
            const user = await newUser.save();
            const accessToken = signToken(user);
            const { password: _p, ...userInfo } = user._doc;
            return res.status(201).json({ ...userInfo, accessToken });
        } else {
            return res.status(400).json({ message: 'Role must be admin or faculty.' });
        }
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Email or username already in use.' });
        }
        res.status(500).json({ message: 'Registration failed.', error: err.message });
    }
});

// ─────────────────────────────────────────────
// LOGIN
// POST /api/auth/login
// Body: { email, password }
// ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Wrong password.' });

        const accessToken = signToken(user);
        const { password, ...others } = user._doc;
        res.status(200).json({ ...others, accessToken });
    } catch (err) {
        res.status(500).json(err);
    }
});

// ─────────────────────────────────────────────
// GET CURRENT USER PROFILE
// GET /api/auth/me
// Headers: Authorization: Bearer <token>
// ─────────────────────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('sectionId', 'name program batch studentCount')
            .populate('facultyId', 'name email department maxLoad');

        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch profile.', error: err.message });
    }
});

module.exports = router;

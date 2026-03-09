/**
 * Run this once to create the default admin user:
 *   node scripts/seedAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/database');

async function seed() {
    await connectDB();

    const existing = await User.findOne({ email: 'admin@timetable.com' });
    if (existing) {
        console.log('✅  Admin user already exists:', existing.email);
        process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('Admin@123', salt);

    const admin = new User({
        username: 'admin',
        email: 'admin@timetable.com',
        password,
        role: 'admin',
    });

    await admin.save();
    console.log('✅  Admin user created  →  admin@timetable.com / Admin@123');
    process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });

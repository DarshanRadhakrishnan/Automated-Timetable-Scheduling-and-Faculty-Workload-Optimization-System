const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'faculty', 'student'],
        default: 'student'
    },
    // For students: links to their Section (class group)
    sectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
        default: null
    },
    // For faculty: links to their Faculty profile
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);

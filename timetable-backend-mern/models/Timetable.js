const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    sectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
        required: true,
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true,
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
    },
    timeslotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimeSlot',
        required: true,
    },
    proposalId: {
        type: Number,
        required: true,
        default: 1
    },
    score: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Timetable', timetableSchema);

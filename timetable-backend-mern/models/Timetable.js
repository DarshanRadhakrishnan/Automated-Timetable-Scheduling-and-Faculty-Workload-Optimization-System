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

// ── Performance indexes ──────────────────────────────────────
// These compound indexes cover the most common query patterns
// (conflict detection, filtering by proposal, resource-availability checks)
timetableSchema.index({ proposalId: 1 });
timetableSchema.index({ proposalId: 1, timeslotId: 1 });
timetableSchema.index({ facultyId: 1, timeslotId: 1, proposalId: 1 });
timetableSchema.index({ roomId: 1, timeslotId: 1, proposalId: 1 });
timetableSchema.index({ sectionId: 1, timeslotId: 1, proposalId: 1 });
timetableSchema.index({ timeslotId: 1, proposalId: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);

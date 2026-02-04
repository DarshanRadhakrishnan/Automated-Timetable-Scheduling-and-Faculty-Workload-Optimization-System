const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    roomType: {
        type: String,
        enum: ['theory', 'lab'],
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Room', roomSchema);

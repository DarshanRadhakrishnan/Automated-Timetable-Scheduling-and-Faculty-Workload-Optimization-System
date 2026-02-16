require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
// Connect to MongoDB handled in startup or tests

// Routes
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/course', require('./routes/course'));
app.use('/api/room', require('./routes/room'));
app.use('/api/section', require('./routes/section'));
app.use('/api/timeslot', require('./routes/timeslot'));
app.use('/api/availability', require('./routes/availability'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/conflicts', require('./conflicts'));
app.use('/api/rescheduling', require('./routes/rescheduling'));
app.use('/api/analysis', require('./routes/analysis'));

// Health check
app.get('/', (req, res) => {
    res.json({
        message: 'Timetable API is running',
        version: '1.0.0',
        endpoints: {
            faculty: '/api/faculty',
            course: '/api/course',
            room: '/api/room',
            section: '/api/section',
            timeslot: '/api/timeslot',
            availability: '/api/availability',
            timetable: '/api/timetable'
        }
    });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    connectDB();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;

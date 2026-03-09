const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Mock Data
let faculties = [];
let courses = [];
let rooms = [];
let sections = [];
let timeslots = [];
let timetables = [];

// Helper function to simulate delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Routes
app.get('/api/faculty', async (req, res) => {
    await delay(500);
    res.json(faculties);
});

app.post('/api/faculty', async (req, res) => {
    await delay(500);
    const newFaculty = { id: Date.now().toString(), ...req.body };
    faculties.push(newFaculty);
    res.json(newFaculty);
});

app.put('/api/faculty/:id', async (req, res) => {
    const { id } = req.params;
    const index = faculties.findIndex(f => f.id === id);
    if (index !== -1) {
        faculties[index] = { ...faculties[index], ...req.body };
        res.json(faculties[index]);
    } else {
        res.status(404).json({ message: 'Faculty not found' });
    }
});

app.delete('/api/faculty/:id', async (req, res) => {
    const { id } = req.params;
    faculties = faculties.filter(f => f.id !== id);
    res.json({ message: 'Faculty deleted' });
});

// Course Routes
app.get('/api/course', async (req, res) => {
    await delay(500);
    res.json(courses);
});

app.post('/api/course', async (req, res) => {
    await delay(500);
    const newCourse = { id: Date.now().toString(), ...req.body };
    courses.push(newCourse);
    res.json(newCourse);
});

// Room Routes
app.get('/api/room', async (req, res) => {
    await delay(500);
    res.json(rooms);
});

app.post('/api/room', async (req, res) => {
    await delay(500);
    const newRoom = { id: Date.now().toString(), ...req.body };
    rooms.push(newRoom);
    res.json(newRoom);
});

// Section Routes
app.get('/api/section', async (req, res) => {
    await delay(500);
    res.json(sections);
});

app.post('/api/section', async (req, res) => {
    await delay(500);
    const newSection = { id: Date.now().toString(), ...req.body };
    sections.push(newSection);
    res.json(newSection);
});

// Timeslot Routes
app.get('/api/timeslot', async (req, res) => {
    await delay(500);
    res.json(timeslots);
});

app.post('/api/timeslot', async (req, res) => {
    await delay(500);
    const newTimeslot = { id: Date.now().toString(), ...req.body };
    timeslots.push(newTimeslot);
    res.json(newTimeslot);
});

// Timetable Routes
app.get('/api/timetable', async (req, res) => {
    await delay(500);
    res.json(timetables);
});

app.post('/api/timetable/generate', async (req, res) => {
    await delay(1000);
    // Mock generation logic
    timetables = [
        { id: '1', courseId: 'C1', facultyId: 'F1', roomId: 'R1', timeslotId: 'T1', sectionId: 'S1' }
    ];
    res.json({ message: 'Timetable generated successfully', timetables });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});

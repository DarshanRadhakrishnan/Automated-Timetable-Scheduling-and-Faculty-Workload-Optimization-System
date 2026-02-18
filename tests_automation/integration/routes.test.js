const request = require('supertest');
const express = require('express');
const facultyRouter = require('../../timetable-backend-mern/routes/faculty');
const timetableRouter = require('../../timetable-backend-mern/routes/timetable');

// Mock Models
const Faculty = require('../../timetable-backend-mern/models/Faculty');
const Section = require('../../timetable-backend-mern/models/Section');
const Course = require('../../timetable-backend-mern/models/Course');
const Room = require('../../timetable-backend-mern/models/Room');
const TimeSlot = require('../../timetable-backend-mern/models/TimeSlot');
const Timetable = require('../../timetable-backend-mern/models/Timetable');

jest.mock('../../timetable-backend-mern/models/Faculty');
jest.mock('../../timetable-backend-mern/models/Section');
jest.mock('../../timetable-backend-mern/models/Course');
jest.mock('../../timetable-backend-mern/models/Room');
jest.mock('../../timetable-backend-mern/models/TimeSlot');
jest.mock('../../timetable-backend-mern/models/Timetable');

// Mock Services
jest.mock('../../timetable-backend-mern/services/timetableGenerator', () => ({
    generateTimetable: jest.fn().mockResolvedValue({
        bestSchedule: [],
        rankings: []
    })
}));
jest.mock('../../timetable-backend-mern/services/conflictDetector', () => ({
    detectConflicts: jest.fn().mockResolvedValue([])
}));
jest.mock('../../timetable-backend-mern/services/conflictResolver', () => ({
    resolveConflicts: jest.fn().mockResolvedValue({ success: true, message: 'Resolved' })
}));

const app = express();
app.use(express.json());
app.use('/api/faculty', facultyRouter);
app.use('/api/timetable', timetableRouter);

describe('Integration Tests - Routes', () => {

    describe('GET /api/faculty', () => {
        test('should return all faculties', async () => {
            const mockFaculties = [{ name: 'Dr. Smith', _id: '123' }];
            Faculty.find.mockResolvedValue(mockFaculties);

            const res = await request(app).get('/api/faculty');

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toEqual(mockFaculties);
            expect(Faculty.find).toHaveBeenCalled();
        });
    });

    describe('POST /api/timetable/generate', () => {
        test('should trigger generation', async () => {
            // Mock dependency returns
            Section.find.mockResolvedValue([]);
            Course.find.mockResolvedValue([]);
            Faculty.find.mockResolvedValue([]);
            Room.find.mockResolvedValue([]);
            TimeSlot.find.mockResolvedValue([]);

            const res = await request(app).post('/api/timetable/generate');

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toContain('Timetable generated successfully');
        });
    });
});

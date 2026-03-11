const request = require('supertest');

// Mock Database Connection
jest.mock('../config/database', () => jest.fn());

// Mock Auth Middleware
jest.mock('../middleware/auth', () => ({
    verifyToken: (req, res, next) => {
        req.user = { id: 'testAdminId', role: 'admin' };
        next();
    },
    authorize: () => (req, res, next) => next()
}));

const app = require('../index');
const Section = require('../models/Section');
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');
const Room = require('../models/Room');
const TimeSlot = require('../models/TimeSlot');
const FacultyAvailability = require('../models/FacultyAvailability');
const Timetable = require('../models/Timetable');
const { generateTimetable } = require('../services/timetableGenerator');

// Mock Mongoose Models
jest.mock('../models/Section');
jest.mock('../models/Course');
jest.mock('../models/Faculty');
jest.mock('../models/Room');
jest.mock('../models/TimeSlot');
jest.mock('../models/FacultyAvailability');
jest.mock('../models/Timetable');

// Mock Service
jest.mock('../services/timetableGenerator');
jest.mock('../services/conflictDetector');
jest.mock('../services/conflictResolver');

describe('API Endpoints - Comprehensive Test Suite', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ========================================
    // TimeSlot API Tests (/api/timeslot)
    // ========================================
    describe('TimeSlot API Endpoints', () => {

        describe('GET /api/timeslot', () => {
            it('should get all timeslots', async () => {
                const mockTimeslots = [
                    { _id: 't1', day: 'Monday', startTime: '09:00', endTime: '10:00', slot: 1 },
                    { _id: 't2', day: 'Monday', startTime: '10:00', endTime: '11:00', slot: 2 }
                ];
                TimeSlot.find.mockResolvedValue(mockTimeslots);

                const res = await request(app).get('/api/timeslot');

                expect(res.statusCode).toEqual(200);
                expect(res.body.data).toHaveLength(2);
                expect(TimeSlot.find).toHaveBeenCalled();
            });

            it('should handle errors when fetching all timeslots', async () => {
                TimeSlot.find.mockRejectedValue(new Error('Database error'));

                const res = await request(app).get('/api/timeslot');

                expect(res.statusCode).toEqual(500);
            });
        });

        describe('GET /api/timeslot/:id', () => {
            it('should get a single timeslot by ID', async () => {
                const mockTimeslot = { _id: 't1', day: 'Monday', startTime: '09:00', endTime: '10:00', slot: 1 };
                TimeSlot.findById.mockResolvedValue(mockTimeslot);

                const res = await request(app).get('/api/timeslot/t1');

                expect(res.statusCode).toEqual(200);
                expect(res.body.data._id).toBe('t1');
                expect(TimeSlot.findById).toHaveBeenCalledWith('t1');
            });

            it('should return 404 if timeslot not found', async () => {
                TimeSlot.findById.mockResolvedValue(null);

                const res = await request(app).get('/api/timeslot/nonexistent');

                expect(res.statusCode).toEqual(404);
            });
        });

        describe('PUT /api/timeslot/:id', () => {
            it('should update an existing timeslot', async () => {
                const updatedTimeslot = { _id: 't1', day: 'Wednesday', startTime: '09:00', endTime: '10:00', slot: 1 };
                TimeSlot.findByIdAndUpdate.mockResolvedValue(updatedTimeslot);

                const res = await request(app)
                    .put('/api/timeslot/t1')
                    .send({ day: 'Wednesday' });

                expect(res.statusCode).toEqual(200);
                expect(res.body.data.day).toBe('Wednesday');
            });

            it('should return 404 if timeslot to update not found', async () => {
                TimeSlot.findByIdAndUpdate.mockResolvedValue(null);

                const res = await request(app)
                    .put('/api/timeslot/nonexistent')
                    .send({ day: 'Thursday' });

                expect(res.statusCode).toEqual(404);
            });
        });

        describe('DELETE /api/timeslot/:id', () => {
            it('should delete a timeslot', async () => {
                TimeSlot.findByIdAndDelete.mockResolvedValue({ _id: 't1' });

                const res = await request(app).delete('/api/timeslot/t1');

                expect(res.statusCode).toEqual(200);
                expect(TimeSlot.findByIdAndDelete).toHaveBeenCalledWith('t1');
            });

            it('should return 404 if timeslot to delete not found', async () => {
                TimeSlot.findByIdAndDelete.mockResolvedValue(null);

                const res = await request(app).delete('/api/timeslot/nonexistent');

                expect(res.statusCode).toEqual(404);
            });
        });
    });

    // ========================================
    // Availability API Tests (/api/availability)
    // ========================================
    describe('Availability API Endpoints', () => {

        describe('GET /api/availability/faculty/:facultyId', () => {
            it('should get availability for a specific faculty', async () => {
                const mockAvailability = [
                    { _id: 'a1', facultyId: 'f1', timeslotId: 't1', isAvailable: true },
                    { _id: 'a2', facultyId: 'f1', timeslotId: 't2', isAvailable: true }
                ];
                FacultyAvailability.find.mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockAvailability)
                });

                const res = await request(app).get('/api/availability/faculty/f1');

                expect(res.statusCode).toEqual(200);
                expect(res.body.data).toHaveLength(2);
            });

            it('should return empty array if no availability found for faculty', async () => {
                FacultyAvailability.find.mockReturnValue({
                    populate: jest.fn().mockResolvedValue([])
                });

                const res = await request(app).get('/api/availability/faculty/f999');

                expect(res.statusCode).toEqual(200);
                expect(res.body.data).toHaveLength(0);
            });
        });

        describe('PUT /api/availability/:id', () => {
            it('should update an existing availability record', async () => {
                const updatedAvailability = { _id: 'a1', facultyId: 'f1', timeslotId: 't1', isAvailable: false };
                FacultyAvailability.findByIdAndUpdate.mockResolvedValue(updatedAvailability);

                const res = await request(app)
                    .put('/api/availability/a1')
                    .send({ isAvailable: false });

                expect(res.statusCode).toEqual(200);
                expect(res.body.data.isAvailable).toBe(false);
            });

            it('should return 404 if availability record to update not found', async () => {
                FacultyAvailability.findByIdAndUpdate.mockResolvedValue(null);

                const res = await request(app)
                    .put('/api/availability/nonexistent')
                    .send({ isAvailable: true });

                expect(res.statusCode).toEqual(404);
            });
        });

        describe('DELETE /api/availability/:id', () => {
            it('should delete an availability record', async () => {
                FacultyAvailability.findByIdAndDelete.mockResolvedValue({ _id: 'a1' });

                const res = await request(app).delete('/api/availability/a1');

                expect(res.statusCode).toEqual(200);
                expect(FacultyAvailability.findByIdAndDelete).toHaveBeenCalledWith('a1');
            });

            it('should return 404 if availability record to delete not found', async () => {
                FacultyAvailability.findByIdAndDelete.mockResolvedValue(null);

                const res = await request(app).delete('/api/availability/nonexistent');

                expect(res.statusCode).toEqual(404);
            });
        });
    });

    // ========================================
    // Timetable API Tests (/api/timetable)
    // ========================================
    describe('Timetable API Endpoints', () => {

        describe('POST /api/timetable/generate', () => {
            it('should generate a timetable successfully', async () => {
                // Setup Mocks
                Section.find.mockResolvedValue([{ _id: 's1' }]);
                Course.find.mockResolvedValue([{ _id: 'c1' }]);
                Faculty.find.mockResolvedValue([{ _id: 'f1' }]);
                Room.find.mockResolvedValue([{ _id: 'r1' }]);
                TimeSlot.find.mockResolvedValue([{ _id: 't1' }]);

                generateTimetable.mockResolvedValue({
                    bestSchedule: [{ id: 'entry1' }],
                    rankings: [{ rank: 1, score: 100 }]
                });

                // Make Request
                const res = await request(app).post('/api/timetable/generate');

                // Assertions
                expect(res.statusCode).toEqual(200);
                expect(res.body.message).toBe('Timetable generated successfully');
                expect(res.body.entries).toBe(1);
                expect(res.body.rankings).toHaveLength(1);

                // Verify Service was called
                expect(generateTimetable).toHaveBeenCalled();
            });

            it('should handle errors gracefully', async () => {
                // Setup Error Mock
                Section.find.mockRejectedValue(new Error('Database error'));

                const res = await request(app).post('/api/timetable/generate');

                expect(res.statusCode).toEqual(500);
                expect(res.body.message).toBe('Error generating timetable');
            });
        });

        describe('GET /api/timetable/versions', () => {
            it('should get available timetable versions', async () => {
                const mockVersions = [
                    { _id: 'p1', score: 95, entryCount: 10, updatedAt: new Date() },
                    { _id: 'p2', score: 90, entryCount: 10, updatedAt: new Date() }
                ];
                Timetable.aggregate.mockResolvedValue(mockVersions);

                const res = await request(app).get('/api/timetable/versions');

                expect(res.statusCode).toEqual(200);
                expect(res.body.data).toHaveLength(2);
            });

            it('should handle errors when fetching versions', async () => {
                Timetable.aggregate.mockRejectedValue(new Error('Database error'));

                const res = await request(app).get('/api/timetable/versions');

                expect(res.statusCode).toEqual(500);
            });
        });

        describe('DELETE /api/timetable', () => {
            it('should delete all timetable entries', async () => {
                Timetable.deleteMany.mockResolvedValue({ deletedCount: 10 });

                const res = await request(app).delete('/api/timetable');

                expect(res.statusCode).toEqual(200);
                expect(res.body.message).toContain('deleted');
                expect(Timetable.deleteMany).toHaveBeenCalled();
            });

            it('should handle errors when deleting all entries', async () => {
                Timetable.deleteMany.mockRejectedValue(new Error('Database error'));

                const res = await request(app).delete('/api/timetable');

                expect(res.statusCode).toEqual(500);
            });
        });

        describe('POST /api/timetable/conflicts/detect', () => {
            const { detectConflicts } = require('../services/conflictDetector');

            it('should support proposalId filter for conflict detection', async () => {
                detectConflicts.mockResolvedValue([]);

                const res = await request(app).post('/api/timetable/conflicts/detect?proposalId=p1');

                expect(res.statusCode).toEqual(200);
            });
        });

        describe('POST /api/timetable/conflicts/resolve', () => {
            const { resolveConflicts } = require('../services/conflictResolver');

            it('should resolve conflicts automatically', async () => {
                resolveConflicts.mockResolvedValue({
                    success: true,
                    message: 'Conflicts resolved successfully'
                });

                const res = await request(app).post('/api/timetable/conflicts/resolve?proposalId=p1');

                expect(res.statusCode).toEqual(200);
                expect(res.body.message).toContain('resolved');
            });

            it('should support proposalId filter for conflict resolution', async () => {
                resolveConflicts.mockResolvedValue({
                    success: true,
                    message: 'No conflicts found'
                });

                const res = await request(app).post('/api/timetable/conflicts/resolve?proposalId=p1');

                expect(res.statusCode).toEqual(200);
            });

            it('should handle errors during conflict resolution', async () => {
                resolveConflicts.mockRejectedValue(new Error('Database error'));

                const res = await request(app).post('/api/timetable/conflicts/resolve?proposalId=p1');

                expect(res.statusCode).toEqual(500);
            });
        });
    });
});

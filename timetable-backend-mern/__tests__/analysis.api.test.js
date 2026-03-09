const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index'); // Ensure index.js exports app

// Import models for setup
const Faculty = require('../models/Faculty');
const Room = require('../models/Room');
const Timetable = require('../models/Timetable');
const Section = require('../models/Section');

describe('Impact Analysis API - Integration Tests', () => {
    let testFacultyId;
    let testRoomId;
    let testSectionId;

    // Setup test database
    beforeAll(async () => {
        jest.setTimeout(30000); // Increase timeout to 30s
        // Connect to a test database - force IPv4
        const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/timetable_test';
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000 // Fail fast if no connection
        });

        // Clear existing data
        await Faculty.deleteMany({});
        await Room.deleteMany({});
        await Timetable.deleteMany({});
        await Section.deleteMany({});

        // Create test data
        // 1. Faculty
        const faculty = await Faculty.create({
            name: 'Dr. Test Faculty',
            maxLoad: 18,
            // Only add fields if schema supports them (schema is strict by default usually, but Mongoose ignores unknown fields unless strict: true)
            // Assuming strict schema from file view previously (default)
        });
        testFacultyId = faculty._id;

        // 2. Room
        const room = await Room.create({
            name: 'Room 101',
            roomType: 'theory',
            capacity: 60
        });
        testRoomId = room._id;

        // 3. Section
        const section = await Section.create({
            name: 'CS-A',
            studentCount: 50
        });
        testSectionId = section._id;

        // 4. Timetable Entries
        await Timetable.create({
            facultyId: testFacultyId,
            roomId: testRoomId,
            sectionId: testSectionId,
            courseId: new mongoose.Types.ObjectId(), // Mock course ID
            timeslotId: new mongoose.Types.ObjectId(), // Mock timeslot ID
            proposalId: 1
        });
    }, 30000);

    afterAll(async () => {
        // Clean up
        await mongoose.connection.close();
    });

    // GROUP 1: Faculty Impact Endpoint
    describe('POST /api/analysis/faculty-impact', () => {
        test('should return 200 for valid faculty ID', async () => {
            const res = await request(app)
                .post('/api/analysis/faculty-impact')
                .send({ facultyId: testFacultyId.toString() });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('metadata');
            expect(res.body).toHaveProperty('faculty');
            expect(res.body).toHaveProperty('impact');
            expect(res.body).toHaveProperty('recommendations');
            expect(res.body).toHaveProperty('affectedClasses');
        });

        test('should return correct faculty details', async () => {
            const res = await request(app)
                .post('/api/analysis/faculty-impact')
                .send({ facultyId: testFacultyId.toString() });

            expect(res.body.faculty.name).toBe('Dr. Test Faculty');
            // Assuming we allow 'N/A' defaults
        });

        test('should calculate impact score correctly', async () => {
            const res = await request(app)
                .post('/api/analysis/faculty-impact')
                .send({ facultyId: testFacultyId.toString() });

            // 1 class * 2 + 50 students / 20 = 2 + 2.5 = 4.5
            expect(res.body.impact.score).toBe(4.5);
            expect(res.body.impact.severity).toBe('MEDIUM');
        });

        test('should return appropriate recommendations', async () => {
            const res = await request(app)
                .post('/api/analysis/faculty-impact')
                .send({ facultyId: testFacultyId.toString() });

            expect(Array.isArray(res.body.recommendations)).toBe(true);
            expect(res.body.recommendations.length).toBeGreaterThan(0);
        });

        test('should return 400 for missing facultyId', async () => {
            const res = await request(app)
                .post('/api/analysis/faculty-impact')
                .send({});

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
        });

        test('should return 400 for invalid ObjectId format', async () => {
            const res = await request(app)
                .post('/api/analysis/faculty-impact')
                .send({ facultyId: 'invalid123' });

            expect(res.status).toBe(400);
        });

        test('should return 404 for non-existent faculty', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .post('/api/analysis/faculty-impact')
                .send({ facultyId: fakeId.toString() });

            expect(res.status).toBe(404);
        });
    });

    // GROUP 2: Room Shortage Endpoint
    describe('POST /api/analysis/room-shortage', () => {
        test('should return 200 for valid room ID', async () => {
            const res = await request(app)
                .post('/api/analysis/room-shortage')
                .send({ roomId: testRoomId.toString() });

            expect(res.status).toBe(200);
        });

        test('should return alternative rooms', async () => {
            // Create an alternative room first
            await Room.create({
                name: 'Room 102',
                roomType: 'theory',
                capacity: 70
            });

            const res = await request(app)
                .post('/api/analysis/room-shortage')
                .send({ roomId: testRoomId.toString() });

            expect(res.body).toHaveProperty('alternatives');
            expect(Array.isArray(res.body.alternatives)).toBe(true);
            expect(res.body.alternatives.length).toBeGreaterThan(0);
            expect(res.body.alternatives[0].name).toBe('Room 102');
        });

        test('alternatives should have same or greater capacity', async () => {
            const res = await request(app)
                .post('/api/analysis/room-shortage')
                .send({ roomId: testRoomId.toString() });

            const originalCapacity = res.body.room.capacity;
            res.body.alternatives.forEach(alt => {
                expect(alt.capacity).toBeGreaterThanOrEqual(originalCapacity);
            });
        });

        test('should return 400 for missing roomId', async () => {
            const res = await request(app)
                .post('/api/analysis/room-shortage')
                .send({});

            expect(res.status).toBe(400);
        });

        test('should return 404 for non-existent room', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .post('/api/analysis/room-shortage')
                .send({ roomId: fakeId.toString() });

            expect(res.status).toBe(404);
        });
    });

    // GROUP 3: Bulk Faculty Endpoint
    describe('POST /api/analysis/bulk-faculty', () => {
        test('should accept array of faculty IDs', async () => {
            const res = await request(app)
                .post('/api/analysis/bulk-faculty')
                .send({ facultyIds: [testFacultyId.toString()] });

            expect(res.status).toBe(200);
            expect(res.body.summary.totalAnalyzed).toBe(1);
        });

        test('should return summary statistics', async () => {
            const res = await request(app)
                .post('/api/analysis/bulk-faculty')
                .send({ facultyIds: [testFacultyId.toString()] });

            expect(res.body).toHaveProperty('summary');
            expect(res.body.summary).toHaveProperty('averageScore');
        });

        test('should return 400 for missing facultyIds', async () => {
            const res = await request(app)
                .post('/api/analysis/bulk-faculty')
                .send({});

            expect(res.status).toBe(400);
        });

        test('should return 400 for non-array input', async () => {
            const res = await request(app)
                .post('/api/analysis/bulk-faculty')
                .send({ facultyIds: "not-an-array" });

            expect(res.status).toBe(400);
        });

        test('should return 400 for empty array', async () => {
            const res = await request(app)
                .post('/api/analysis/bulk-faculty')
                .send({ facultyIds: [] });

            expect(res.status).toBe(400);
        });
    });
});

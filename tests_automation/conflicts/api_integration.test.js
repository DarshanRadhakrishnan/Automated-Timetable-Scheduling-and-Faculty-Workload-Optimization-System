const request = require('supertest');
const express = require('express');
const timetableRouter = require('../../timetable-backend-mern/routes/timetable');

// Initialize App
const app = express();
app.use(express.json());
// Register routes
app.use('/api/timetable', timetableRouter);

// Mocks
jest.mock('../../timetable-backend-mern/services/conflictDetector', () => ({
    detectConflicts: jest.fn().mockResolvedValue([
        { type: 'faculty', entityId: 'f1', reason: 'Double booked' }
    ])
}));

jest.mock('../../timetable-backend-mern/services/conflictResolver', () => ({
    resolveConflicts: jest.fn().mockResolvedValue({
        success: true,
        message: "Resolved 1 conflict",
        conflictsResolved: 1,
        resolutionLog: [{ action: 'moved', reason: 'test' }]
    })
}));

describe('Conflict API Integration', () => {

    // --- 1. Detect Endpoint ---
    test('POST /api/timetable/conflicts/detect returns found conflicts', async () => {
        const res = await request(app)
            .post('/api/timetable/conflicts/detect')
            .send({ proposalId: 1 });

        expect(res.statusCode).toBe(200);
        expect(res.body.count).toBe(1);
        expect(res.body.data[0].type).toBe('faculty');
    });

    // --- 2. Resolve Endpoint ---
    test('POST /api/timetable/conflicts/resolve triggers resolution', async () => {
        const res = await request(app)
            .post('/api/timetable/conflicts/resolve')
            .send({ proposalId: 1 });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.conflictsResolved).toBe(1);
    });

    // --- 3. Input Validation ---
    test('Resolve endpoint requires proposalId', async () => {
        // Depending on implementation, might default or error
        // Current impl returns 400 if missing
        const res = await request(app).post('/api/timetable/conflicts/resolve').send({});

        expect(res.statusCode).toBe(400); // Expect bad request validation
    });

});

const { detectConflicts } = require('../../timetable-backend-mern/services/conflictDetector');
const Timetable = require('../../timetable-backend-mern/models/Timetable');

jest.mock('../../timetable-backend-mern/models/Timetable');
jest.mock('../../timetable-backend-mern/models/Conflict'); // Also mock Conflict model to avoid DB writes

describe('Conflict Detection Logic', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Helper to mock the initial list retrieval
    const setupSchedule = (entries) => {
        Timetable.find.mockReturnValue({
            // The code awaits Timetable.find(query), so we return a thenable or just use mockResolvedValue if it wasn't for the populate confusion earlier.
            // Since conflictDetector.js Step 196 DOES NOT use populate, simple resolve is best.
            // But if I use mockResolvedValue, I can't chain. 
            // Let's use the most robust: promise-like object.
            then: (resolve) => resolve(entries),
            // In case code changes to use exec() or populate()
            populate: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(entries)
        });
    };

    // --- 1. Basic Functionality ---
    test('should return empty array if no conflicts exist', async () => {
        const cleanSchedule = [
            { _id: 't1', facultyId: 'f1', roomId: 'r1', sectionId: 's1', timeslotId: 'ts1' },
            { _id: 't2', facultyId: 'f2', roomId: 'r2', sectionId: 's2', timeslotId: 'ts1' } // Different resources
        ];
        setupSchedule(cleanSchedule);

        // Mock findOne to return null (no conflicts found)
        Timetable.findOne.mockResolvedValue(null);

        const conflicts = await detectConflicts();
        expect(conflicts).toEqual([]);
    });

    // --- 2. Faculty Conflicts ---
    test('should detect faculty double booking', async () => {
        const badSchedule = [
            { _id: 't1', facultyId: 'f1', timeslotId: 'ts1', proposalId: 'p1' },
            { _id: 't2', facultyId: 'f1', timeslotId: 'ts1', proposalId: 'p1' }
        ];
        setupSchedule(badSchedule);

        // Mock findOne implementation to return conflict ONLY when checking faculty f1 AND not at the end of list
        Timetable.findOne.mockImplementation((query) => {
            const gtConstraint = query._id && query._id.$gt;

            // If we are scanning for conflicts AFTER t2, there are none (schedule only has t1, t2)
            if (gtConstraint === 't2') return Promise.resolve(null);

            // If we are scanning AFTER t1, we should find t2
            if (query.facultyId === 'f1') {
                return Promise.resolve({ _id: 't2' });
            }
            return Promise.resolve(null);
        });

        const result = await detectConflicts('p1');

        // We expect t1 to find t2.
        // t2 scans after itself, finds nothing.
        // So 1 conflict.
        expect(result.length).toBe(1);
        expect(result[0].type).toBe('faculty');
        expect(result[0].entityId).toBe('f1'); // Note: code pushes *query* entityId, which is f1 (from t1)
    });

    // --- 3. Room Conflicts ---
    test('should detect room double booking', async () => {
        const badSchedule = [
            { _id: 't1', roomId: 'r1', timeslotId: 'ts1' },
            { _id: 't2', roomId: 'r1', timeslotId: 'ts1' }
        ];
        setupSchedule(badSchedule);

        Timetable.findOne.mockImplementation((query) => {
            if (query._id && query._id.$gt === 't2') return Promise.resolve(null);

            if (query.roomId === 'r1') return Promise.resolve({ _id: 'conflict' });
            return Promise.resolve(null);
        });

        const result = await detectConflicts();
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('room');
    });

    // --- 4. Section Conflicts ---
    test('should detect section double booking', async () => {
        const badSchedule = [
            { _id: 't1', sectionId: 's1', timeslotId: 'ts1' },
            { _id: 't2', sectionId: 's1', timeslotId: 'ts1' }
        ];
        setupSchedule(badSchedule);

        Timetable.findOne.mockImplementation((query) => {
            if (query._id && query._id.$gt === 't2') return Promise.resolve(null);

            if (query.sectionId === 's1') return Promise.resolve({ _id: 'conflict' });
            return Promise.resolve(null);
        });

        const result = await detectConflicts();
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('section');
    });

    // --- 5. Complex/Multiple Conflicts ---
    test('should detect multiple types of conflicts', async () => {
        const badSchedule = [
            // Entry 1 has faculty f1 AND room r1 conflict
            { _id: 't1', facultyId: 'f1', roomId: 'r1', timeslotId: 'ts1' },
            // This is the "other" entry causing the conflict
            { _id: 't2', facultyId: 'f1', roomId: 'r1', timeslotId: 'ts1' }
        ];
        setupSchedule(badSchedule);

        Timetable.findOne.mockImplementation((query) => {
            if (query._id && query._id.$gt === 't2') return Promise.resolve(null);

            if (query.facultyId === 'f1') return Promise.resolve({ _id: 'c1' });
            if (query.roomId === 'r1') return Promise.resolve({ _id: 'c2' });
            return Promise.resolve(null);
        });

        const result = await detectConflicts();
        // Since t1 triggers both Faculty check and Room check, and both return true
        // It should push 2 conflicts for t1.
        expect(result.length).toBe(2);
        const types = result.map(c => c.type).sort();
        expect(types).toEqual(['faculty', 'room']);
    });

    // --- 6. Missing/Invalid Data ---
    test('should ignore entries with missing references', async () => {
        const messySchedule = [
            // Missing facultyId, roomId, sectionId
            { _id: 't1', timeslotId: 'ts1' }
        ];
        setupSchedule(messySchedule);

        // Even if we search, searching for { facultyId: undefined } might be weird, 
        // but our mock won't return anything unless we tell it to.
        Timetable.findOne.mockResolvedValue(null);

        const result = await detectConflicts();
        expect(result).toEqual([]);
    });

});

const { resolveConflicts } = require('../../timetable-backend-mern/services/conflictResolver');
const Timetable = require('../../timetable-backend-mern/models/Timetable');
const FacultyAvailability = require('../../timetable-backend-mern/models/FacultyAvailability');
const Room = require('../../timetable-backend-mern/models/Room');
const TimeSlot = require('../../timetable-backend-mern/models/TimeSlot');

// Mocks
jest.mock('../../timetable-backend-mern/services/conflictDetector', () => ({
    detectConflicts: jest.fn()
}));
const { detectConflicts } = require('../../timetable-backend-mern/services/conflictDetector');

jest.mock('../../timetable-backend-mern/models/Timetable');
jest.mock('../../timetable-backend-mern/models/FacultyAvailability');
jest.mock('../../timetable-backend-mern/models/Room');
jest.mock('../../timetable-backend-mern/models/TimeSlot');

describe('Conflict Resolution Logic', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- 1. Basic Resolution Flow ---
    test('should return success immediately if no conflicts exist', async () => {
        detectConflicts.mockResolvedValue([]);
        const result = await resolveConflicts();
        expect(result.success).toBe(true);
        expect(result.conflictsResolved).toBe(0);
    });

    // --- 2. Faculty Conflict Resolution ---
    test('should resolve faculty conflict by moving to available slot', async () => {
        // Setup: 1 conflict detected
        const conflict = {
            type: 'faculty',
            entityId: 'f1',
            timeslotId: 'ts1',
            entries: [] // The code actually re-fetches entries via Timetable.find
        };
        detectConflicts
            .mockResolvedValueOnce([conflict]) // First detection finds conflict
            .mockResolvedValueOnce([]); // Second detection (verification) finds none

        // 1. Timetable.find for finding conflicting entries
        const mockEntries = [
            { _id: 'e1' },
            {
                _id: 'e2',
                facultyId: { _id: 'f1', name: 'Fac1' },
                roomId: { _id: 'r1', name: 'Room1' },
                sectionId: { _id: 's1', name: 'Sec1' },
                timeslotId: { _id: 'ts1', day: 'Mon', slot: 1 },
                courseId: { _id: 'c1', name: 'Course1' }
            }
        ];

        // We need to carefully mock Timetable.find and Timetable.findOne because they are called multiple times
        // Call 1: resolveFacultyConflict -> find entries
        // Call 2+: checkFacultyAvailability -> findOne
        // Call 3+: checkResourceFree -> findOne

        // Helper for chaining populate
        const mockFindChain = (returnValue) => ({
            populate: jest.fn().mockReturnThis(),
            then: (resolve) => resolve(returnValue),
            exec: jest.fn().mockResolvedValue(returnValue)
        });

        Timetable.find.mockReturnValue(mockFindChain(mockEntries));

        // Mock findOne to return NULL (meaning resource is free/available)
        Timetable.findOne.mockResolvedValue(null);

        // Availability Mocks (findOne returns null means "no specific unavailability record found", so isAvailable=true)
        FacultyAvailability.findOne.mockResolvedValue(null);

        // Timeslot Mocks
        TimeSlot.find.mockResolvedValue([{ _id: 'tsNew', day: 'Tue', slot: 1 }]);

        // Execution
        const result = await resolveConflicts('p1');

        // Assertions
        expect(result.success).toBe(true);
        expect(result.conflictsResolved).toBe(1);
        expect(Timetable.findByIdAndUpdate).toHaveBeenCalled();
    });

    // --- 3. Room Conflict Resolution ---
    test('should resolve room conflict by swapping result', async () => {
        const conflict = {
            type: 'room',
            entityId: 'r1',
            timeslotId: 'ts1'
        };
        detectConflicts
            .mockResolvedValueOnce([conflict])
            .mockResolvedValueOnce([]);

        const mockEntries = [
            { _id: 'e1' },
            {
                _id: 'e2',
                facultyId: { _id: 'f1' },
                roomId: { _id: 'r1', roomType: 'theory', capacity: 60, name: 'Room1' },
                sectionId: { _id: 's1', studentCount: 50 },
                timeslotId: { _id: 'ts1' },
                courseId: { _id: 'c1' }
            }
        ];

        // Helper for chaining populate
        const mockFindChain = (returnValue) => ({
            populate: jest.fn().mockReturnThis(),
            then: (resolve) => resolve(returnValue),
            exec: jest.fn().mockResolvedValue(returnValue)
        });

        // Mock find for getting entries
        Timetable.find.mockReturnValue(mockFindChain(mockEntries));
        // Mock findOne for checking availability
        Timetable.findOne.mockResolvedValue(null);

        // Finds another room
        Room.find.mockResolvedValue([{ _id: 'r2', roomType: 'theory', capacity: 60, name: 'Room2' }]);

        const result = await resolveConflicts('p1');

        expect(result.success).toBe(true);
        expect(result.conflictsResolved).toBe(1);
        // Verify it tried to update with new Room ID
        const updateCall = Timetable.findByIdAndUpdate.mock.calls[0];
        // Note: The order of calls might vary if Faculty test ran first. 
        // Better to check if ANY call used 'r2'
        const hasRoom2Update = Timetable.findByIdAndUpdate.mock.calls.some(call => call[1].roomId === 'r2');
        expect(hasRoom2Update).toBe(true);
    });

    // --- 4. Unresolvable Case ---
    test('should report failure if constraints are too tight', async () => {
        const conflict = {
            type: 'faculty',
            entityId: 'f1', // Add missing ID used by resolver query
            timeslotId: 'ts1',
            entries: []
        };
        // Mock detect to return conflict then eventually same conflict
        detectConflicts.mockResolvedValue([conflict]);

        // Mock finding conflict entries (needs populate)
        Timetable.find.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            then: (resolve) => resolve([{ _id: 'e1', facultyId: { _id: 'f1' }, timeslotId: { _id: 'ts1' } }]) // simplistic return
        });

        // Mock NO availability
        FacultyAvailability.findOne.mockResolvedValue(null);
        TimeSlot.find.mockResolvedValue([]);

        // Implementation usually has a loop limit or check
        // We expect it to eventually give up

        // NOTE: Real implementation might loop X times. 
        // We simulate "give up" by having detectConflicts eventually return empty or same
        // But let's assume it checks `remainingConflicts`

        // Let's verify it attempts but returns identifying unresolvable
        detectConflicts.mockResolvedValue([conflict, conflict]); // Persists

        const result = await resolveConflicts();

        expect(result.remainingConflicts).toBeGreaterThan(0);
        // Success might still be 'true' in the sense that the process finished, mostly "partial success"
    });

});

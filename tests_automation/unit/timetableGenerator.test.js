const { generateTimetable } = require('../../timetable-backend-mern/services/timetableGenerator');
const Timetable = require('../../timetable-backend-mern/models/Timetable');
const FacultyAvailability = require('../../timetable-backend-mern/models/FacultyAvailability');

// Mock Mongoose Models
jest.mock('../../timetable-backend-mern/models/Timetable');
jest.mock('../../timetable-backend-mern/models/FacultyAvailability');

describe('Timetable Generator Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockSections = [{ _id: 'sec1', studentCount: 30 }];
    const mockCourses = [{ _id: 'course1', courseType: 'theory' }];
    const mockSectionCourses = { 'sec1': mockCourses };
    const mockFaculties = [{ _id: 'fac1' }];
    const mockRooms = [{ _id: 'room1', capacity: 50, roomType: 'theory' }];
    const mockTimeslots = [
        { _id: 'ts1', day: 'Monday', slot: 1, startTime: '09:00', endTime: '10:00' },
        { _id: 'ts2', day: 'Monday', slot: 2, startTime: '10:00', endTime: '11:00' }
    ];

    test('should generate candidates and save the best one', async () => {
        // Mock DB responses
        FacultyAvailability.find.mockResolvedValue([]); // No specific availability constraints
        Timetable.deleteMany.mockResolvedValue({});
        Timetable.insertMany.mockResolvedValue([
            { proposalId: 1, sectionId: 'sec1', courseId: 'course1' }
        ]);

        const result = await generateTimetable(
            mockSections,
            mockSectionCourses,
            mockFaculties,
            mockRooms,
            mockTimeslots
        );

        // Assertions
        expect(FacultyAvailability.find).toHaveBeenCalled();
        // It runs 3 candidates, deletes old, inserts new
        expect(Timetable.deleteMany).toHaveBeenCalled();
        expect(Timetable.insertMany).toHaveBeenCalled();

        // Check result structure
        expect(result).toHaveProperty('bestSchedule');
        expect(result).toHaveProperty('rankings');
    });

    test('should handle availability constraints', async () => {
        // Mock faculty available only on ts1
        FacultyAvailability.find.mockResolvedValue([
            { facultyId: 'fac1', timeslotId: 'ts1', isAvailable: true }
        ]);
        Timetable.deleteMany.mockResolvedValue({});
        Timetable.insertMany.mockResolvedValue([]);

        await generateTimetable(
            mockSections,
            mockSectionCourses,
            mockFaculties,
            mockRooms,
            mockTimeslots
        );

        expect(FacultyAvailability.find).toHaveBeenCalled();
    });
});

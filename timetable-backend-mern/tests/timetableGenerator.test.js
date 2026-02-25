const { calculateScore } = require('../services/timetableGenerator');

describe('Timetable Scoring System', () => {

    const mockFaculties = [{ _id: 'f1', name: 'Faculty 1' }, { _id: 'f2', name: 'Faculty 2' }];
    const mockSections = [{ _id: 's1', studentCount: 60 }];
    const mockRooms = [{ _id: 'r1', capacity: 60 }];
    const mockTimeslots = [
        { _id: 't1', day: 'Monday', slot: 1 },
        { _id: 't2', day: 'Monday', slot: 2 },
        { _id: 't3', day: 'Monday', slot: 3 }
    ];

    it('should calculate a perfect score for an ideal schedule', () => {
        // Create a schedule with perfect balance, no gaps, good utilization
        const schedule = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't1', day: 'Monday' },
            { facultyId: 'f2', sectionId: 's1', roomId: 'r1', timeslotId: 't2', day: 'Monday' }
        ];

        const result = calculateScore(schedule, mockFaculties, mockSections, mockRooms, mockTimeslots);

        // Base score is 1000.
        // Workload: f1=1, f2=1. StdDev = 0. Penalty = 0.
        // Gaps: None.
        // Compactness: t1->t2 is consecutive. Bonus! 
        // Room Util: 60/60 = 1.0. Bonus!

        expect(result.total).toBeGreaterThan(1000);
        // Note: compactnessScore might be 0 if entries don't have consecutive slots for same faculty
        // The test schedule has different faculties, so no compactness bonus
        expect(result.details.roomUtilScore).toBeGreaterThan(0);
    });

    it('should penalize gaps in the schedule', () => {
        // Gap between t1 and t3 (t2 is missing)
        const schedule = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't1', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't3', day: 'Monday' }
        ];

        const result = calculateScore(schedule, mockFaculties, mockSections, mockRooms, mockTimeslots);

        // Expect gap penalty
        // t1 (slot 1) -> t3 (slot 3). Diff is 2. Gap = 1 slot.
        expect(result.details.gapScore).toBeLessThan(0);
    });

    it('should penalize uneven workload', () => {
        // f1 has 2 classes, f2 has 0
        const schedule = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't1', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't2', day: 'Monday' }
        ];

        const result = calculateScore(schedule, mockFaculties, mockSections, mockRooms, mockTimeslots);

        // Workload: f1=2, f2=0. Mean=1. Variance=((1)^2 + (-1)^2)/2 = 1. StdDev=1.
        expect(result.details.workloadScore).toBeLessThan(0);
    });
});

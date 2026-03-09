const { calculateScore } = require('../services/timetableGenerator');

describe('Timetable System - Edge Cases & Complex Scenarios', () => {

    const mockFaculties = Array.from({ length: 5 }, (_, i) => ({ _id: `f${i + 1}`, name: `Faculty ${i + 1}` }));
    const mockSections = Array.from({ length: 3 }, (_, i) => ({ _id: `s${i + 1}`, studentCount: 60 }));
    const mockRooms = Array.from({ length: 2 }, (_, i) => ({ _id: `r${i + 1}`, capacity: 60 }));
    const mockTimeslots = [
        { _id: 't1', day: 'Monday', slot: 1 },
        { _id: 't2', day: 'Monday', slot: 2 },
        { _id: 't3', day: 'Monday', slot: 3 },
        { _id: 't4', day: 'Monday', slot: 4 },
        { _id: 't5', day: 'Monday', slot: 5 },
        { _id: 't6', day: 'Monday', slot: 6 }
    ];

    it('Edge Case 1: Resource Shortage (More Classes than Rooms)', () => {
        // 3 sections need classes at the same time (t1), but only 2 rooms exist.
        // The generator should ideally fail or produce an invalid schedule, 
        // BUT the scoring system should still rate it. Here we test if it detects the overload/conflict 
        // or just handles the score. Since calculateScore assumes a VALID schedule structure,
        // we will test if it scores a "crammed" schedule (if valid) or just check how it handles high utilization.

        // Let's simulate a schedule where every room is full every slot (Max Utilization)
        const schedule = [];
        // Fill Room 1 and Room 2 for all slots
        mockTimeslots.forEach(t => {
            schedule.push({ facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: t._id, day: 'Monday' });
            schedule.push({ facultyId: 'f2', sectionId: 's2', roomId: 'r2', timeslotId: t._id, day: 'Monday' });
        });

        const result = calculateScore(schedule, mockFaculties, mockSections, mockRooms, mockTimeslots);

        // Utilization should be perfect (100%)
        expect(result.details.roomUtilScore).toBeGreaterThan(0);
        // Workload will be high for f1 and f2, others 0. High variance -> High penalty.
        expect(result.details.workloadScore).toBeLessThan(0);
    });

    it('Edge Case 2: Faculty Overload (Single Faculty handling all classes)', () => {
        // Faculty 1 teaches ALL classes for 6 slots straight
        const schedule = mockTimeslots.map(t => ({
            facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: t._id, day: 'Monday'
        }));

        const result = calculateScore(schedule, mockFaculties, mockSections, mockRooms, mockTimeslots);

        // Daily load > 4 should trigger penalty if implemented
        // f1 has 6 hrs. Max usually 4.
        const workloadPenalty = result.details.workloadScore;

        // Compare with a balanced schedule where 2 faculties split the work (3 hrs each)
        const balancedSchedule = mockTimeslots.map((t, i) => ({
            facultyId: i < 3 ? 'f1' : 'f2',
            sectionId: 's1',
            roomId: 'r1',
            timeslotId: t._id,
            day: 'Monday'
        }));

        const balancedResult = calculateScore(balancedSchedule, mockFaculties, mockSections, mockRooms, mockTimeslots);

        console.log(`\nFaculty Overload Check:`);
        console.log(`  Overloaded (6hrs): ${result.total}`);
        console.log(`  Balanced (3hrs/3hrs): ${balancedResult.total}`);

        expect(balancedResult.total).toBeGreaterThan(result.total);
    });

    it('Edge Case 3: Sparse Schedule (1 class per day per section)', () => {
        // Very inefficient use of time, lots of gaps if viewed as a block, or just compactness bonus missing.
        const schedule = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't1', day: 'Monday' },
            // gap t2, t3, t4, t5
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't6', day: 'Monday' }
        ];

        const result = calculateScore(schedule, mockFaculties, mockSections, mockRooms, mockTimeslots);

        // Should have significant gap penalty
        expect(result.details.gapScore).toBeLessThan(0);
        console.log(`\nSparse Schedule Gap Score: ${result.details.gapScore}`);
    });

    it('Edge Case 4: Zero Enrollment Section (Divide by Zero Check)', () => {
        // Section with 0 students assigned to a room
        const emptySection = [{ _id: 's_empty', studentCount: 0 }];
        const schedule = [
            { facultyId: 'f1', sectionId: 's_empty', roomId: 'r1', timeslotId: 't1', day: 'Monday' }
        ];

        const result = calculateScore(schedule, mockFaculties, emptySection, mockRooms, mockTimeslots);

        // Utilization: 0 / 60 = 0. Should not crash.
        expect(result.details.roomUtilScore).toBe(0);
    });

    it('Edge Case 5: Oversized Class (More students than Room Capacity)', () => {
        // 100 students in 60 capacity room. Utilization capped at 1.0?
        const hugeSection = [{ _id: 's_huge', studentCount: 100 }];
        const schedule = [
            { facultyId: 'f1', sectionId: 's_huge', roomId: 'r1', timeslotId: 't1', day: 'Monday' }
        ];

        const result = calculateScore(schedule, mockFaculties, hugeSection, mockRooms, mockTimeslots);

        // Logic check: Does it cap at 1.0 or go higher? 
        // Ideally should cap or penalize. Current logic often caps at 1.0 for bonus calculation.
        // Let's verify it doesn't break math.
        expect(result.total).not.toBeNaN();
    });

    it('Stress Test: Large Schedule (100+ entries)', () => {
        const largeSchedule = [];
        // Generate 100 entries
        for (let i = 0; i < 100; i++) {
            largeSchedule.push({
                facultyId: 'f1',
                sectionId: 's1',
                roomId: 'r1',
                timeslotId: 't1',
                day: 'Monday' // Nonsense logically, but valid for scoring loop performance
            });
        }

        const start = performance.now();
        const result = calculateScore(largeSchedule, mockFaculties, mockSections, mockRooms, mockTimeslots);
        const end = performance.now();

        expect(result.total).not.toBeNaN();
        expect(end - start).toBeLessThan(50); // Should be very fast (<50ms)
        console.log(`\nPerformance Test (100 items): ${(end - start).toFixed(2)}ms`);
    });

});

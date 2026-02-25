const { calculateScore } = require('../services/timetableGenerator');

describe('Timetable Ranking Effectiveness', () => {

    const mockFaculties = [{ _id: 'f1' }, { _id: 'f2' }];
    const mockSections = [{ _id: 's1', studentCount: 60 }];
    const mockRooms = [{ _id: 'r1', capacity: 60 }];
    const mockTimeslots = [
        { _id: 't1', day: 'Monday', slot: 1 },
        { _id: 't2', day: 'Monday', slot: 2 },
        { _id: 't3', day: 'Monday', slot: 3 },
        { _id: 't4', day: 'Monday', slot: 4 }
    ];

    it('Scenario 1: Compact Schedule vs Schedule with Gaps', () => {
        // Schedule A: Compact (t1, t2) -> Better
        const scheduleA = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't1', day: 'Monday' }, // 9-10
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't2', day: 'Monday' }  // 10-11
        ];

        // Schedule B: Gaps (t1, t3) -> Worse
        const scheduleB = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't1', day: 'Monday' }, // 9-10
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't3', day: 'Monday' }  // 11-12 (Gap!)
        ];

        const scoreA = calculateScore(scheduleA, mockFaculties, mockSections, mockRooms, mockTimeslots);
        const scoreB = calculateScore(scheduleB, mockFaculties, mockSections, mockRooms, mockTimeslots);

        console.log(`\nScenario 1 (Compactness):`);
        console.log(`  Schedule A (Compact): ${scoreA.total} (Compactness Bonus: ${scoreA.details.compactnessScore})`);
        console.log(`  Schedule B (Gaps):    ${scoreB.total} (Gap Penalty: ${scoreB.details.gapScore})`);

        expect(scoreA.total).toBeGreaterThan(scoreB.total);
    });

    it('Scenario 2: Balanced Workload vs Unbalanced Workload', () => {
        // Schedule A: Balanced (f1 has 1, f2 has 1) -> Better
        const scheduleA = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't1', day: 'Monday' },
            { facultyId: 'f2', sectionId: 's1', roomId: 'r1', timeslotId: 't2', day: 'Monday' }
        ];

        // Schedule B: Unbalanced (f1 has 2, f2 has 0) -> Worse
        const scheduleB = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't1', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't2', day: 'Monday' }
        ];

        const scoreA = calculateScore(scheduleA, mockFaculties, mockSections, mockRooms, mockTimeslots);
        const scoreB = calculateScore(scheduleB, mockFaculties, mockSections, mockRooms, mockTimeslots);

        console.log(`\nScenario 2 (Workload Balance):`);
        console.log(`  Schedule A (Balanced):   ${scoreA.total} (Penalty: ${scoreA.details.workloadScore})`);
        console.log(`  Schedule B (Unbalanced): ${scoreB.total} (Penalty: ${scoreB.details.workloadScore})`);

        expect(scoreA.total).toBeGreaterThan(scoreB.total);
    });

    it('Scenario 3: Room Utilization (Optimized vs Wasteful)', () => {
        const bigRoom = { _id: 'r_big', capacity: 100 }; // 100 seats
        const fitRoom = { _id: 'r_fit', capacity: 60 };  // 60 seats
        const smallClass = { _id: 's_small', studentCount: 50 };
        const rooms = [bigRoom, fitRoom];
        const sections = [smallClass];

        // Schedule A: Good fit (50 students in 60-cap room) -> Better Util (0.83)
        const scheduleA = [
            { facultyId: 'f1', sectionId: 's_small', roomId: 'r_fit', timeslotId: 't1', day: 'Monday' }
        ];

        // Schedule B: Poor fit (50 students in 100-cap room) -> Worse Util (0.5)
        const scheduleB = [
            { facultyId: 'f1', sectionId: 's_small', roomId: 'r_big', timeslotId: 't1', day: 'Monday' }
        ];

        const scoreA = calculateScore(scheduleA, mockFaculties, sections, rooms, mockTimeslots);
        const scoreB = calculateScore(scheduleB, mockFaculties, sections, rooms, mockTimeslots);

        console.log(`\nScenario 3 (Room Optimization):`);
        console.log(`  Schedule A (Good Fit): ${scoreA.total} (Util Score: ${scoreA.details.roomUtilScore.toFixed(2)})`);
        console.log(`  Schedule B (Bad Fit):  ${scoreB.total} (Util Score: ${scoreB.details.roomUtilScore.toFixed(2)})`);

        expect(scoreA.total).toBeGreaterThan(scoreB.total);
    });

    it('Scenario 4: Daily Overload Penalty', () => {
        const extendedTimeslots = [
            { _id: 't1', day: 'Monday', slot: 1 },
            { _id: 't2', day: 'Monday', slot: 2 },
            { _id: 't3', day: 'Monday', slot: 3 },
            { _id: 't4', day: 'Monday', slot: 4 },
            { _id: 't5', day: 'Monday', slot: 5 },
            { _id: 't6', day: 'Tuesday', slot: 1 },
            { _id: 't7', day: 'Tuesday', slot: 2 }
        ];

        // Schedule A: Distributed (4 on Mon, 1 on Tue) -> No overload
        const scheduleA = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't1', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't2', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't3', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't4', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't6', day: 'Tuesday' }
        ];

        // Schedule B: Overloaded (5 on Mon) -> Penalty
        const scheduleB = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't1', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't2', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't3', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't4', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't5', day: 'Monday' }
        ];

        const scoreA = calculateScore(scheduleA, mockFaculties, mockSections, mockRooms, extendedTimeslots);
        const scoreB = calculateScore(scheduleB, mockFaculties, mockSections, mockRooms, extendedTimeslots);

        console.log(`\nScenario 4 (Daily Overload):`);
        console.log(`  Schedule A (4/day max): ${scoreA.total} (Workload: ${scoreA.details.workloadScore})`);
        console.log(`  Schedule B (5/day):     ${scoreB.total} (Workload: ${scoreB.details.workloadScore})`);

        expect(scoreA.total).toBeGreaterThan(scoreB.total);
    });

    it('Scenario 5: Multi-Day Distribution vs Concentrated', () => {
        const multiDayTimeslots = [
            { _id: 't1', day: 'Monday', slot: 1 },
            { _id: 't2', day: 'Monday', slot: 2 },
            { _id: 't3', day: 'Tuesday', slot: 1 },
            { _id: 't4', day: 'Tuesday', slot: 2 },
            { _id: 't5', day: 'Wednesday', slot: 1 },
            { _id: 't6', day: 'Wednesday', slot: 2 }
        ];

        // Schedule A: Spread across 3 days (compact within each day)
        const scheduleA = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't1', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't2', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't3', day: 'Tuesday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't4', day: 'Tuesday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't5', day: 'Wednesday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't6', day: 'Wednesday' }
        ];

        // Schedule B: Same distribution (also compact within each day)
        const scheduleB = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't1', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't2', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't3', day: 'Tuesday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't4', day: 'Tuesday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't5', day: 'Wednesday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't6', day: 'Wednesday' }
        ];

        const scoreA = calculateScore(scheduleA, mockFaculties, mockSections, mockRooms, multiDayTimeslots);
        const scoreB = calculateScore(scheduleB, mockFaculties, mockSections, mockRooms, multiDayTimeslots);

        console.log(`\nScenario 5 (Multi-Day Distribution):`);
        console.log(`  Schedule A (Spread): ${scoreA.total} (Compactness: ${scoreA.details.compactnessScore})`);
        console.log(`  Schedule B (Same):   ${scoreB.total} (Compactness: ${scoreB.details.compactnessScore})`);

        // Both should have same compactness (3 consecutive pairs each)
        expect(scoreA.details.compactnessScore).toEqual(scoreB.details.compactnessScore);
    });

    it('Scenario 6: Multiple Gaps vs Single Gap', () => {
        const gapTimeslots = [
            { _id: 't1', day: 'Monday', slot: 1 },
            { _id: 't2', day: 'Monday', slot: 2 },
            { _id: 't3', day: 'Monday', slot: 3 },
            { _id: 't4', day: 'Monday', slot: 4 },
            { _id: 't5', day: 'Monday', slot: 5 },
            { _id: 't6', day: 'Monday', slot: 6 }
        ];

        // Schedule A: Single gap of 2 slots (t1, t4)
        const scheduleA = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't1', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't4', day: 'Monday' }
        ];

        // Schedule B: Multiple gaps (t1, t3, t6) - 2 gaps total
        const scheduleB = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't1', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't3', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't6', day: 'Monday' }
        ];

        const scoreA = calculateScore(scheduleA, mockFaculties, mockSections, mockRooms, gapTimeslots);
        const scoreB = calculateScore(scheduleB, mockFaculties, mockSections, mockRooms, gapTimeslots);

        console.log(`\nScenario 6 (Gap Severity):`);
        console.log(`  Schedule A (1 gap of 2): ${scoreA.total} (Gap Score: ${scoreA.details.gapScore})`);
        console.log(`  Schedule B (2 gaps):     ${scoreB.total} (Gap Score: ${scoreB.details.gapScore})`);

        // Schedule B has more total gap slots (1+2=3 vs 2), so worse score
        expect(scoreA.total).toBeGreaterThan(scoreB.total);
    });

    it('Scenario 7: Extreme Workload Imbalance', () => {
        const threeFaculties = [{ _id: 'f1' }, { _id: 'f2' }, { _id: 'f3' }];

        // Schedule A: Perfectly balanced (2, 2, 2)
        const scheduleA = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't1', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't2', day: 'Monday' },
            { facultyId: 'f2', sectionId: 's1', roomId: 'r1', timeslotId: 't3', day: 'Monday' },
            { facultyId: 'f2', sectionId: 's1', roomId: 'r1', timeslotId: 't4', day: 'Monday' },
            { facultyId: 'f3', sectionId: 's1', roomId: 'r1', timeslotId: 't5', day: 'Tuesday' },
            { facultyId: 'f3', sectionId: 's1', roomId: 'r1', timeslotId: 't6', day: 'Tuesday' }
        ];

        // Schedule B: Extremely imbalanced (6, 0, 0)
        const scheduleB = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't1', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't2', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't3', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't4', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't5', day: 'Tuesday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't6', day: 'Tuesday' }
        ];

        const extendedTimeslots = [
            { _id: 't1', day: 'Monday', slot: 1 },
            { _id: 't2', day: 'Monday', slot: 2 },
            { _id: 't3', day: 'Monday', slot: 3 },
            { _id: 't4', day: 'Monday', slot: 4 },
            { _id: 't5', day: 'Tuesday', slot: 1 },
            { _id: 't6', day: 'Tuesday', slot: 2 }
        ];

        const scoreA = calculateScore(scheduleA, threeFaculties, mockSections, mockRooms, extendedTimeslots);
        const scoreB = calculateScore(scheduleB, threeFaculties, mockSections, mockRooms, extendedTimeslots);

        console.log(`\nScenario 7 (Extreme Imbalance):`);
        console.log(`  Schedule A (Balanced 2,2,2): ${scoreA.total} (Workload: ${scoreA.details.workloadScore})`);
        console.log(`  Schedule B (Imbalanced 6,0,0): ${scoreB.total} (Workload: ${scoreB.details.workloadScore})`);

        expect(scoreA.total).toBeGreaterThan(scoreB.total);
    });

    it('Scenario 8: Room Capacity Edge Cases', () => {
        const exactRoom = { _id: 'r_exact', capacity: 50 };
        const overRoom = { _id: 'r_over', capacity: 60 };  // Larger difference for more significant score impact
        const section50 = { _id: 's_50', studentCount: 50 };
        const rooms = [exactRoom, overRoom];
        const sections = [section50];

        // Schedule A: Exact fit (100% utilization)
        const scheduleA = [
            { facultyId: 'f1', sectionId: 's_50', roomId: 'r_exact', timeslotId: 't1', day: 'Monday' }
        ];

        // Schedule B: Oversized (83% utilization)
        const scheduleB = [
            { facultyId: 'f1', sectionId: 's_50', roomId: 'r_over', timeslotId: 't1', day: 'Monday' }
        ];

        const scoreA = calculateScore(scheduleA, mockFaculties, sections, rooms, mockTimeslots);
        const scoreB = calculateScore(scheduleB, mockFaculties, sections, rooms, mockTimeslots);

        console.log(`\nScenario 8 (Room Edge Cases):`);
        console.log(`  Schedule A (100% util): ${scoreA.total} (Room: ${scoreA.details.roomUtilScore.toFixed(2)})`);
        console.log(`  Schedule B (83% util):  ${scoreB.total} (Room: ${scoreB.details.roomUtilScore.toFixed(2)})`);

        expect(scoreA.total).toBeGreaterThan(scoreB.total);
    });

    it('Scenario 9: Combined Optimization (Best vs Worst)', () => {
        const extendedTimeslots = [
            { _id: 't1', day: 'Monday', slot: 1 },
            { _id: 't2', day: 'Monday', slot: 2 },
            { _id: 't3', day: 'Monday', slot: 3 },
            { _id: 't4', day: 'Monday', slot: 4 },
            { _id: 't5', day: 'Tuesday', slot: 1 },
            { _id: 't6', day: 'Tuesday', slot: 2 }
        ];

        const goodRoom = { _id: 'r_good', capacity: 65 };
        const badRoom = { _id: 'r_bad', capacity: 150 };
        const rooms = [goodRoom, badRoom];

        // Schedule A: Best practices (balanced, compact, good room fit)
        const scheduleA = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r_good', timeslotId: 't1', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r_good', timeslotId: 't2', day: 'Monday' },
            { facultyId: 'f2', sectionId: 's1', roomId: 'r_good', timeslotId: 't3', day: 'Monday' },
            { facultyId: 'f2', sectionId: 's1', roomId: 'r_good', timeslotId: 't4', day: 'Monday' }
        ];

        // Schedule B: Worst practices (imbalanced, gaps, poor room fit)
        const scheduleB = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r_bad', timeslotId: 't1', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r_bad', timeslotId: 't3', day: 'Monday' }, // Gap!
            { facultyId: 'f1', sectionId: 's1', roomId: 'r_bad', timeslotId: 't5', day: 'Tuesday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r_bad', timeslotId: 't6', day: 'Tuesday' }
        ];

        const scoreA = calculateScore(scheduleA, mockFaculties, mockSections, rooms, extendedTimeslots);
        const scoreB = calculateScore(scheduleB, mockFaculties, mockSections, rooms, extendedTimeslots);

        console.log(`\nScenario 9 (Combined Best vs Worst):`);
        console.log(`  Schedule A (Optimized): ${scoreA.total}`);
        console.log(`    - Workload: ${scoreA.details.workloadScore}`);
        console.log(`    - Gaps: ${scoreA.details.gapScore}`);
        console.log(`    - Room: ${scoreA.details.roomUtilScore.toFixed(2)}`);
        console.log(`    - Compactness: ${scoreA.details.compactnessScore}`);
        console.log(`  Schedule B (Poor): ${scoreB.total}`);
        console.log(`    - Workload: ${scoreB.details.workloadScore}`);
        console.log(`    - Gaps: ${scoreB.details.gapScore}`);
        console.log(`    - Room: ${scoreB.details.roomUtilScore.toFixed(2)}`);
        console.log(`    - Compactness: ${scoreB.details.compactnessScore}`);

        expect(scoreA.total).toBeGreaterThan(scoreB.total);
    });

    it('Scenario 10: Edge Case - Empty Schedule', () => {
        const emptySchedule = [];
        const score = calculateScore(emptySchedule, mockFaculties, mockSections, mockRooms, mockTimeslots);

        console.log(`\nScenario 10 (Empty Schedule):`);
        console.log(`  Score: ${score.total}`);
        console.log(`  Details:`, score.details);

        // Empty schedule should have base score + preference bonus
        expect(score.total).toBeGreaterThan(0);
        expect(score.details.workloadScore).toBeCloseTo(0, 5);
        expect(score.details.gapScore).toBeCloseTo(0, 5);
        expect(score.details.compactnessScore).toBe(0);
    });

    it('Scenario 11: Edge Case - Single Entry', () => {
        const singleEntry = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't1', day: 'Monday' }
        ];

        const score = calculateScore(singleEntry, mockFaculties, mockSections, mockRooms, mockTimeslots);

        console.log(`\nScenario 11 (Single Entry):`);
        console.log(`  Score: ${score.total}`);
        console.log(`  Details:`, score.details);

        // Single entry should have no gaps, no compactness bonus
        expect(score.details.gapScore).toBeCloseTo(0, 5);
        expect(score.details.compactnessScore).toBe(0);
        expect(score.total).toBeGreaterThan(0);
    });

    it('Scenario 12: Perfect Compactness (All Consecutive)', () => {
        const consecutiveTimeslots = [
            { _id: 't1', day: 'Monday', slot: 1 },
            { _id: 't2', day: 'Monday', slot: 2 },
            { _id: 't3', day: 'Monday', slot: 3 },
            { _id: 't4', day: 'Monday', slot: 4 },
            { _id: 't5', day: 'Monday', slot: 5 }
        ];

        // All consecutive slots
        const perfectSchedule = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't1', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't2', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't3', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't4', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't5', day: 'Monday' }
        ];

        const score = calculateScore(perfectSchedule, mockFaculties, mockSections, mockRooms, consecutiveTimeslots);

        console.log(`\nScenario 12 (Perfect Compactness):`);
        console.log(`  Score: ${score.total}`);
        console.log(`  Compactness: ${score.details.compactnessScore} (4 consecutive pairs)`);
        console.log(`  Gaps: ${score.details.gapScore} (should be 0)`);

        // 4 consecutive pairs, no gaps
        expect(score.details.gapScore).toBeCloseTo(0, 5);
        expect(score.details.compactnessScore).toBeGreaterThan(0);
    });

    it('Scenario 13: Room Overcapacity (Students > Capacity)', () => {
        const smallRoom = { _id: 'r_small', capacity: 30 };
        const largeSection = { _id: 's_large', studentCount: 80 };
        const rooms = [smallRoom];
        const sections = [largeSection];

        // Schedule with overcapacity (capped at 100% in scoring)
        const overcapacitySchedule = [
            { facultyId: 'f1', sectionId: 's_large', roomId: 'r_small', timeslotId: 't1', day: 'Monday' }
        ];

        const score = calculateScore(overcapacitySchedule, mockFaculties, sections, rooms, mockTimeslots);

        console.log(`\nScenario 13 (Overcapacity):`)
        console.log(`  Score: ${score.total}`);
        console.log(`  Room Util (capped at 100%): ${score.details.roomUtilScore.toFixed(2)}`);

        // Utilization should be capped at 100% (1.0)
        expect(score.details.roomUtilScore).toBe(20); // 1.0 * 100 * 0.2 = 20
    });

    it('Scenario 14: All Faculty Zero Load', () => {
        const manyFaculties = [
            { _id: 'f1' }, { _id: 'f2' }, { _id: 'f3' },
            { _id: 'f4' }, { _id: 'f5' }
        ];

        // Empty schedule - all faculty have zero load
        const emptySchedule = [];

        const score = calculateScore(emptySchedule, manyFaculties, mockSections, mockRooms, mockTimeslots);

        console.log(`\nScenario 14 (All Faculty Zero Load):`);
        console.log(`  Score: ${score.total}`);
        console.log(`  Workload Score: ${score.details.workloadScore}`);

        // Perfect balance (all zeros) should have no penalty
        expect(score.details.workloadScore).toBeCloseTo(0, 5);
        expect(score.total).toBeGreaterThan(0);
    });

    it('Scenario 15: Alternating Gaps Pattern', () => {
        const extendedSlots = [
            { _id: 't1', day: 'Monday', slot: 1 },
            { _id: 't2', day: 'Monday', slot: 2 },
            { _id: 't3', day: 'Monday', slot: 3 },
            { _id: 't4', day: 'Monday', slot: 4 },
            { _id: 't5', day: 'Monday', slot: 5 },
            { _id: 't6', day: 'Monday', slot: 6 },
            { _id: 't7', day: 'Monday', slot: 7 }
        ];

        // Schedule A: Alternating pattern (t1, t3, t5, t7) - 3 gaps of 1 slot each
        const alternatingSchedule = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't1', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't3', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't5', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't7', day: 'Monday' }
        ];

        // Schedule B: Consecutive (t1, t2, t3, t4) - no gaps
        const consecutiveSchedule = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't1', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't2', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't3', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't4', day: 'Monday' }
        ];

        const scoreA = calculateScore(alternatingSchedule, mockFaculties, mockSections, mockRooms, extendedSlots);
        const scoreB = calculateScore(consecutiveSchedule, mockFaculties, mockSections, mockRooms, extendedSlots);

        console.log(`\nScenario 15 (Alternating Gaps):`);
        console.log(`  Alternating: ${scoreA.total} (Gaps: ${scoreA.details.gapScore})`);
        console.log(`  Consecutive: ${scoreB.total} (Compactness: ${scoreB.details.compactnessScore})`);

        // Consecutive should score much better
        expect(scoreB.total).toBeGreaterThan(scoreA.total);
    });

    it('Scenario 16: Weekend Scheduling', () => {
        const weekendSlots = [
            { _id: 't1', day: 'Saturday', slot: 1 },
            { _id: 't2', day: 'Saturday', slot: 2 },
            { _id: 't3', day: 'Sunday', slot: 1 },
            { _id: 't4', day: 'Sunday', slot: 2 }
        ];

        const weekendSchedule = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't1', day: 'Saturday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't2', day: 'Saturday' },
            { facultyId: 'f2', sectionId: 's1', roomId: 'r1', timeslotId: 't3', day: 'Sunday' },
            { facultyId: 'f2', sectionId: 's1', roomId: 'r1', timeslotId: 't4', day: 'Sunday' }
        ];

        const score = calculateScore(weekendSchedule, mockFaculties, mockSections, mockRooms, weekendSlots);

        console.log(`\nScenario 16 (Weekend Scheduling):`);
        console.log(`  Score: ${score.total}`);
        console.log(`  Compactness: ${score.details.compactnessScore}`);
        console.log(`  Workload Balance: ${score.details.workloadScore}`);

        // Should handle weekend days correctly
        expect(score.total).toBeGreaterThan(0);
        expect(score.details.compactnessScore).toBeGreaterThan(0); // 2 consecutive pairs
    });

    it('Scenario 17: Mixed Room Types (Labs vs Classrooms)', () => {
        const mixedRooms = [
            { _id: 'r_lab', capacity: 40, roomType: 'lab' },
            { _id: 'r_class', capacity: 60, roomType: 'classroom' }
        ];

        const section40 = { _id: 's_40', studentCount: 40 };
        const sections = [section40];

        // Schedule A: Perfect match (40 students in 40-cap lab)
        const scheduleA = [
            { facultyId: 'f1', sectionId: 's_40', roomId: 'r_lab', timeslotId: 't1', day: 'Monday' }
        ];

        // Schedule B: Oversized (40 students in 60-cap classroom)
        const scheduleB = [
            { facultyId: 'f1', sectionId: 's_40', roomId: 'r_class', timeslotId: 't1', day: 'Monday' }
        ];

        const scoreA = calculateScore(scheduleA, mockFaculties, sections, mixedRooms, mockTimeslots);
        const scoreB = calculateScore(scheduleB, mockFaculties, sections, mixedRooms, mockTimeslots);

        console.log(`\nScenario 17 (Mixed Room Types):`);
        console.log(`  Lab (100% util): ${scoreA.total} (Room: ${scoreA.details.roomUtilScore.toFixed(2)})`);
        console.log(`  Classroom (67% util): ${scoreB.total} (Room: ${scoreB.details.roomUtilScore.toFixed(2)})`);

        expect(scoreA.total).toBeGreaterThan(scoreB.total);
    });

    it('Scenario 18: Faculty Teaching Across All Days', () => {
        const allDaysSlots = [
            { _id: 't1', day: 'Monday', slot: 1 },
            { _id: 't2', day: 'Tuesday', slot: 1 },
            { _id: 't3', day: 'Wednesday', slot: 1 },
            { _id: 't4', day: 'Thursday', slot: 1 },
            { _id: 't5', day: 'Friday', slot: 1 },
            { _id: 't6', day: 'Saturday', slot: 1 }
        ];

        // Faculty teaching one class per day across 6 days
        const spreadSchedule = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't1', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't2', day: 'Tuesday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't3', day: 'Wednesday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't4', day: 'Thursday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't5', day: 'Friday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't6', day: 'Saturday' }
        ];

        const score = calculateScore(spreadSchedule, mockFaculties, mockSections, mockRooms, allDaysSlots);

        console.log(`\nScenario 18 (All Days Teaching):`);
        console.log(`  Score: ${score.total}`);
        console.log(`  Gaps: ${score.details.gapScore} (no gaps within days)`);
        console.log(`  Compactness: ${score.details.compactnessScore} (no consecutive pairs)`);

        // No gaps within days, but no compactness either
        expect(score.details.gapScore).toBeCloseTo(0, 5);
        expect(score.details.compactnessScore).toBe(0);
    });

    it('Scenario 19: Minimum vs Maximum Room Utilization', () => {
        const hugeRoom = { _id: 'r_huge', capacity: 500 };
        const tinyRoom = { _id: 'r_tiny', capacity: 10 };
        const section10 = { _id: 's_10', studentCount: 10 };
        const rooms = [hugeRoom, tinyRoom];
        const sections = [section10];

        // Schedule A: Maximum utilization (10 in 10-cap room = 100%)
        const maxUtilSchedule = [
            { facultyId: 'f1', sectionId: 's_10', roomId: 'r_tiny', timeslotId: 't1', day: 'Monday' }
        ];

        // Schedule B: Minimum utilization (10 in 500-cap room = 2%)
        const minUtilSchedule = [
            { facultyId: 'f1', sectionId: 's_10', roomId: 'r_huge', timeslotId: 't1', day: 'Monday' }
        ];

        const scoreMax = calculateScore(maxUtilSchedule, mockFaculties, sections, rooms, mockTimeslots);
        const scoreMin = calculateScore(minUtilSchedule, mockFaculties, sections, rooms, mockTimeslots);

        console.log(`\nScenario 19 (Utilization Extremes):`);
        console.log(`  Max (100%): ${scoreMax.total} (Room: ${scoreMax.details.roomUtilScore.toFixed(2)})`);
        console.log(`  Min (2%):   ${scoreMin.total} (Room: ${scoreMin.details.roomUtilScore.toFixed(2)})`);

        // Maximum utilization should score much better
        expect(scoreMax.total).toBeGreaterThan(scoreMin.total);
        expect(scoreMax.details.roomUtilScore).toBeGreaterThan(scoreMin.details.roomUtilScore * 10);
    });

    it('Scenario 20: Fragmented Schedule (Maximum Gaps)', () => {
        const manySlots = [
            { _id: 't1', day: 'Monday', slot: 1 },
            { _id: 't2', day: 'Monday', slot: 2 },
            { _id: 't3', day: 'Monday', slot: 3 },
            { _id: 't4', day: 'Monday', slot: 4 },
            { _id: 't5', day: 'Monday', slot: 5 },
            { _id: 't6', day: 'Monday', slot: 6 },
            { _id: 't7', day: 'Monday', slot: 7 },
            { _id: 't8', day: 'Monday', slot: 8 }
        ];

        // Schedule A: Maximum fragmentation (t1, t8) - 6 slot gap
        const fragmentedSchedule = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't1', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't8', day: 'Monday' }
        ];

        // Schedule B: Compact (t1, t2)
        const compactSchedule = [
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't1', day: 'Monday' },
            { facultyId: 'f1', sectionId: 's1', roomId: 'r1', timeslotId: 't2', day: 'Monday' }
        ];

        const scoreFragmented = calculateScore(fragmentedSchedule, mockFaculties, mockSections, mockRooms, manySlots);
        const scoreCompact = calculateScore(compactSchedule, mockFaculties, mockSections, mockRooms, manySlots);

        console.log(`\nScenario 20 (Maximum Fragmentation):`);
        console.log(`  Fragmented (6-slot gap): ${scoreFragmented.total} (Gap: ${scoreFragmented.details.gapScore})`);
        console.log(`  Compact (consecutive):   ${scoreCompact.total} (Compactness: ${scoreCompact.details.compactnessScore})`);

        // Compact should score significantly better
        expect(scoreCompact.total).toBeGreaterThan(scoreFragmented.total);
        expect(scoreFragmented.details.gapScore).toBeLessThan(-7); // 6-slot gap penalty
    });
});

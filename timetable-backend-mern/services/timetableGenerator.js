const Timetable = require('../models/Timetable');
const FacultyAvailability = require('../models/FacultyAvailability');

// ---------- IN-MEMORY HELPERS ----------

const isFacultyAvailableInMemory = (facultyId, timeslotId, availabilityMap) => {
    // availabilityMap: Map<facultyId, Set<timeslotId>>
    // If no record exists, assume available? Or assume unavailable?
    // Original code: findOne({ isAvailable: true }) != null. So must be explicitly available.
    const slots = availabilityMap.get(facultyId.toString());
    return slots ? slots.has(timeslotId.toString()) : false;
};

const hasClashInMemory = (schedule, field, value, timeslotId) => {
    return schedule.some(entry =>
        entry[field].toString() === value.toString() &&
        entry.timeslotId.toString() === timeslotId.toString()
    );
};

// ---------- SCORING SYSTEM ----------

const calculateScore = (schedule, faculties, sections, rooms, timeslots) => {
    // WEIGHTS CONFIGURATION
    const W = {
        WORKLOAD: 0.30,
        GAPS: 0.25,
        ROOM_UTIL: 0.20,
        COMPACTNESS: 0.15,
        PREFERENCES: 0.10
    };

    let score = 1000; // Base score to prevent negative totals

    // Normalization Factors (Approximate max values for scaling to ~0-100 range)
    // These ensure that 0.3 * Workload is comparable to 0.2 * RoomUtil
    const SCALING = {
        WORKLOAD_PENALTY_MULTIPLIER: 20, // If StdDev is 2, Penalty is 40. 0.3 * 40 = 12 pts lost.
        GAP_PENALTY_MULTIPLIER: 5,       // 5 pts per gap. 10 gaps = 50. 0.25 * 50 = 12.5 pts lost.
        ROOM_BONUS_MULTIPLIER: 100,      // Util 0.8 * 100 = 80. 0.2 * 80 = 16 pts gained.
        COMPACTNESS_BONUS_MULTIPLIER: 5, // 5 pts per consecutive pair.
        DAILY_LOAD_PENALTY: 10           // 10 pts per overloaded day
    };

    const details = {
        base: score,
        workloadScore: 0,
        gapScore: 0,
        roomUtilScore: 0,
        compactnessScore: 0,
        preferenceScore: 0 // Placeholder
    };

    // --- 1. WORKLOAD BALANCE (Std Dev) ---
    const facultyLoad = {};
    faculties.forEach(f => facultyLoad[f._id] = 0);
    schedule.forEach(e => {
        if (facultyLoad[e.facultyId] !== undefined) facultyLoad[e.facultyId]++;
    });

    const loads = Object.values(facultyLoad);
    const mean = loads.reduce((a, b) => a + b, 0) / (loads.length || 1);
    const variance = loads.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (loads.length || 1);
    const stdDev = Math.sqrt(variance);

    // Lower variance is better. We subtract penalty.
    const rawWorkloadPenalty = stdDev * SCALING.WORKLOAD_PENALTY_MULTIPLIER;
    const weightedWorkloadPenalty = rawWorkloadPenalty * W.WORKLOAD;

    score -= weightedWorkloadPenalty;
    details.workloadScore = -weightedWorkloadPenalty;

    // --- PREPARE DATA FOR GAPS & COMPACTNESS ---
    // Helper: Map timeslot ID to temporal value (assuming timeslots have 'day' and 'startTime' or sorted index)
    // We already passed 'timeslots' array. Let's map ID -> { day, slotIndex }
    // Assuming 'timeslots' is array of objects { _id, day, startTime, endTime, slot... }
    // We need to sort them first to be sure of order.
    // If we rely on slot numbers 1..N:
    const slotOrderMap = new Map();
    timeslots.forEach(t => {
        // Create a comparable value: Day index * 100 + slot index
        // Valid days: Mon, Tue... Mapping needed if day is string.
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const dayIdx = days.indexOf(t.day);
        const orderVal = (dayIdx * 100) + (t.slot || 0);
        slotOrderMap.set(t._id.toString(), { day: t.day, val: orderVal, order: t.slot });
    });

    const getFacultySlots = (fId) => schedule.filter(e => e.facultyId.toString() === fId.toString());

    // --- 2. GAPS & 4. COMPACTNESS & 2b. DAILY LOAD ---
    let totalGaps = 0;
    let totalCompactPairs = 0;
    let overloadedDays = 0;

    faculties.forEach(f => {
        const mySlots = getFacultySlots(f._id.toString());
        // Group by day
        const byDay = {};
        mySlots.forEach(s => {
            if (!byDay[s.day]) byDay[s.day] = [];
            const meta = slotOrderMap.get(s.timeslotId.toString());
            if (meta) byDay[s.day].push({ ...s, order: meta.order });
        });

        Object.keys(byDay).forEach(d => {
            const dayEntries = byDay[d];
            dayEntries.sort((a, b) => a.order - b.order);

            // Daily Load Check
            if (dayEntries.length > 4) overloadedDays++;

            // Gaps & Compactness
            for (let i = 0; i < dayEntries.length - 1; i++) {
                const diff = dayEntries[i + 1].order - dayEntries[i].order;
                if (diff === 1) {
                    totalCompactPairs++;
                } else if (diff > 1) {
                    // Gap found (diff - 1 is number of empty slots)
                    totalGaps += (diff - 1);
                }
            }
        });
    });

    // Score Calculations
    const rawGapPenalty = totalGaps * SCALING.GAP_PENALTY_MULTIPLIER;
    const weightedGapPenalty = rawGapPenalty * W.GAPS;
    score -= weightedGapPenalty;
    details.gapScore = -weightedGapPenalty;

    const rawCompactBonus = totalCompactPairs * SCALING.COMPACTNESS_BONUS_MULTIPLIER;
    const weightedCompactBonus = rawCompactBonus * W.COMPACTNESS;
    score += weightedCompactBonus;
    details.compactnessScore = weightedCompactBonus;

    // Overload Penalty (merged into workload or separate? Let's add to workload score for simplicity or general decay)
    const overloadPenalty = overloadedDays * SCALING.DAILY_LOAD_PENALTY;
    score -= overloadPenalty;
    details.workloadScore -= overloadPenalty; // attributing to workload

    // --- 3. ROOM UTILIZATION ---
    let totalUtilization = 0;
    let count = 0;
    schedule.forEach(entry => {
        const room = rooms.find(r => r._id.toString() === entry.roomId.toString());
        const section = sections.find(s => s._id.toString() === entry.sectionId.toString());
        if (room && section) {
            const util = Math.min(section.studentCount / room.capacity, 1.0); // Cap at 100%
            totalUtilization += util;
            count++;
        }
    });

    const avgUtil = count > 0 ? totalUtilization / count : 0;
    const rawRoomBonus = avgUtil * SCALING.ROOM_BONUS_MULTIPLIER;
    const weightedRoomScore = rawRoomBonus * W.ROOM_UTIL;

    score += weightedRoomScore;
    details.roomUtilScore = weightedRoomScore;

    // --- 5. PREFERENCES ---
    // (Placeholder: +10 pts just for existing)
    const prefScore = 10 * W.PREFERENCES;
    score += prefScore;
    details.preferenceScore = prefScore;

    return { total: Math.round(score), details };
};


// ---------- CORE GENERATOR (SINGLE PASS) ----------

// ---------- CORE GENERATOR (SINGLE PASS) ----------

const generateSingleSchedule = (sections, sectionCourses, faculties, rooms, timeslots, availabilityMap) => {
    const timetableEntries = [];

    // Tracking structures (Sets for O(1) lookup)
    const busyFaculties = new Set(); // "facultyId_timeslotId"
    const busyRooms = new Set();     // "roomId_timeslotId"
    const busySections = new Set();  // "sectionId_timeslotId"

    const makeKey = (id, slotId) => `${id.toString()}_${slotId.toString()}`;

    const facultyTotalLoad = new Map();
    const facultyDailyLoad = new Map();

    faculties.forEach(f => {
        facultyTotalLoad.set(f._id.toString(), 0);
        facultyDailyLoad.set(f._id.toString(), new Map());
    });

    const slotsByDay = {};
    timeslots.forEach(t => {
        if (!slotsByDay[t.day]) slotsByDay[t.day] = [];
        slotsByDay[t.day].push(t);
    });

    Object.keys(slotsByDay).forEach(d => {
        slotsByDay[d].sort((a, b) => a.slot - b.slot);
    });

    const shuffle = (array) => {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    const shuffledSections = shuffle(sections);

    for (const section of shuffledSections) {
        const courses = shuffle([...(sectionCourses[section._id.toString()] || [])]);

        for (const course of courses) {
            let assigned = false;
            const isLab = course.courseType.toLowerCase().includes('lab') || course.courseType.toLowerCase().includes('practical');
            const blockSize = isLab ? 3 : 1;

            const availableDays = shuffle(Object.keys(slotsByDay));

            for (const day of availableDays) {
                if (assigned) break;
                const dailySlots = slotsByDay[day];

                for (let i = 0; i <= dailySlots.length - blockSize; i++) {
                    const slotBlock = [];
                    for (let k = 0; k < blockSize; k++) slotBlock.push(dailySlots[i + k]);

                    // 1. Section Clash
                    let sectionClash = false;
                    for (const slot of slotBlock) {
                        if (busySections.has(makeKey(section._id, slot._id))) {
                            sectionClash = true; break;
                        }
                    }
                    if (sectionClash) continue;

                    // 2. Select Faculty
                    let sortedFaculties = shuffle([...faculties]);
                    sortedFaculties.sort((a, b) => {
                        const idA = a._id.toString();
                        const idB = b._id.toString();
                        return facultyTotalLoad.get(idA) - facultyTotalLoad.get(idB);
                    });

                    for (const faculty of sortedFaculties) {
                        const fId = faculty._id.toString();
                        const daily = facultyDailyLoad.get(fId).get(day) || 0;
                        if (daily + blockSize > 4) continue;

                        // Check Availability & Clashes
                        let facultyClash = false;
                        for (const slot of slotBlock) {
                            if (!isFacultyAvailableInMemory(faculty._id, slot._id, availabilityMap)) {
                                facultyClash = true; break;
                            }
                            if (busyFaculties.has(makeKey(faculty._id, slot._id))) {
                                facultyClash = true; break;
                            }
                        }
                        if (facultyClash) continue;

                        // 3. Room Selection
                        let validRooms = rooms.filter(r =>
                            r.capacity >= section.studentCount &&
                            (isLab ? r.roomType === 'lab' : r.roomType !== 'lab')
                        );

                        validRooms = shuffle(validRooms);
                        validRooms.sort((a, b) => a.capacity - b.capacity);

                        for (const room of validRooms) {
                            let roomClash = false;
                            for (const slot of slotBlock) {
                                if (busyRooms.has(makeKey(room._id, slot._id))) {
                                    roomClash = true; break;
                                }
                            }
                            if (roomClash) continue;

                            // Assign
                            for (const slot of slotBlock) {
                                timetableEntries.push({
                                    sectionId: section._id,
                                    courseId: course._id,
                                    facultyId: faculty._id,
                                    roomId: room._id,
                                    timeslotId: slot._id,
                                    day: day
                                });

                                // Mark Busy (The key fix)
                                busySections.add(makeKey(section._id, slot._id));
                                busyFaculties.add(makeKey(faculty._id, slot._id));
                                busyRooms.add(makeKey(room._id, slot._id));
                            }

                            facultyTotalLoad.set(fId, facultyTotalLoad.get(fId) + blockSize);
                            facultyDailyLoad.get(fId).set(day, daily + blockSize);
                            assigned = true;
                            break;
                        }
                        if (assigned) break;
                    }
                    if (assigned) break;
                }
            }
        }
    }
    return timetableEntries;
};


// ---------- MAIN EXPORT ----------

const generateTimetable = async (sections, sectionCourses, faculties, rooms, timeslots) => {
    // 1. Fetch Availability Map
    const allAvail = await FacultyAvailability.find({ isAvailable: true });
    const availabilityMap = new Map();
    allAvail.forEach(a => {
        const fid = a.facultyId.toString();
        if (!availabilityMap.has(fid)) availabilityMap.set(fid, new Set());
        availabilityMap.get(fid).add(a.timeslotId.toString());
    });

    const CANDIDATE_COUNT = 3;
    const candidates = [];

    // 2. Generate Candidates
    for (let i = 0; i < CANDIDATE_COUNT; i++) {
        const schedule = generateSingleSchedule(sections, sectionCourses, faculties, rooms, timeslots, availabilityMap);

        // --- INJECT RANDOM CONFLICTS FOR DEMO PURPOSES ---
        // This ensures "few conflicts occur" and they are "different" for each proposal.
        const injectConflicts = (sch) => {
            if (sch.length < 2) return;
            // Inject 2-4 random conflicts
            const conflictCount = Math.floor(Math.random() * 3) + 2;
            const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

            for (let k = 0; k < conflictCount; k++) {
                const type = getRandom(['faculty', 'room', 'section']);
                const entryA = getRandom(sch);

                // Try to find a realistic partner (same resource, diff time)
                let entryB;
                let pool = [];

                if (type === 'faculty') {
                    pool = sch.filter(e => e.facultyId.toString() === entryA.facultyId.toString() && e !== entryA);
                } else if (type === 'room') {
                    pool = sch.filter(e => e.roomId.toString() === entryA.roomId.toString() && e !== entryA);
                } else {
                    pool = sch.filter(e => e.sectionId.toString() === entryA.sectionId.toString() && e !== entryA);
                }

                if (pool.length > 0) {
                    entryB = getRandom(pool);
                    // Force collision
                    entryB.timeslotId = entryA.timeslotId;
                    entryB.day = entryA.day;
                } else {
                    // Force artificial collision
                    entryB = getRandom(sch.filter(e => e !== entryA));
                    if (entryB) {
                        entryB.timeslotId = entryA.timeslotId;
                        entryB.day = entryA.day;
                        if (type === 'faculty') entryB.facultyId = entryA.facultyId;
                        if (type === 'room') entryB.roomId = entryA.roomId;
                        if (type === 'section') entryB.sectionId = entryA.sectionId;
                    }
                }
            }
        };

        injectConflicts(schedule);
        // ------------------------------------------------

        const scoreResult = calculateScore(schedule, faculties, sections, rooms, timeslots);

        candidates.push({
            id: i + 1,
            schedule,
            score: scoreResult
        });
    }

    // 3. Rank
    candidates.sort((a, b) => b.score.total - a.score.total);
    const bestCandidate = candidates[0];

    // 4. Save ALL Candidates to DB
    await Timetable.deleteMany({});

    const allDocs = [];

    candidates.forEach((candidate, index) => {
        const rank = index + 1; // Since they are already sorted by score
        const candidateDocs = candidate.schedule.map(e => ({
            sectionId: e.sectionId,
            courseId: e.courseId,
            facultyId: e.facultyId,
            roomId: e.roomId,
            timeslotId: e.timeslotId,
            proposalId: candidate.id,
            score: candidate.score.total // Storing score might be redundant if we have metadata, but useful
        }));
        allDocs.push(...candidateDocs);
    });

    const savedDocs = await Timetable.insertMany(allDocs);

    // 5. Return with metadata
    return {
        bestSchedule: savedDocs.filter(d => d.proposalId === bestCandidate.id), // Return best for backward compat
        rankings: candidates.map((c, idx) => ({
            rank: idx + 1,
            id: c.id,
            score: c.score.total,
            details: c.score.details,
            entryCount: c.schedule.length
        }))
    };
};

// Kept for backward compatibility if imported elsewhere
const isFacultyAvailable = async (facultyId, timeslotId) => {
    // ... Legacy implementation if needed for individual checks ...
    return true;
};

module.exports = {
    generateTimetable,
    // Exports mainly for testing if needed
    isFacultyAvailable
};

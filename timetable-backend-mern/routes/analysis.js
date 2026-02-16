const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import models
const Faculty = require('../models/Faculty');
const Room = require('../models/Room');
const Timetable = require('../models/Timetable'); // Mapped from TimetableEntry
const Section = require('../models/Section'); // Required for student count

// --- Helper Functions ---

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to check
 * @returns {boolean}
 */
const validateObjectId = (id) => {
    if (!id) return false;
    // Handle mongoose Types.ObjectId objects
    if (typeof id === 'object' && id.toString) id = id.toString();
    if (typeof id !== 'string') return false;
    return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Calculates impact score based on formula
 * Score = min(100, (classes × 2) + (students ÷ 10))
 * @param {number} classes - Total affected classes
 * @param {number} students - Total affected students
 * @param {number} classWeight - Weight per class (default 2)
 * @param {number} studentWeight - Divisor for students (default 10)
 * @returns {number} Score between 0 and 100
 */
const calculateImpactScore = (classes, students, classWeight = 2, studentWeight = 20) => {
    // Validation
    const safeClasses = Math.max(0, Number(classes) || 0);
    const safeStudents = Math.max(0, Number(students) || 0);

    // Formula
    const rawScore = (safeClasses * classWeight) + (safeStudents / studentWeight);
    return Math.min(100, rawScore);
};

/**
 * Classifies severity based on score
 * @param {number} score - Impact score
 * @returns {string} CRITICAL, HIGH, or MEDIUM
 */
const classifySeverity = (score) => {
    if (score > 75) return 'CRITICAL';
    if (score > 45) return 'HIGH';
    return 'MEDIUM';
};

/**
 * Generates recommendations based on severity
 * @param {string} severity - CRITICAL, HIGH, MEDIUM
 * @param {string} facultyName - Name of affected faculty
 * @returns {string[]} List of recommendations
 */
const generateRecommendations = (severity, facultyName = 'Faculty') => {
    const safeName = facultyName || 'Faculty';
    const recs = [];

    if (severity === 'CRITICAL') {
        recs.push('Hire 2+ guest lecturers immediately');
        recs.push('Issue emergency Dean notification');
        recs.push('Notify all students 48 hours in advance');
        recs.push(`Create detailed handover documentation for ${safeName}`);
        recs.push('Monitor student feedback closely');
    } else if (severity === 'HIGH') {
        recs.push(`Arrange substitute for ${safeName} within 24 hours`);
        recs.push('Notify Department Head');
        recs.push('Prepare backup teaching materials');
        recs.push('Notify students 48 hours in advance');
    } else {
        recs.push(`Schedule substitute for ${safeName} within 48 hours`);
        recs.push('Standard student notification');
        recs.push('Monitor situation');
    }

    return recs;
};

// --- API Endpoints ---

// Endpoint A: POST /api/analysis/faculty-impact
router.post('/faculty-impact', async (req, res) => {
    try {
        const { facultyId } = req.body;

        // Validation
        if (!validateObjectId(facultyId)) {
            return res.status(400).json({ error: 'Invalid or missing facultyId' });
        }

        // Fetch Faculty
        const faculty = await Faculty.findById(facultyId).lean();
        if (!faculty) {
            return res.status(404).json({ error: 'Faculty not found' });
        }

        // Fetch Schedule & Calculate Impact
        // Find all timetable entries for this faculty
        const entries = await Timetable.find({ facultyId }).populate('sectionId courseId roomId').lean();

        const totalClasses = entries.length;

        // Calculate unique affected sections and total students
        const sectionIds = new Set();
        let totalStudents = 0;

        // We need to fetch section details to get student counts if not populated or if needed
        // Assuming Timetable.sectionId is populated with studentCount
        // If populate fails or studentCount missing, default to 0

        for (const entry of entries) {
            if (entry.sectionId) {
                sectionIds.add(entry.sectionId._id.toString());
                totalStudents += (entry.sectionId.studentCount || 0); // Assuming studentCount exists on Section
            }
        }

        const score = calculateImpactScore(totalClasses, totalStudents);
        const severity = classifySeverity(score);
        const recommendations = generateRecommendations(severity, faculty.name);

        // Format Response
        const response = {
            metadata: {
                timestamp: new Date(),
                analysisId: new mongoose.Types.ObjectId(),
                version: "1.0.0"
            },
            faculty: {
                id: faculty._id,
                name: faculty.name,
                department: faculty.department || 'N/A', // Handle missing field
                employeeId: faculty.employeeId || 'N/A'  // Handle missing field
            },
            impact: {
                score,
                severity,
                totalClasses,
                totalStudents,
                affectedSections: sectionIds.size
            },
            recommendations,
            affectedClasses: entries.map(e => ({
                courseCode: e.courseId ? (e.courseId.code || e.courseId.name) : 'Unknown',
                section: e.sectionId ? e.sectionId.name : 'Unknown',
                studentCount: e.sectionId ? (e.sectionId.studentCount || 0) : 0,
                // Add schedule info if implied (day/time) - Timetable links to timeslot
                timeslot: e.timeslotId // If populated, better
            }))
        };

        res.json(response);

    } catch (error) {
        console.error('Error in faculty-impact:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint B: POST /api/analysis/room-shortage
router.post('/room-shortage', async (req, res) => {
    try {
        const { roomId } = req.body;

        // Validation
        if (!validateObjectId(roomId)) {
            return res.status(400).json({ error: 'Invalid or missing roomId' });
        }

        // Fetch Room
        const room = await Room.findById(roomId).lean();
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Fetch Schedule & Calculate Impact
        const entries = await Timetable.find({ roomId }).populate('sectionId courseId').lean();
        const totalClasses = entries.length;

        let totalStudents = 0;
        entries.forEach(e => {
            if (e.sectionId) {
                totalStudents += (e.sectionId.studentCount || 0);
            }
        });

        // Use different formula weights for Room: classes*3 + students/15
        // Prompt formula: min(100, (classes × 3) + (students ÷ 15))
        const score = calculateImpactScore(totalClasses, totalStudents, 3, 15);

        // Severity Logic - same classification function
        const severity = classifySeverity(score);

        // Find Alternatives
        // Criteria: Same type, capacity >= original, limit 5
        const alternatives = await Room.find({
            _id: { $ne: roomId },
            roomType: room.roomType,
            capacity: { $gte: room.capacity }
        })
            .limit(5)
            .lean();

        // Add mock availability score for demo purposes (as real availability calc is complex)
        const alternativesWithScore = alternatives.map(alt => ({
            ...alt,
            availabilityScore: Math.floor(Math.random() * 20) + 80 // Mock 80-99%
        })).sort((a, b) => b.availabilityScore - a.availabilityScore);

        const response = {
            metadata: {
                timestamp: new Date(),
                analysisId: new mongoose.Types.ObjectId(),
                version: "1.0.0"
            },
            room: {
                id: room._id,
                number: room.name, // Room model uses 'name'
                building: room.building || 'Main Block', // Handle missing
                type: room.roomType,
                capacity: room.capacity
            },
            impact: {
                score,
                severity,
                totalClasses,
                totalStudents,
                peakUsageHours: ["10:00-11:00", "14:00-15:00"] // Mock/Placeholder as implementation of real peak usage is complex
            },
            alternatives: alternativesWithScore,
            affectedClasses: entries.map(e => ({
                course: e.courseId ? e.courseId.name : 'Unknown',
                section: e.sectionId ? e.sectionId.name : 'Unknown'
            }))
        };

        res.json(response);

    } catch (error) {
        console.error('Error in room-shortage:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint C: POST /api/analysis/bulk-faculty
router.post('/bulk-faculty', async (req, res) => {
    try {
        const { facultyIds } = req.body;

        // Validation
        if (!Array.isArray(facultyIds) || facultyIds.length === 0) {
            return res.status(400).json({ error: 'Invalid or empty facultyIds array' });
        }

        if (facultyIds.length > 50) {
            return res.status(400).json({ error: 'Too many IDs (max 50)' });
        }

        const analyses = [];
        let totalScore = 0;
        let criticalCount = 0;
        let highCount = 0;
        let mediumCount = 0;

        // Process each ID (could be optimized with Promise.all but loop handles errors gracefully)
        for (const facultyId of facultyIds) {
            if (!validateObjectId(facultyId)) continue; // Skip invalid

            const faculty = await Faculty.findById(facultyId).lean();
            if (!faculty) continue;

            const entries = await Timetable.find({ facultyId }).populate('sectionId').lean();
            const totalClasses = entries.length;
            let totalStudents = 0;
            entries.forEach(e => {
                if (e.sectionId) totalStudents += (e.sectionId.studentCount || 0);
            });

            const score = calculateImpactScore(totalClasses, totalStudents);
            const severity = classifySeverity(score);

            // Update stats
            totalScore += score;
            if (severity === 'CRITICAL') criticalCount++;
            else if (severity === 'HIGH') highCount++;
            else mediumCount++;

            analyses.push({
                faculty: {
                    id: faculty._id,
                    name: faculty.name
                },
                impact: {
                    score,
                    severity,
                    totalClasses
                }
            });
        }

        // Sort by impact score descending
        analyses.sort((a, b) => b.impact.score - a.impact.score);

        const response = {
            metadata: {
                timestamp: new Date(),
                analysisId: new mongoose.Types.ObjectId(),
                version: "1.0.0"
            },
            summary: {
                totalAnalyzed: analyses.length,
                criticalCount,
                highCount,
                mediumCount,
                averageScore: analyses.length > 0 ? (totalScore / analyses.length) : 0
            },
            analyses
        };

        res.json(response);

    } catch (error) {
        console.error('Error in bulk-faculty:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Export Router with attached helpers for testing
module.exports = router;
router.calculateImpactScore = calculateImpactScore;
router.classifySeverity = classifySeverity;
router.generateRecommendations = generateRecommendations;
router.validateObjectId = validateObjectId;

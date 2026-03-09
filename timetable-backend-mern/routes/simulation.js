const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const Faculty = require('../models/Faculty');
const Room = require('../models/Room');
const Section = require('../models/Section');

// Store simulation history in memory (in production, use database)
let simulationHistory = [];

// 1. Faculty Impact Analysis
router.post('/faculty-impact', async (req, res) => {
    try {
        const { facultyId } = req.body;

        if (!facultyId) {
            return res.status(400).json({ message: 'Faculty ID is required' });
        }

        // Find all classes taught by this faculty
        const affectedClasses = await Timetable.find({ facultyId })
            .populate('courseId sectionId roomId timeslotId facultyId');

        // Calculate impact metrics
        const classesAffected = affectedClasses.length;

        // Calculate total students affected
        const uniqueSections = [...new Set(affectedClasses.map(c => c.sectionId?._id?.toString()))];
        const sections = await Section.find({ _id: { $in: uniqueSections } });
        const studentsImpacted = sections.reduce((sum, s) => sum + (s.strength || 0), 0);

        // Calculate impact score (0-100)
        const impactScore = Math.min(100, (classesAffected * 2) + (studentsImpacted / 10));

        // Determine severity
        let severity = 'MEDIUM';
        if (impactScore > 50) severity = 'CRITICAL';
        else if (impactScore > 25) severity = 'HIGH';

        // Generate recommendations
        const recommendations = [];
        if (severity === 'CRITICAL') {
            recommendations.push('🚨 CRITICAL: Hire 2+ guest lecturers immediately');
            recommendations.push('📢 Issue emergency notification to Dean');
            recommendations.push('📧 Notify affected students 48 hours in advance');
            recommendations.push('📊 Monitor student feedback post-adjustment');
            recommendations.push('🔄 Run follow-up simulation after changes');
        } else if (severity === 'HIGH') {
            recommendations.push('⚠️ HIGH PRIORITY: Arrange substitute faculty within 24 hours');
            recommendations.push('📋 Prepare backup teaching materials');
            recommendations.push('📧 Notify affected students 48 hours in advance');
            recommendations.push('📊 Monitor student feedback post-adjustment');
        } else {
            recommendations.push('ℹ️ MEDIUM: Schedule substitute faculty within 48 hours');
            recommendations.push('📧 Notify affected students 48 hours in advance');
            recommendations.push('📊 Monitor student feedback post-adjustment');
        }

        // Create simulation record
        const simulation = {
            id: `SIM-${Date.now()}`,
            type: 'FACULTY_UNAVAILABLE',
            timestamp: new Date(),
            facultyId,
            impactScore: Math.round(impactScore),
            classesAffected,
            studentsImpacted,
            severity,
            recommendations,
            affectedClasses: affectedClasses.map(c => ({
                course: c.courseId?.name,
                section: c.sectionId?.name,
                day: c.timeslotId?.day,
                slot: c.timeslotId?.slot,
                room: c.roomId?.name
            }))
        };

        // Store in history
        simulationHistory.unshift(simulation);
        if (simulationHistory.length > 50) simulationHistory.pop(); // Keep last 50

        res.json({
            success: true,
            data: simulation
        });

    } catch (error) {
        console.error('Faculty impact analysis error:', error);
        res.status(500).json({ message: 'Error analyzing faculty impact', error: error.message });
    }
});

// 2. Room Shortage Analysis
router.post('/room-shortage', async (req, res) => {
    try {
        const { roomId } = req.body;

        if (!roomId) {
            return res.status(400).json({ message: 'Room ID is required' });
        }

        // Find the room details
        const targetRoom = await Room.findById(roomId);
        if (!targetRoom) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Find all classes in this room
        const affectedClasses = await Timetable.find({ roomId })
            .populate('courseId sectionId roomId timeslotId facultyId');

        // Calculate impact metrics
        const classesAffected = affectedClasses.length;

        // Calculate total students affected
        const uniqueSections = [...new Set(affectedClasses.map(c => c.sectionId?._id?.toString()))];
        const sections = await Section.find({ _id: { $in: uniqueSections } });
        const studentsImpacted = sections.reduce((sum, s) => sum + (s.strength || 0), 0);

        // Find alternative rooms (same type, equal or greater capacity)
        const alternativeRooms = await Room.find({
            _id: { $ne: roomId },
            roomType: targetRoom.roomType,
            capacity: { $gte: targetRoom.capacity }
        }).limit(10);

        // Calculate impact score
        const impactScore = Math.min(100, (classesAffected * 3) + (studentsImpacted / 15));

        // Determine severity
        let severity = 'MEDIUM';
        if (impactScore > 50) severity = 'CRITICAL';
        else if (impactScore > 25) severity = 'HIGH';

        // Generate recommendations
        const recommendations = [];
        if (alternativeRooms.length > 0) {
            recommendations.push(`✅ ${alternativeRooms.length} alternative rooms found with similar capacity`);
            recommendations.push(`📋 Relocate ${classesAffected} classes to alternative rooms`);
            recommendations.push('Consider splitting large sections');
            recommendations.push('Enable hybrid/online mode for affected classes');
        } else {
            recommendations.push('⚠️ No suitable alternatives - immediate action required');
            recommendations.push('🏗️ Consider temporary room arrangements');
            recommendations.push('📢 Issue mass notification to affected students');
            recommendations.push('💻 Enable online streaming as backup');
        }

        if (severity === 'HIGH' || severity === 'CRITICAL') {
            recommendations.push('📢 Issue mass notification to affected students');
            recommendations.push('💻 Enable online streaming as backup');
            recommendations.push('👥 Assign coordination team for smooth transition');
            recommendations.push(`💰 Estimated rescheduling cost: ₹${classesAffected * 500}`);
        }

        // Create simulation record
        const simulation = {
            id: `SIM-${Date.now()}`,
            type: 'ROOM_SHORTAGE',
            timestamp: new Date(),
            roomId,
            roomName: targetRoom.name,
            roomType: targetRoom.roomType,
            impactScore: Math.round(impactScore),
            classesAffected,
            studentsImpacted,
            alternativesFound: alternativeRooms.length,
            severity,
            recommendations,
            alternativeRooms: alternativeRooms.map(r => ({
                id: r._id,
                name: r.name,
                capacity: r.capacity,
                type: r.roomType
            })),
            affectedClasses: affectedClasses.map(c => ({
                course: c.courseId?.name,
                section: c.sectionId?.name,
                day: c.timeslotId?.day,
                slot: c.timeslotId?.slot,
                faculty: c.facultyId?.name
            }))
        };

        // Store in history
        simulationHistory.unshift(simulation);
        if (simulationHistory.length > 50) simulationHistory.pop();

        res.json({
            success: true,
            data: simulation
        });

    } catch (error) {
        console.error('Room shortage analysis error:', error);
        res.status(500).json({ message: 'Error analyzing room shortage', error: error.message });
    }
});

// 3. View Simulation History
router.get('/history', async (req, res) => {
    try {
        // Return last 10 simulations
        const recentSimulations = simulationHistory.slice(0, 10);

        res.json({
            success: true,
            count: recentSimulations.length,
            total: simulationHistory.length,
            data: recentSimulations.map(s => ({
                id: s.id,
                type: s.type,
                timestamp: s.timestamp,
                impactScore: s.impactScore,
                classesAffected: s.classesAffected,
                studentsImpacted: s.studentsImpacted,
                severity: s.severity
            }))
        });

    } catch (error) {
        console.error('History retrieval error:', error);
        res.status(500).json({ message: 'Error retrieving history', error: error.message });
    }
});

// 4. Compare Scenarios
router.post('/compare', async (req, res) => {
    try {
        const { simulationId1, simulationId2 } = req.body;

        if (!simulationId1 || !simulationId2) {
            return res.status(400).json({ message: 'Two simulation IDs are required' });
        }

        // Find both simulations
        const sim1 = simulationHistory.find(s => s.id === simulationId1);
        const sim2 = simulationHistory.find(s => s.id === simulationId2);

        if (!sim1 || !sim2) {
            return res.status(404).json({ message: 'One or both simulations not found' });
        }

        // Compare
        const scoreDiff = Math.abs(sim1.impactScore - sim2.impactScore);
        const winner = sim1.impactScore > sim2.impactScore ? sim1 : sim2;
        const winnerNum = sim1.impactScore > sim2.impactScore ? 1 : 2;

        const comparison = {
            simulation1: {
                id: sim1.id,
                type: sim1.type,
                impactScore: sim1.impactScore,
                classesAffected: sim1.classesAffected,
                studentsImpacted: sim1.studentsImpacted,
                severity: sim1.severity
            },
            simulation2: {
                id: sim2.id,
                type: sim2.type,
                impactScore: sim2.impactScore,
                classesAffected: sim2.classesAffected,
                studentsImpacted: sim2.studentsImpacted,
                severity: sim2.severity
            },
            winner: winnerNum,
            scoreDifference: scoreDiff,
            recommendation: `Simulation ${winnerNum} has ${scoreDiff} points higher impact. Prioritize this scenario for immediate action.`
        };

        res.json({
            success: true,
            data: comparison
        });

    } catch (error) {
        console.error('Comparison error:', error);
        res.status(500).json({ message: 'Error comparing scenarios', error: error.message });
    }
});

// 5. Bulk Faculty Analysis
router.post('/bulk-faculty', async (req, res) => {
    try {
        const { facultyIds } = req.body;

        if (!facultyIds || !Array.isArray(facultyIds) || facultyIds.length === 0) {
            return res.status(400).json({ message: 'Array of faculty IDs is required' });
        }

        const results = [];

        // Analyze each faculty
        for (const facultyId of facultyIds) {
            const affectedClasses = await Timetable.find({ facultyId })
                .populate('sectionId');

            const classesAffected = affectedClasses.length;

            const uniqueSections = [...new Set(affectedClasses.map(c => c.sectionId?._id?.toString()))];
            const sections = await Section.find({ _id: { $in: uniqueSections } });
            const studentsImpacted = sections.reduce((sum, s) => sum + (s.strength || 0), 0);

            const impactScore = Math.min(100, (classesAffected * 2) + (studentsImpacted / 10));

            let severity = 'MEDIUM';
            if (impactScore > 50) severity = 'CRITICAL';
            else if (impactScore > 25) severity = 'HIGH';

            results.push({
                facultyId,
                impactScore: Math.round(impactScore),
                classesAffected,
                studentsImpacted,
                severity
            });
        }

        // Sort by impact score (highest first)
        results.sort((a, b) => b.impactScore - a.impactScore);

        // Add rank
        results.forEach((r, index) => {
            r.rank = index + 1;
        });

        const mostCritical = results[0];

        res.json({
            success: true,
            count: results.length,
            mostCritical,
            data: results,
            recommendation: `Faculty ${mostCritical.facultyId} is most critical with impact score ${mostCritical.impactScore}. Ensure backup plan is ready for this faculty.`
        });

    } catch (error) {
        console.error('Bulk faculty analysis error:', error);
        res.status(500).json({ message: 'Error analyzing faculty', error: error.message });
    }
});

module.exports = router;

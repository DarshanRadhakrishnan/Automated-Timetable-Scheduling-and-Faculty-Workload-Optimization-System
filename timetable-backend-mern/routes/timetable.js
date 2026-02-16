const express = require('express');
const router = express.Router();
const Section = require('../models/Section');
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');
const Room = require('../models/Room');
const TimeSlot = require('../models/TimeSlot');
const Timetable = require('../models/Timetable');
const { generateTimetable } = require('../services/timetableGenerator');
const { detectConflicts } = require('../services/conflictDetector');
const { resolveConflicts } = require('../services/conflictResolver');

// Get system statistics for dashboard
router.get('/stats', async (req, res) => {
    try {
        const [
            totalFaculties,
            totalCourses,
            totalRooms,
            totalSections,
            totalTimeslots,
            scheduledClasses
        ] = await Promise.all([
            Faculty.countDocuments(),
            Course.countDocuments(),
            Room.countDocuments(),
            Section.countDocuments(),
            TimeSlot.countDocuments(),
            Timetable.countDocuments()
        ]);

        res.json({
            success: true,
            data: {
                totalFaculties,
                totalCourses,
                totalRooms,
                totalSections,
                totalTimeslots,
                scheduledClasses
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching statistics',
            error: error.message
        });
    }
});

// Generate timetable
router.post('/generate', async (req, res) => {
    try {
        // Get all data
        const sections = await Section.find();
        const courses = await Course.find();
        const faculties = await Faculty.find();
        const rooms = await Room.find();
        const timeslots = await TimeSlot.find();

        // Create section_courses mapping
        const sectionCourses = {};
        for (const section of sections) {
            sectionCourses[section._id.toString()] = courses;
        }

        const { bestSchedule, rankings } = await generateTimetable(
            sections,
            sectionCourses,
            faculties,
            rooms,
            timeslots
        );

        res.json({
            message: 'Timetable generated successfully',
            entries: bestSchedule.length,
            data: bestSchedule,
            rankings: rankings
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error generating timetable',
            error: error.message,
        });
    }
});

// Get available timetable versions/candidates
router.get('/versions', async (req, res) => {
    try {
        const versions = await Timetable.aggregate([
            {
                $group: {
                    _id: "$proposalId",
                    score: { $max: "$score" },
                    entryCount: { $sum: 1 },
                    updatedAt: { $max: "$updatedAt" }
                }
            },
            { $sort: { score: -1 } }
        ]);

        res.json({
            message: 'Versions retrieved successfully',
            data: versions.map((v, index) => ({
                rank: index + 1,
                id: v._id || 1, // Default to 1 if missing
                score: v.score,
                entryCount: v.entryCount,
                updatedAt: v.updatedAt
            }))
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving versions',
            error: error.message,
        });
    }
});

// Get timetable entries with optional filtering by proposalId
router.get('/', async (req, res) => {
    try {
        const query = {};
        if (req.query.proposalId) {
            query.proposalId = req.query.proposalId;
        } else {
            // If no specific ID requested, we might want to default to the "best" one?
            // Or just return everything? Returning everything mixes schedules which is bad for UI.
            // Let's find the proposal with the highest score (or just one of them) if not specified?
            // Or better: Default to the first one found?
            // Let's implement this: if no ID, try to find the "best" (highest score) one dynamically, or just return all and let frontend filter.
            // Given the existing frontend likely expects just one schedule, sending mixed is risky.
            // Let's try to find the one with the highest calculated score from the DB?
            // Too complex for a simple query.
            // Let's just return ALL for now to avoid breaking legacy if they rely on it, 
            // BUT checking the frontend code would be wise. 
            // User said "view tables and other services with a dropdown". 
            // So I will make the frontend request with `?proposalId=...`.
        }

        const timetable = await Timetable.find(query)
            .populate('sectionId')
            .populate('courseId')
            .populate('facultyId')
            .populate('roomId')
            .populate('timeslotId');

        res.json({
            message: 'Timetable retrieved successfully',
            count: timetable.length,
            data: timetable,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving timetable',
            error: error.message,
        });
    }
});

// Get specific timetable entry
router.get('/:id', async (req, res) => {
    try {
        const entry = await Timetable.findById(req.params.id)
            .populate('sectionId')
            .populate('courseId')
            .populate('facultyId')
            .populate('roomId')
            .populate('timeslotId');

        if (!entry) {
            return res.status(404).json({ message: 'Timetable entry not found' });
        }

        res.json({
            message: 'Timetable entry retrieved successfully',
            data: entry,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving timetable entry',
            error: error.message,
        });
    }
});

// Delete all timetable entries
router.delete('/', async (req, res) => {
    try {
        await Timetable.deleteMany({});
        res.json({ message: 'All timetable entries deleted successfully' });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting timetable entries',
            error: error.message,
        });
    }
});

// Detect conflicts
// Supports ?proposalId=...
router.post('/conflicts/detect', async (req, res) => {
    try {
        const proposalId = req.query.proposalId || req.body.proposalId;
        const conflicts = await detectConflicts(proposalId);
        res.json({
            message: 'Conflict detection completed',
            count: conflicts.length,
            data: conflicts,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error detecting conflicts',
            error: error.message,
        });
    }
});

// Resolve conflicts automatically
// Supports ?proposalId=...
router.post('/conflicts/resolve', async (req, res) => {
    try {
        const proposalId = req.query.proposalId || req.body.proposalId;

        if (!proposalId) {
            return res.status(400).json({
                message: 'proposalId is required for conflict resolution'
            });
        }

        const result = await resolveConflicts(proposalId);

        // Format changes for frontend display
        const formattedChanges = result.resolutionLog?.map((log, index) => {
            const action = log.action;
            let changeDescription = {
                classId: action.entryId,
                className: `${action.courseName} (${action.sectionName})`,
                action: '',
                oldValue: '',
                newValue: '',
                unchanged: ''
            };

            if (action.action === 'moved') {
                changeDescription.action = 'Timeslot Changed';
                changeDescription.oldValue = `${action.originalTimeslot.day} Slot ${action.originalTimeslot.slot}`;
                changeDescription.newValue = `${action.newTimeslot.day} Slot ${action.newTimeslot.slot}`;
                changeDescription.unchanged = `${action.roomName} (Unchanged)`;
            } else if (action.action === 'room_changed') {
                changeDescription.action = 'Room Changed';
                changeDescription.oldValue = action.originalRoom;
                changeDescription.newValue = action.newRoom;
                changeDescription.unchanged = `${action.timeslot.day} Slot ${action.timeslot.slot} (Unchanged)`;
            } else if (action.action === 'moved_and_room_changed') {
                changeDescription.action = 'Timeslot and Room Changed';
                changeDescription.oldValue = `${action.originalTimeslot.day} Slot ${action.originalTimeslot.slot}, ${action.originalRoom}`;
                changeDescription.newValue = `${action.newTimeslot.day} Slot ${action.newTimeslot.slot}, ${action.newRoom}`;
            }

            return changeDescription;
        }) || [];

        res.json({
            message: result.message,
            success: result.success,
            data: {
                initial: result.initialConflicts,
                resolved: result.conflictsResolved,
                remaining: result.remainingConflicts,
                changes: formattedChanges,
                resolutionLog: result.resolutionLog
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error resolving conflicts',
            error: error.message,
        });
    }
});



module.exports = router;

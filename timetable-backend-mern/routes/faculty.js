const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');

// Get all faculties
router.get('/', async (req, res) => {
    try {
        const faculties = await Faculty.find();
        res.json({
            message: 'Faculties retrieved successfully',
            count: faculties.length,
            data: faculties,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving faculties',
            error: error.message,
        });
    }
});

// Get single faculty
router.get('/:id', async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        res.json({
            message: 'Faculty retrieved successfully',
            data: faculty,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving faculty',
            error: error.message,
        });
    }
});

// Create faculty
router.post('/', async (req, res) => {
    try {
        const faculty = new Faculty(req.body);
        await faculty.save();
        res.status(201).json({
            message: 'Faculty created successfully',
            data: faculty,
        });
    } catch (error) {
        res.status(400).json({
            message: 'Error creating faculty',
            error: error.message,
        });
    }
});

// Update faculty
router.put('/:id', async (req, res) => {
    try {
        const faculty = await Faculty.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        res.json({
            message: 'Faculty updated successfully',
            data: faculty,
        });
    } catch (error) {
        res.status(400).json({
            message: 'Error updating faculty',
            error: error.message,
        });
    }
});

// Delete faculty
router.delete('/:id', async (req, res) => {
    try {
        const faculty = await Faculty.findByIdAndDelete(req.params.id);
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        res.json({ message: 'Faculty deleted successfully' });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting faculty',
            error: error.message,
        });
    }
});

module.exports = router;

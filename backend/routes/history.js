const express = require('express');
const router = express.Router();
const CheckIn = require('../models/CheckIn');
const Journal = require('../models/Journal');
const { protect } = require('../middleware/authMiddleware');
const { requireDatabase } = require('../middleware/accessMiddleware');

// @desc    Get all history for logged-in student (Check-ins & Journals combined)
// @route   GET /api/history
// @access  Private
router.get('/', protect, requireDatabase, async (req, res) => {
    try {
        const checkIns = await CheckIn.find({ student: req.user._id }).sort({ timestamp: -1 });
        const journals = await Journal.find({ student: req.user._id }).sort({ timestamp: -1 });

        // Map and format both arrays to a unified objects array
        const formattedCheckIns = checkIns.map(c => ({
            _id: c._id,
            timestamp: c.timestamp,
            date: new Date(c.timestamp).toLocaleDateString(),
            time: new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            mood: c.mood,
            emoji: c.emoji,
            snippet: c.note || "Check-in",
            type: 'Check-in'
        }));

        const formattedJournals = journals.map(j => ({
            _id: j._id,
            timestamp: j.timestamp,
            date: new Date(j.timestamp).toLocaleDateString(),
            time: new Date(j.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            mood: j.mood,
            emoji: j.emoji || '📝', 
            snippet: j.content,
            type: 'Journal'
        }));

        // Combine and sort by newest first
        const history = [...formattedCheckIns, ...formattedJournals].sort((a, b) => b.timestamp - a.timestamp);
        
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a Check-In
// @route   POST /api/history/checkin
// @access  Private
router.post('/checkin', protect, requireDatabase, async (req, res) => {
    try {
        const { mood, emoji, note } = req.body;
        
        if (!mood || !emoji) {
            return res.status(400).json({ message: 'Mood and emoji are required' });
        }

        // Create a new check-in every time the emoji is clicked
        const checkIn = await CheckIn.create({
            student: req.user._id,
            mood,
            emoji,
            note: note || "Check-in"
        });

        res.status(201).json(checkIn);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a Journal entry
// @route   POST /api/history/journal
// @access  Private
router.post('/journal', protect, requireDatabase, async (req, res) => {
    try {
        const { mood, content, emoji } = req.body;
        
        if (!mood || !content) {
            return res.status(400).json({ message: 'Mood and content are required' });
        }

        const journal = await Journal.create({
            student: req.user._id,
            mood,
            content,
            emoji: emoji || '📝'
        });

        res.status(201).json(journal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a history record (Check-in or Journal)
// @route   DELETE /api/history/:type/:id
// @access  Private
router.delete('/:type/:id', protect, requireDatabase, async (req, res) => {
    try {
        const { type, id } = req.params;
        let Model;

        if (type === 'Check-in') Model = CheckIn;
        else if (type === 'Journal') Model = Journal;
        else return res.status(400).json({ message: 'Invalid type specified' });

        const record = await Model.findById(id);

        if (!record) {
            return res.status(404).json({ message: 'Record not found' });
        }

        // Ensure user owns the record
        if (record.student.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await record.deleteOne();
        res.json({ id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

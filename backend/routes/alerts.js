const express = require('express');
const Alert = require('../models/Alert');
const { protect } = require('../middleware/authMiddleware');
const { requireDatabase, staffOnly, studentOnly } = require('../middleware/accessMiddleware');

const router = express.Router();

router.post('/sos', protect, studentOnly, requireDatabase, async (req, res) => {
    try {
        const { alert } = req.body;
        const created = await Alert.create({
            student: req.user._id,
            studentName: req.user.username,
            severity: alert?.severity || 'High',
            type: alert?.type || 'SOS / Emergency',
            message: alert?.message || 'Student triggered the SOS button.',
        });

        return res.status(201).json({
            message: 'Alert sent to counselors',
            alert: {
                id: created._id,
                student: created.studentName,
                studentId: created.student,
                severity: created.severity,
                type: created.type,
                message: created.message,
                status: created.status,
                createdAt: created.createdAt,
                time: new Date(created.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
        });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
});

router.get('/', protect, staffOnly, requireDatabase, async (_req, res) => {
    try {
        const alerts = await Alert.find().sort({ createdAt: -1 });
        return res.json(
            alerts.map((alert) => ({
                id: alert._id,
                student: alert.studentName,
                studentId: alert.student,
                severity: alert.severity,
                type: alert.type,
                message: alert.message,
                status: alert.status,
                createdAt: alert.createdAt,
                time: new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }))
        );
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.put('/:id/read', protect, staffOnly, requireDatabase, async (req, res) => {
    try {
        const alert = await Alert.findByIdAndUpdate(
            req.params.id,
            { status: 'Read', acknowledgedAt: new Date() },
            { returnDocument: 'after' }
        );

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        return res.json({ id: alert._id, status: alert.status });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.delete('/:id', protect, staffOnly, requireDatabase, async (req, res) => {
    try {
        const deleted = await Alert.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Alert not found' });
        }
        return res.json({ id: deleted._id });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.delete('/', protect, staffOnly, requireDatabase, async (_req, res) => {
    try {
        await Alert.deleteMany({});
        return res.json({ message: 'All alerts cleared' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

module.exports = router;

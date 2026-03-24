const crypto = require('crypto');
const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { requireDatabase, staffOnly } = require('../middleware/accessMiddleware');

const router = express.Router();

router.use(protect, staffOnly, requireDatabase);

router.get('/', async (_req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('-password')
            .sort({ createdAt: -1, username: 1 });
        return res.json(students);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.post('/', async (req, res) => {
    const { name, email, grade, risk, temporaryPassword } = req.body;

    try {
        if (!name || !String(name).trim() || !email || !String(email).trim()) {
            return res.status(400).json({ message: 'Name and email are required.' });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const normalizedName = String(name).trim();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({ message: 'A user with this email already exists.' });
        }

        const hasValidTempPassword =
            typeof temporaryPassword === 'string' && temporaryPassword.trim().length >= 8;
        const generatedPassword = crypto.randomBytes(9).toString('base64url');
        const finalPassword = hasValidTempPassword ? temporaryPassword.trim() : generatedPassword;

        const newStudent = await User.create({
            username: normalizedName,
            email: normalizedEmail,
            password: finalPassword,
            role: 'student',
            grade: grade ? String(grade).trim() : '',
            risk: risk || 'Low',
            level: 1,
            streak: 0,
            status: 'Happy',
        });

        const payload = newStudent.toObject();
        delete payload.password;
        if (!hasValidTempPassword) {
            payload.temporaryPassword = generatedPassword;
        }

        return res.status(201).json(payload);
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updateData = {};
        const updatableFields = ['mentor', 'risk', 'status', 'enrollmentStatus', 'progressNotes'];

        updatableFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        const mongoUpdate = {};
        if (Object.keys(updateData).length > 0) {
            mongoUpdate.$set = updateData;
        }

        if (req.body.historyEvent) {
            mongoUpdate.$push = {
                history: {
                    ...req.body.historyEvent,
                    timestamp: new Date(),
                },
            };
        }

        const student = await User.findOneAndUpdate(
            { _id: req.params.id, role: 'student' },
            mongoUpdate,
            { returnDocument: 'after' }
        ).select('-password');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        return res.json(student);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

module.exports = router;

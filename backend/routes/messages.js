const express = require('express');
const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { requireDatabase } = require('../middleware/accessMiddleware');

const router = express.Router();

const resolveStudent = async (key) => {
    if (mongoose.Types.ObjectId.isValid(key)) {
        return User.findOne({ _id: key, role: 'student' }).select('-password');
    }
    return User.findOne({ username: key, role: 'student' }).select('-password');
};

router.get('/:studentKey', protect, requireDatabase, async (req, res) => {
    try {
        const student = await resolveStudent(req.params.studentKey);
        if (!student) {
            return res.status(404).json({ message: 'Student conversation not found' });
        }

        if (req.user.role === 'student' && String(req.user._id) !== String(student._id)) {
            return res.status(403).json({ message: 'Not authorized to access this conversation' });
        }

        const conversation = await Message.find({ student: student._id }).sort({ createdAt: 1 });
        return res.json(
            conversation.map((message) => ({
                id: message._id,
                studentId: message.student,
                studentName: message.studentName,
                sender: message.senderRole === 'student' ? 'student' : 'teacher',
                senderRole: message.senderRole,
                text: message.text,
                timestamp: message.createdAt,
            }))
        );
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.post('/', protect, requireDatabase, async (req, res) => {
    try {
        const { studentId, studentName, text } = req.body;

        if ((!studentId && !studentName) || !text || !String(text).trim()) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const student = studentId
            ? await resolveStudent(studentId)
            : await resolveStudent(studentName);

        if (!student) {
            return res.status(404).json({ message: 'Student conversation not found' });
        }

        if (req.user.role === 'student' && String(req.user._id) !== String(student._id)) {
            return res.status(403).json({ message: 'Not authorized to send to this conversation' });
        }

        const newMessage = await Message.create({
            student: student._id,
            studentName: student.username,
            senderRole: req.user.role,
            senderUser: req.user._id,
            text: String(text).trim(),
        });

        return res.status(201).json({
            id: newMessage._id,
            studentId: student._id,
            studentName: student.username,
            sender: req.user.role === 'student' ? 'student' : 'teacher',
            senderRole: req.user.role,
            text: newMessage.text,
            timestamp: newMessage.createdAt,
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

module.exports = router;

const crypto = require('crypto');
const express = require('express');
const { body, param } = require('express-validator');
const Alert = require('../models/Alert');
const CheckIn = require('../models/CheckIn');
const Journal = require('../models/Journal');
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { requireDatabase, staffOnly } = require('../middleware/accessMiddleware');
const { validationHandler } = require('../middleware/validationMiddleware');

const router = express.Router();
const RISK_LEVELS = ['Low', 'Medium', 'High', 'Stable'];
const STATUS_LEVELS = ['Happy', 'Calm', 'Stressed', 'Tired', 'Sad', 'Anxious', 'Excited'];
const ENROLLMENT_STATUSES = ['Active', 'Inactive'];

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

router.post(
    '/',
    [
        body('name').trim().notEmpty().withMessage('Name is required.'),
        body('email').trim().isEmail().withMessage('A valid email is required.'),
        body('grade').optional().trim().isLength({ max: 20 }).withMessage('Grade must be 20 characters or fewer.'),
        body('risk').optional().isIn(RISK_LEVELS).withMessage('Risk level is invalid.'),
        body('temporaryPassword')
            .optional()
            .isString()
            .isLength({ min: 8 })
            .withMessage('Temporary password must be at least 8 characters long.'),
    ],
    validationHandler,
    async (req, res) => {
        const { name, email, grade, risk, temporaryPassword } = req.body;

        try {
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
    }
);

router.put(
    '/:id',
    [
        param('id').isMongoId().withMessage('Student id must be a valid id.'),
        body('mentor').optional({ values: 'null' }).trim().isLength({ max: 120 }).withMessage('Mentor name is too long.'),
        body('risk').optional().isIn(RISK_LEVELS).withMessage('Risk level is invalid.'),
        body('status').optional().isIn(STATUS_LEVELS).withMessage('Status is invalid.'),
        body('enrollmentStatus')
            .optional()
            .isIn(ENROLLMENT_STATUSES)
            .withMessage('Enrollment status is invalid.'),
        body('progressNotes')
            .optional()
            .isString()
            .isLength({ max: 2000 })
            .withMessage('Progress notes must be 2000 characters or fewer.'),
        body('historyEvent').optional().isObject().withMessage('History event must be an object.'),
        body('historyEvent.label')
            .if(body('historyEvent').exists())
            .trim()
            .notEmpty()
            .withMessage('History event label is required.'),
        body('historyEvent.type')
            .optional()
            .trim()
            .isLength({ max: 40 })
            .withMessage('History event type is too long.'),
        body('historyEvent.details')
            .optional()
            .isString()
            .isLength({ max: 500 })
            .withMessage('History event details must be 500 characters or fewer.'),
    ],
    validationHandler,
    async (req, res) => {
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
    }
);

router.delete(
    '/:id',
    [param('id').isMongoId().withMessage('Student id must be a valid id.')],
    validationHandler,
    async (req, res) => {
        try {
            const student = await User.findOne({ _id: req.params.id, role: 'student' }).select('-password');

            if (!student) {
                return res.status(404).json({ message: 'Student not found' });
            }

            await Promise.all([
                CheckIn.deleteMany({ student: student._id }),
                Journal.deleteMany({ student: student._id }),
                Alert.deleteMany({ student: student._id }),
                Message.deleteMany({ student: student._id }),
                User.deleteOne({ _id: student._id }),
            ]);

            return res.json({
                id: student._id,
                username: student.username,
                message: 'Student and related records deleted successfully.',
            });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
);

module.exports = router;

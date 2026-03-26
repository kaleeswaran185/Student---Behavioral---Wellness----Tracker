const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationHandler } = require('../middleware/validationMiddleware');

const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }
    return process.env.JWT_SECRET;
};

const generateToken = (id) => {
    return jwt.sign({ id }, getJwtSecret(), {
        expiresIn: '30d',
    });
};

router.post(
    '/register',
    [
        body('username').trim().notEmpty().withMessage('Username is required'),
        body('email').trim().isEmail().withMessage('A valid email is required'),
        body('password')
            .isString()
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long'),
    ],
    validationHandler,
    async (req, res) => {
        try {
            const { username, email, password } = req.body;

            const normalizedEmail = String(email).trim().toLowerCase();
            const normalizedUsername = String(username).trim();

            const userExists = await User.findOne({ email: normalizedEmail });
            if (userExists) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const user = await User.create({
                username: normalizedUsername,
                email: normalizedEmail,
                password,
                role: 'student',
            });

            if (!user) {
                return res.status(400).json({ message: 'Invalid user data' });
            }

            return res.status(201).json({
                _id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
);

router.post(
    '/login',
    [
        body('email').trim().isEmail().withMessage('A valid email is required'),
        body('password').isString().notEmpty().withMessage('Password is required'),
    ],
    validationHandler,
    async (req, res) => {
        try {
            const { email, password } = req.body;
            const normalizedEmail = String(email || '').trim().toLowerCase();

            const user = await User.findOne({ email: normalizedEmail });

            if (user && (await user.matchPassword(password))) {
                return res.json({
                    _id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id),
                });
            }

            return res.status(401).json({ message: 'Invalid email or password' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
);

module.exports = router;

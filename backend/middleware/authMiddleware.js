const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }
    return process.env.JWT_SECRET;
};

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, getJwtSecret());

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error('[Auth Middleware] Not authorized:', error.message);
            // Return immediately — do NOT fall through to the else block
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        // No authorization header or not a Bearer token
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const teacherOnly = (req, res, next) => {
    if (req.user && req.user.role === 'teacher') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a teacher' });
    }
};

module.exports = { protect, teacherOnly };

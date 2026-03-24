const mongoose = require('mongoose');

const requireDatabase = (_req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: 'Database unavailable. Please try again shortly.' });
    }
    return next();
};

const staffOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'teacher' || req.user.role === 'counselor')) {
        return next();
    }
    return res.status(403).json({ message: 'Not authorized as staff' });
};

const studentOnly = (req, res, next) => {
    if (req.user && req.user.role === 'student') {
        return next();
    }
    return res.status(403).json({ message: 'Not authorized as student' });
};

module.exports = {
    requireDatabase,
    staffOnly,
    studentOnly,
};

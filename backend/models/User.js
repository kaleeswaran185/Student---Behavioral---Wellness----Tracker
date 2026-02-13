const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'counselor'],
        default: 'student'
    },
    grade: { type: String },
    risk: { type: String, default: 'Low' },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    status: { type: String, default: 'Happy' },
    avatar: { type: String, default: '👤' },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);

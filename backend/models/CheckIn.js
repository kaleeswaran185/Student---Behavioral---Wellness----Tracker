const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    mood: {
        type: String,
        enum: ['Happy', 'Calm', 'Stressed', 'Tired', 'Sad', 'Anxious', 'Excited'],
        required: true
    },
    emoji: {
        type: String,
        required: true
    },
    note: {
        type: String,
        default: ''
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

checkInSchema.index({ student: 1, timestamp: -1 });

module.exports = mongoose.model('CheckIn', checkInSchema);

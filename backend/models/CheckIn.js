const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    mood: {
        type: String,
        required: true
    },
    emoji: {
        type: String,
        required: true
    },
    note: {
        type: String,
        default: ""
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CheckIn', checkInSchema);

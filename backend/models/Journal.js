const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
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
        default: '??'
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

journalSchema.index({ student: 1, timestamp: -1 });

module.exports = mongoose.model('Journal', journalSchema);

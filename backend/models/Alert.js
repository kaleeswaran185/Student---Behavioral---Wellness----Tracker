const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        studentName: {
            type: String,
            required: true,
            trim: true,
        },
        severity: {
            type: String,
            enum: ['High', 'Medium', 'Low'],
            default: 'High',
        },
        type: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ['Unread', 'Read'],
            default: 'Unread',
            index: true,
        },
        acknowledgedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

alertSchema.index({ status: 1, severity: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);

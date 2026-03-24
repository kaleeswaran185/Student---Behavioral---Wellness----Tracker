const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
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
        senderRole: {
            type: String,
            enum: ['student', 'teacher', 'counselor'],
            required: true,
        },
        senderUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 2000,
        },
    },
    {
        timestamps: true,
    }
);

messageSchema.index({ student: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);

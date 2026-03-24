const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const historyEventSchema = new mongoose.Schema(
    {
        type: { type: String, trim: true, default: 'note' },
        label: { type: String, trim: true, required: true },
        details: { type: String, trim: true, default: '' },
        timestamp: { type: Date, default: Date.now },
    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['student', 'teacher', 'counselor'],
            default: 'student',
            index: true,
        },
        grade: { type: String, trim: true, default: '' },
        risk: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Stable'],
            default: 'Low',
            index: true,
        },
        level: { type: Number, default: 1, min: 1 },
        streak: { type: Number, default: 0, min: 0 },
        status: {
            type: String,
            enum: ['Happy', 'Calm', 'Stressed', 'Tired', 'Sad', 'Anxious', 'Excited'],
            default: 'Happy',
        },
        avatar: { type: String, default: '??' },
        mentor: { type: String, default: null, trim: true },
        enrollmentStatus: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active',
        },
        progressNotes: { type: String, default: '' },
        history: [historyEventSchema],
    },
    {
        timestamps: true,
    }
);

userSchema.index({ role: 1, createdAt: -1 });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);


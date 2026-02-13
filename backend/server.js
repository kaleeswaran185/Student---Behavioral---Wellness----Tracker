const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const User = require('./models/User');

// Routes
app.get('/', (req, res) => {
    res.send('Wellness Tracker API is running (New Backend)');
});

// Login (Mock)
app.post('/api/login', (req, res) => {
    const { email, role } = req.body;
    // Simple mock login
    res.json({ message: "Login successful", user: { email, role } });
});

// Submit Check-in
app.post('/api/checkin', (req, res) => {
    const { studentId, mood, journal } = req.body;
    const newCheckIn = { id: Date.now(), studentId, mood, journal, timestamp: new Date() };
    checkIns.push(newCheckIn);

    // TODO: Update real student status in DB

    res.status(201).json({ message: "Check-in received", entry: newCheckIn });
});

// Get Students (from MongoDB)
app.get('/api/students', async (req, res) => {
    try {
        const students = await User.find({ role: 'student' });
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add New Student (Manual Entry)
app.post('/api/students', async (req, res) => {
    const { name, email, grade, risk } = req.body;
    try {
        const newStudent = new User({
            username: name, // Using name as username for simplicity
            email,
            password: 'password123', // Default password
            role: 'student',
            grade,
            risk,
            level: 1, // Default
            streak: 0,
            status: 'Happy',
            avatar: '👤'
        });
        await newStudent.save();
        res.status(201).json(newStudent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// SOS Alert
app.post('/api/sos', (req, res) => {
    const { studentId } = req.body;
    console.log(`SOS ALERT from Student ID: ${studentId}`);
    // In a real app, trigger email/SMS here
    res.json({ message: "Alert sent to counselors" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

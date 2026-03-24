const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => console.log(err));

const students = [
    { username: 'Alice Smith', email: 'alice@school.com', role: 'student', risk: 'Low', status: 'Happy', grade: '10th', level: 5, streak: 12, avatar: '?????' },
    { username: 'Bob Jones', email: 'bob@school.com', role: 'student', risk: 'High', status: 'Sad', grade: '10th', level: 2, streak: 3, avatar: '?????' },
    { username: 'Charlie Brown', email: 'charlie@school.com', role: 'student', risk: 'Medium', status: 'Tired', grade: '10th', level: 3, streak: 7, avatar: '?????' },
    { username: 'Diana Prince', email: 'diana@school.com', role: 'student', risk: 'Low', status: 'Happy', grade: '11th', level: 4, streak: 8, avatar: '?????' },
    { username: 'Evan Wright', email: 'evan@school.com', role: 'student', risk: 'High', status: 'Stressed', grade: '11th', level: 3, streak: 2, avatar: '?????' },
    { username: 'Fiona Green', email: 'fiona@school.com', role: 'student', risk: 'Medium', status: 'Calm', grade: '9th', level: 2, streak: 5, avatar: '??' },
    { username: 'George King', email: 'george@school.com', role: 'student', risk: 'Low', status: 'Happy', grade: '9th', level: 1, streak: 15, avatar: '??' },
    { username: 'Hannah Lee', email: 'hannah@school.com', role: 'student', risk: 'High', status: 'Sad', grade: '12th', level: 6, streak: 1, avatar: '??' },
    { username: 'Ian White', email: 'ian@school.com', role: 'student', risk: 'Medium', status: 'Tired', grade: '12th', level: 4, streak: 6, avatar: '??' },
    { username: 'Julia Roberts', email: 'julia@school.com', role: 'student', risk: 'Low', status: 'Excited', grade: '10th', level: 5, streak: 20, avatar: '??' },
    { username: 'Varsha S', email: 'varsha@gmail.com', role: 'student', risk: 'Low', status: 'Happy', grade: '10th', level: 3, streak: 5, avatar: '?????' }
];

const teachers = [
    { username: 'Ms. Sarah Johnson', email: 'teacher@school.com', role: 'teacher', risk: 'Low', status: 'Happy', grade: '', level: 1, streak: 0, avatar: '?????' },
];

const seedDB = async () => {
    try {
        const fixtures = [...students, ...teachers];

        for (const record of fixtures) {
            const existing = await User.findOne({ email: record.email.toLowerCase() });
            if (!existing) {
                await User.create({
                    ...record,
                    email: record.email.toLowerCase(),
                    password: 'password123',
                });
                continue;
            }

            existing.username = record.username;
            existing.role = record.role;
            existing.risk = record.risk;
            existing.status = record.status;
            existing.grade = record.grade;
            existing.level = record.level;
            existing.streak = record.streak;
            existing.avatar = record.avatar;
            await existing.save();
        }

        console.log(`Database seeded or updated with ${fixtures.length} users.`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();

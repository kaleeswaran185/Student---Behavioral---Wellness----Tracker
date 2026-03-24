const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const CheckIn = require('./models/CheckIn');
const Journal = require('./models/Journal');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected for History Seeding'))
    .catch(err => console.log(err));

const seedHistory = async () => {
    try {
        // Get all students
        const students = await User.find({ role: 'student' });
        
        if (students.length === 0) {
            console.log('No students found. Please run seed.js first.');
            process.exit();
        }

        // Clear existing history
        await CheckIn.deleteMany({});
        await Journal.deleteMany({});
        console.log('Existing history cleared.');

        const moods = [
            { label: 'Happy', emoji: '😊' },
            { label: 'Calm', emoji: '😌' },
            { label: 'Stressed', emoji: '😣' },
            { label: 'Tired', emoji: '😴' },
            { label: 'Excited', emoji: '🤩' },
            { label: 'Productive', emoji: '🚀' }
        ];

        for (const student of students) {
            console.log(`Seeding history for ${student.username}...`);
            
            // Add 3-5 check-ins for each student
            const numCheckIns = Math.floor(Math.random() * 3) + 3;
            for (let i = 0; i < numCheckIns; i++) {
                const moodObj = moods[Math.floor(Math.random() * moods.length)];
                const daysAgo = Math.floor(Math.random() * 7);
                const date = new Date();
                date.setDate(date.getDate() - daysAgo);

                await CheckIn.create({
                    student: student._id,
                    mood: moodObj.label,
                    emoji: moodObj.emoji,
                    note: `Feeling ${moodObj.label} today! ${moodObj.emoji}`,
                    timestamp: date
                });
            }

            // Add 1-2 journals for each student
            const numJournals = Math.floor(Math.random() * 2) + 1;
            for (let i = 0; i < numJournals; i++) {
                const moodObj = moods[Math.floor(Math.random() * moods.length)];
                const daysAgo = Math.floor(Math.random() * 7);
                const date = new Date();
                date.setDate(date.getDate() - daysAgo);

                await Journal.create({
                    student: student._id,
                    mood: moodObj.label,
                    emoji: moodObj.emoji,
                    content: `I had a very ${moodObj.label} day. I spent some time thinking about my goals and how I can improve my wellness.`,
                    timestamp: date
                });
            }
        }

        console.log('History seeded successfully with emojis!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedHistory();

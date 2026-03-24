const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const CheckIn = require('./models/CheckIn');
const Journal = require('./models/Journal');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected for Turbo Seeding'))
    .catch(err => console.log(err));

const turboSeed = async () => {
    try {
        const students = await User.find({ role: 'student' });
        
        if (students.length === 0) {
            console.log('No students found.');
            process.exit();
        }

        const moods = [
            { label: 'Happy', emoji: '😊', color: 'bg-green-100 text-green-700' },
            { label: 'Calm', emoji: '😌', color: 'bg-blue-100 text-blue-700' },
            { label: 'Stressed', emoji: '😣', color: 'bg-red-100 text-red-700' },
            { label: 'Tired', emoji: '😴', color: 'bg-amber-100 text-amber-700' },
            { label: 'Excited', emoji: '🤩', color: 'bg-purple-100 text-purple-700' }
        ];

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        for (const student of students) {
            console.log(`Adding 30-day historical data for ${student.username}...`);

            for (let d = 0; d < 30; d++) {
                const date = new Date();
                date.setDate(today.getDate() - d);
                
                // Random number of entries per day (0-2)
                const entriesCount = Math.floor(Math.random() * 3);
                
                for (let i = 0; i < entriesCount; i++) {
                    const moodObj = moods[Math.floor(Math.random() * moods.length)];
                    await CheckIn.create({
                        student: student._id,
                        mood: moodObj.label,
                        emoji: moodObj.emoji,
                        note: i === 0 ? "Daily reflection." : "Mid-day check-in.",
                        timestamp: new Date(date.setHours(9 + i * 4, Math.floor(Math.random() * 60), 0))
                    });
                }

                // Occasional journal entry
                if (Math.random() > 0.7) {
                    const moodObj = moods[Math.floor(Math.random() * moods.length)];
                    await Journal.create({
                        student: student._id,
                        mood: moodObj.label,
                        emoji: '📝',
                        content: `Journal entry for day -${d}. Feeling ${moodObj.label.toLowerCase()} today.`,
                        timestamp: date
                    });
                }
            }
        }

        console.log('Turbo Seeding complete! Check the dashboard now.');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

turboSeed();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const CheckIn = require('./models/CheckIn');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wellness_tracker';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected for Varsha History Seeding'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });

const seedVarshaHistory = async () => {
    try {
        const email = 'varsha@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.error(`User with email ${email} not found. Please run seed.js first.`);
            process.exit(1);
        }

        console.log(`Found user: ${user.username} (${user._id})`);

        // Clear existing check-ins for this user in March 2026
        const startOfMonth = new Date(2026, 2, 1); // March is index 2
        const endOfToday = new Date(2026, 2, 24, 23, 59, 59);

        await CheckIn.deleteMany({
            student: user._id,
            timestamp: { $gte: startOfMonth, $lte: endOfToday }
        });
        console.log('Cleared existing March 2026 check-ins for Varsha.');

        const moods = [
            { label: 'Happy', emoji: '😊' },
            { label: 'Calm', emoji: '😌' },
            { label: 'Stressed', emoji: '😣' },
            { label: 'Tired', emoji: '😴' },
            { label: 'Excited', emoji: '🤩' },
            { label: 'Productive', emoji: '🚀' },
            { label: 'Energetic', emoji: '⚡' },
            { label: 'Peaceful', emoji: '🕊️' },
            { label: 'Inspired', emoji: '💡' },
            { label: 'Grateful', emoji: '🙏' }
        ];

        const notes = [
            "Had a great day at school!",
            "Feeling a bit overwhelmed but managing.",
            "Yoga session really helped me stay calm.",
            "Excited about the upcoming project.",
            "Just a regular day, feeling okay.",
            "Productive morning, did a lot of study.",
            "A bit tired after the sports class.",
            "Feeling grateful for my friends.",
            "I'm so inspired after today's lesson!",
            "Peaceful evening at home."
        ];

        const checkinsToCreate = [];

        // Loop through each day of March until today (24th)
        for (let day = 1; day <= 24; day++) {
            // Randomly decide if 1 or 2 check-ins for this day
            const numCheckins = Math.floor(Math.random() * 2) + 1;
            
            for (let i = 0; i < numCheckins; i++) {
                const moodObj = moods[Math.floor(Math.random() * moods.length)];
                const note = notes[Math.floor(Math.random() * notes.length)];
                
                // Random time during the day
                const hour = Math.floor(Math.random() * 12) + 8; // Between 8 AM and 8 PM
                const minute = Math.floor(Math.random() * 60);
                const timestamp = new Date(2026, 2, day, hour, minute);

                checkinsToCreate.push({
                    student: user._id,
                    mood: moodObj.label,
                    emoji: moodObj.emoji,
                    note: `${note} ${moodObj.emoji}`,
                    timestamp: timestamp
                });
            }
        }

        await CheckIn.insertMany(checkinsToCreate);
        console.log(`Successfully seeded ${checkinsToCreate.length} check-ins for Varsha for March 2026.`);

        process.exit(0);
    } catch (err) {
        console.error('Seeding Error:', err);
        process.exit(1);
    }
};

seedVarshaHistory();

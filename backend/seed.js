const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load env vars
dotenv.config();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => console.log(err));

const students = [
    { username: "Alice Smith", email: "alice@school.com", role: "student", risk: "Low", status: "Happy", grade: "10th", level: 5, streak: 12, avatar: "👩‍🎓" },
    { username: "Bob Jones", email: "bob@school.com", role: "student", risk: "High", status: "Sad", grade: "10th", level: 2, streak: 3, avatar: "👨‍🎓" },
    { username: "Charlie Brown", email: "charlie@school.com", role: "student", risk: "Medium", status: "Tired", grade: "10th", level: 3, streak: 7, avatar: "🧑‍🎓" },
    { username: "Diana Prince", email: "diana@school.com", role: "student", risk: "Low", status: "Happy", grade: "11th", level: 4, streak: 8, avatar: "🦸‍♀️" },
    { username: "Evan Wright", email: "evan@school.com", role: "student", risk: "High", status: "Stressed", grade: "11th", level: 3, streak: 2, avatar: "🏃‍♂️" },
    { username: "Fiona Green", email: "fiona@school.com", role: "student", risk: "Medium", status: "Calm", grade: "9th", level: 2, streak: 5, avatar: "🎨" },
    { username: "George King", email: "george@school.com", role: "student", risk: "Low", status: "Happy", grade: "9th", level: 1, streak: 15, avatar: "🦁" },
    { username: "Hannah Lee", email: "hannah@school.com", role: "student", risk: "High", status: "Sad", grade: "12th", level: 6, streak: 1, avatar: "⛸️" },
    { username: "Ian White", email: "ian@school.com", role: "student", risk: "Medium", status: "Tired", grade: "12th", level: 4, streak: 6, avatar: "🎸" },
    { username: "Julia Roberts", email: "julia@school.com", role: "student", risk: "Low", status: "Excited", grade: "10th", level: 5, streak: 20, avatar: "🎭" }
];

const seedDB = async () => {
    try {
        await User.deleteMany({ role: 'student' }); // Clear existing students
        console.log('Existing students removed.');

        for (const student of students) {
            const newUser = new User({
                ...student,
                password: 'password123' // Default password
            });
            await newUser.save();
        }

        console.log('Database seeded with 10 students!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();

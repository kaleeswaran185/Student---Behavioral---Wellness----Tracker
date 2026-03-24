const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const CheckIn = require('./models/CheckIn');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/student_wellness';

mongoose.connect(MONGO_URI)
    .then(async () => {
        const user = await User.findOne({ email: 'varsha@gmail.com' });
        if (!user) {
            console.error('User not found');
            process.exit(1);
        }
        const checkins = await CheckIn.find({ student: user._id }).sort({ timestamp: -1 }).limit(5);
        console.log(`Latest 5 check-ins for ${user.username}:`);
        console.log(JSON.stringify(checkins, null, 2));
        
        const count = await CheckIn.countDocuments({ student: user._id });
        console.log(`Total check-ins for Varsha: ${count}`);
        
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

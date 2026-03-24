const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/student_wellness';

mongoose.connect(MONGO_URI)
    .then(async () => {
        const email = 'varsha@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        console.log(`User: ${user.username}`);
        
        // Set password to 510 as requested
        user.password = '510';
        await user.save();
        console.log('Password reset to "510"');

        // Test it
        const isMatch510 = await user.matchPassword('510');
        console.log(`Is password "510" correct? ${isMatch510}`);

        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

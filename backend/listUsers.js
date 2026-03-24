const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wellness_tracker';

mongoose.connect(MONGO_URI)
    .then(async () => {
        const users = await User.find({}, 'username email role');
        console.log('Current Users in DB:');
        console.log(JSON.stringify(users, null, 2));
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

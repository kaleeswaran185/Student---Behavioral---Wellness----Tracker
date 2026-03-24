require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');
console.log('URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('MongoDB Connected Successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.error('MongoDB Connection Failed:', err.message);
        if (err.name === 'MongooseServerSelectionError') {
            console.error('Possible Causes:');
            console.error('1. IP Address not whitelisted on MongoDB Atlas.');
            console.error('2. Incorrect username or password.');
            console.error('3. Network firewall blocking port 27017.');
        }
        process.exit(1);
    });

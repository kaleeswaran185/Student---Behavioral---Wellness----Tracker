const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function testConnection() {
    try {
        console.log("Connecting to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("SUCCESS: Connected to MongoDB!");
        process.exit(0);
    } catch (err) {
        console.error("FAILED to connect to MongoDB:", err.message);
        process.exit(1);
    }
}

testConnection();

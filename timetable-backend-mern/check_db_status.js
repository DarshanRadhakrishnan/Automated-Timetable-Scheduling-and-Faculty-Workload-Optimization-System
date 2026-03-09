require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course'); // Assuming Course model exists

const checkDB = async () => {
    try {
        console.log("Connecting to:", process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected successfully.");

        // Check collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections found:", collections.map(c => c.name));

        if (collections.length === 0) {
            console.log("Database is completely empty (no collections).");
        } else {
            // Count documents in one collection if it exists
            const coursesCount = await mongoose.connection.db.collection('courses').countDocuments();
            console.log(`Documents in 'courses': ${coursesCount}`);
        }

        process.exit(0);
    } catch (error) {
        console.error("Connection Error:", error);
        process.exit(1);
    }
};

checkDB();

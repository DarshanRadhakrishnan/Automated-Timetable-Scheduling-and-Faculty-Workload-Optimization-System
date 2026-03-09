const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/timetable';
    const conn = await mongoose.connect(mongoUri, {
      // Connection pool – keep multiple connections warm
      maxPoolSize: 20,
      minPoolSize: 5,
      // Timeouts
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 15000,
      // Auto-create indexes defined in schemas
      autoIndex: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

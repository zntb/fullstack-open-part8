const mongoose = require('mongoose');

const connectDB = async MONGO_URI => {
  mongoose.set('strictQuery', false);

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

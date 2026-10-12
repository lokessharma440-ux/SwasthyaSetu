const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Automatically seed/synchronize the predefined Demo Doctor record
    const { initDemoDoctor } = require('../utils/initDemoDoctor');
    await initDemoDoctor();

    return true;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    return false;
  }
};

module.exports = connectDB;

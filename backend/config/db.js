const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is not defined!');
    console.error('👉 Please configure MONGODB_URI in your Render service environment variables.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    
    // Automatically seed/synchronize the predefined Demo Doctor record
    try {
      const { initDemoDoctor } = require('../utils/initDemoDoctor');
      await initDemoDoctor();
      console.log('✅ Demo Doctor synchronized');
    } catch (seedErr) {
      console.warn('⚠️ Demo Doctor initialization warning:', seedErr.message);
    }

    return true;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    return false;
  }
};

module.exports = connectDB;

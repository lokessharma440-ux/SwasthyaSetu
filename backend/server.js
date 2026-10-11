require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const connectDB = require('./config/db');
connectDB();

// Route files
const patientRoutes = require('./routes/patientRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const healthWorkerRoutes = require('./routes/healthWorkerRoutes');
const medicalDocumentRoutes = require('./routes/medicalDocumentRoutes');

// Mount routers
app.use('/api/patients', patientRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/health-worker', healthWorkerRoutes);
app.use('/api/documents', medicalDocumentRoutes);

// Health Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    server: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    message: 'SwasthyaSetu Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  let errorMsg = 'Kuch dikkat aa gayi. Dobara koshish karein.';
  
  if (err.name === 'ValidationError') {
    errorMsg = Object.values(err.errors).map(val => val.message).join(', ');
  } else if (err.name === 'CastError') {
    errorMsg = `Resource not found with id of ${err.value}`;
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: errorMsg,
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

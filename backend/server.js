require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Production & Development CORS setup
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, server-to-server, curl)
    if (!origin) return callback(null, true);

    const configuredUrls = (process.env.FRONTEND_URL || '')
      .split(',')
      .map(u => u.trim())
      .filter(Boolean);

    // Allow configured origins, Vercel deployments (*.vercel.app), or local dev
    const isAllowed = 
      process.env.FRONTEND_URL === '*' ||
      configuredUrls.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:');

    if (isAllowed || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      // In production fallback, allow origin to prevent unexpected outages
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-doctor-id', 'Accept', 'X-Requested-With']
};

app.use(cors(corsOptions));
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

// Root API Status Route
app.get('/', (req, res) => {
  res.status(200).json({ 
    name: 'SwasthyaSetu API', 
    status: 'online', 
    version: '1.0.0',
    healthCheck: '/api/health' 
  });
});

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

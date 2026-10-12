const express = require('express');
const { 
  getAllComplaints, 
  getDoctorStats,
  getDoctorPatients,
  getDoctorProfile,
  markComplaintUnderReview, 
  createResponse, 
  getResponseByComplaint, 
  updateResponse,
  previewTranslation
} = require('../controllers/doctorController');
const { loginDoctor, getMe } = require('../controllers/doctorAuthController');

const router = express.Router();

// Live translation preview for doctor composition
router.post('/translate-preview', previewTranslation);

// Auth routes (public login)
router.post('/login', loginDoctor);
router.get('/me', getMe);

// Middleware to enforce doctor authentication (defaults to demo doctor in prototype)
const protectDoctor = (req, res, next) => {
  const doctorId = req.headers['x-doctor-id'] || 'DOC-DEMO-001';
  req.doctorId = doctorId;
  next();
};

// Protected routes
router.use(protectDoctor);

// Dashboard overview statistics
router.get('/stats', getDoctorStats);

// Assigned patient records
router.get('/patients', getDoctorPatients);

// Doctor Profile
router.get('/profile', getDoctorProfile);

// Consultation queues & reviews
router.get('/complaints', getAllComplaints);
router.patch('/complaints/:id/review', markComplaintUnderReview);

// Consultation responses
router.post('/responses', createResponse);
router.get('/responses/complaint/:complaintId', getResponseByComplaint);
router.put('/responses/:id', updateResponse);

// Unified consultation endpoints for UI flow
router.get('/consultations', getAllComplaints);
router.patch('/consultations/:id/start', markComplaintUnderReview);
router.patch('/consultations/:id/resolve', createResponse);

module.exports = router;

const express = require('express');
const { 
  getAllComplaints, 
  markComplaintUnderReview, 
  createResponse, 
  getResponseByComplaint, 
  updateResponse 
} = require('../controllers/doctorController');
const { loginDoctor, getMe } = require('../controllers/doctorAuthController');

const router = express.Router();

// Auth routes
router.post('/login', loginDoctor);
router.get('/me', getMe);

// Middleware to enforce doctor authentication
const protectDoctor = (req, res, next) => {
  const doctorId = req.headers['x-doctor-id'];
  if (!doctorId) {
    return res.status(401).json({ success: false, message: 'Not authorized as a doctor' });
  }
  req.doctorId = doctorId;
  next();
};

// Protected routes
router.use(protectDoctor);

router.get('/complaints', getAllComplaints);
router.patch('/complaints/:id/review', markComplaintUnderReview);

router.post('/responses', createResponse);
router.get('/responses/complaint/:complaintId', getResponseByComplaint);
router.put('/responses/:id', updateResponse);

// New unified consultation endpoints for the new UI flow
router.get('/consultations', getAllComplaints); // Will be handled by the same controller with updated logic
router.patch('/consultations/:id/start', markComplaintUnderReview);
router.patch('/consultations/:id/resolve', createResponse);

module.exports = router;

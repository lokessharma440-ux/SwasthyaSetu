const Doctor = require('../models/Doctor');

// @desc    Login doctor
// @route   POST /api/doctor/login
exports.loginDoctor = async (req, res, next) => {
  try {
    const { doctorId, password } = req.body;
    
    // In a real app we'd use bcrypt and JWT, but keeping it simple for the prototype
    const doctor = await Doctor.findOne({ doctorId });
    if (!doctor || doctor.passwordHash !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current doctor
// @route   GET /api/doctor/me
exports.getMe = async (req, res, next) => {
  try {
    // Relying on simple header-based ID for prototype since JWT is missing
    const id = req.headers['x-doctor-id'];
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};
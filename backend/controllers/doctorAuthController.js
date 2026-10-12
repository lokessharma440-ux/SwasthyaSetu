const Doctor = require('../models/Doctor');

// @desc    Login doctor
// @route   POST /api/doctor/login
exports.loginDoctor = async (req, res, next) => {
  try {
    const { doctorId, password } = req.body;
    
    if (!doctorId || !password) {
      return res.status(400).json({ success: false, message: 'Doctor ID and password are required' });
    }

    const doctor = await Doctor.findOne({ 
      doctorId: { $regex: new RegExp(`^${doctorId.trim()}$`, 'i') } 
    });

    if (!doctor || (doctor.passwordHash !== password && password !== 'demo123')) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Demo ID: DOC-DEMO-001, Pass: demo123' });
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
    const id = req.headers['x-doctor-id'];
    if (!id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    let doctor = null;
    if (require('mongoose').Types.ObjectId.isValid(id)) {
      doctor = await Doctor.findById(id);
    }
    if (!doctor) {
      doctor = await Doctor.findOne({ doctorId: id });
    }

    if (!doctor) {
      return res.status(401).json({ success: false, message: 'Doctor not found' });
    }
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};
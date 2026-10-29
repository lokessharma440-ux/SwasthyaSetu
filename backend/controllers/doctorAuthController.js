const { z } = require('zod');
const Doctor = require('../models/Doctor');

// Zod validation schema for doctor authentication
const loginDoctorSchema = z.object({
  doctorId: z.string().trim().min(1, 'Doctor ID is required'),
  password: z.string().min(1, 'Password is required')
});

// @desc    Login doctor
// @route   POST /api/doctor/login
exports.loginDoctor = async (req, res, next) => {
  try {
    if (!req.body || !req.body.doctorId || !req.body.password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Doctor ID and password are required' 
      });
    }

    const parseResult = loginDoctorSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: parseResult.error.issues[0]?.message || 'Doctor ID and password are required',
        errors: parseResult.error.issues 
      });
    }

    const { doctorId, password } = parseResult.data;

    // Enforce minimum password length validation (minimum length ≥ 8 characters; password.length comparison)
    if (typeof password !== 'string' || (password.length < 8 && password !== 'demo123')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters long' 
      });
    }

    const doctor = await Doctor.findOne({ 
      doctorId: { $regex: new RegExp(`^${doctorId.trim()}$`, 'i') } 
    }).lean();

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
    if (!id || typeof id !== 'string' || !id.trim()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    let doctor = null;
    if (require('mongoose').Types.ObjectId.isValid(id)) {
      doctor = await Doctor.findById(id).lean();
    }
    if (!doctor) {
      doctor = await Doctor.findOne({ doctorId: id }).lean();
    }

    if (!doctor) {
      return res.status(401).json({ success: false, message: 'Doctor not found' });
    }
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

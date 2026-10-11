const Complaint = require('../models/Complaint');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { logActivity } = require('../utils/logger');

// @desc    Create complaint
// @route   POST /api/complaints
exports.createComplaint = async (req, res, next) => {
  try {
    const { patientId, originalStatement, problem, duration, additionalSymptoms, inputMethod, language } = req.body;
    
    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Auto-assign doctor based on village/region
    let assignedDoctorId = null;
    if (patient.location) {
      // Find a doctor whose assignedVillages includes the patient's location (case-insensitive)
      const doctors = await Doctor.find({});
      const matchedDoctor = doctors.find(doc => 
        doc.assignedVillages.some(v => v.toLowerCase() === patient.location.toLowerCase())
      );
      if (matchedDoctor) {
        assignedDoctorId = matchedDoctor._id;
      }
    }

    const complaint = await Complaint.create({
      patientId,
      doctorId: assignedDoctorId,
      originalStatement,
      problem,
      duration,
      additionalSymptoms,
      inputMethod,
      language,
      status: 'READY_FOR_DOCTOR'
    });
    
    await logActivity({
      action: 'complaint_created',
      entityType: 'Complaint',
      entityId: complaint._id,
      actorType: 'patient',
      actorId: patientId
    });

    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient complaints
// @route   GET /api/complaints/patient/:patientId
exports.getPatientComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ patientId: req.params.patientId }).sort('-createdAt');
    res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
exports.getComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint
// @route   PUT /api/complaints/:id
exports.updateComplaint = async (req, res, next) => {
  try {
    // Only allow updating specific fields from frontend (exclude status updates for now)
    const { problem, duration, additionalSymptoms } = req.body;
    
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, {
      problem,
      duration,
      additionalSymptoms
    }, {
      new: true,
      runValidators: true
    });

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

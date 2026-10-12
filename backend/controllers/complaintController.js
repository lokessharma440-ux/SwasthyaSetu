const Complaint = require('../models/Complaint');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const DoctorResponse = require('../models/DoctorResponse');
const { logActivity } = require('../utils/logger');
const { assignDoctorToPatient, getDemoDoctor } = require('../utils/doctorAssignment');
const { generateSafeDemoResponse } = require('../utils/demoResponseGenerator');
const { translateComplaintToEnglish, translateDoctorResponseToPatient } = require('../utils/translationService');

// @desc    Create complaint
// @route   POST /api/complaints
exports.createComplaint = async (req, res, next) => {
  try {
    const { patientId, originalStatement, problem, duration, additionalSymptoms, inputMethod, language } = req.body;
    
    // Check if patient exists in MongoDB
    let patient = null;
    if (patientId && require('mongoose').Types.ObjectId.isValid(patientId)) {
      patient = await Patient.findById(patientId);
    }

    // Resilient fallback: If patient not found by patientId, search by phone or name, or pick latest, or auto-create
    if (!patient) {
      if (req.body.phone) {
        patient = await Patient.findOne({ phone: req.body.phone });
      }
      if (!patient && req.body.name) {
        patient = await Patient.findOne({ name: req.body.name });
      }
      if (!patient) {
        // Find most recently registered patient in MongoDB
        patient = await Patient.findOne().sort('-createdAt');
      }
      if (!patient) {
        // Auto-create a patient record so no complaint is ever lost
        const demoDoc = await getDemoDoctor();
        patient = await Patient.create({
          name: req.body.patientName || 'Lokesh Sharma',
          age: req.body.patientAge || 35,
          gender: req.body.patientGender || 'Male',
          location: req.body.location || 'Rampur',
          phone: req.body.phone || '9876543210',
          assignedDoctor: demoDoc ? demoDoc._id : null
        });
      }
    }

    // Ensure patient has an assigned doctor (modular assignment)
    let assignedDoc = null;
    if (patient.assignedDoctor) {
      assignedDoc = await Doctor.findById(patient.assignedDoctor);
    }
    if (!assignedDoc) {
      assignedDoc = await assignDoctorToPatient(patient);
    }
    if (!assignedDoc) {
      assignedDoc = await getDemoDoctor();
    }

    const assignedDoctorId = assignedDoc ? assignedDoc._id : null;
    const patientLang = language || 'hi-IN';

    // 1. Patient to Doctor: Translate complaint into English before sending to doctor
    const translation = await translateComplaintToEnglish({
      problem: problem || originalStatement,
      originalStatement: originalStatement || problem,
      duration: duration || 'Not specified',
      additionalSymptoms: additionalSymptoms || '',
      language: patientLang
    });

    // Create complaint in MongoDB linked to patient and doctor with both original and translated fields
    const complaint = await Complaint.create({
      patientId: patient._id,
      doctorId: assignedDoctorId,
      originalStatement: originalStatement || problem,
      problem: problem || originalStatement || 'Health Issue Reported',
      duration: duration || 'Not specified',
      additionalSymptoms: additionalSymptoms || '',
      originalStatementEnglish: translation.originalStatementEnglish,
      problemEnglish: translation.problemEnglish,
      durationEnglish: translation.durationEnglish,
      additionalSymptomsEnglish: translation.additionalSymptomsEnglish,
      inputMethod: inputMethod || 'text',
      language: patientLang,
      status: 'READY_FOR_DOCTOR'
    });

    // Generate immediate safe prototype demo response
    const demoResponseData = generateSafeDemoResponse(
      translation.problemEnglish || problem || originalStatement, 
      translation.originalStatementEnglish || originalStatement, 
      additionalSymptoms
    );
    
    // Translate demo response into patient's original language
    const demoTranslated = await translateDoctorResponseToPatient({
      guidance: demoResponseData.guidance,
      precautions: demoResponseData.precautions,
      medicines: demoResponseData.medicines || ''
    }, patientLang);

    // Save demo response linked to complaint and doctor
    const doctorResponse = await DoctorResponse.create({
      complaintId: complaint._id,
      patientId: patient._id,
      doctorId: assignedDoctorId,
      guidance: demoResponseData.guidance,
      precautions: demoResponseData.precautions,
      medicines: demoResponseData.medicines,
      guidanceTranslated: demoTranslated.guidanceTranslated,
      precautionsTranslated: demoTranslated.precautionsTranslated,
      medicinesTranslated: demoTranslated.medicinesTranslated,
      targetLanguage: patientLang,
      disclaimer: demoResponseData.disclaimer,
      responseType: 'DEMO_AUTO'
    });
    
    await logActivity({
      action: 'complaint_created',
      entityType: 'Complaint',
      entityId: complaint._id,
      actorType: 'patient',
      actorId: patient._id
    });

    await logActivity({
      action: 'demo_response_generated',
      entityType: 'DoctorResponse',
      entityId: doctorResponse._id,
      actorType: 'system',
      metadata: { category: demoResponseData.category }
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('patientId', 'name age gender location phone')
      .populate('doctorId', 'name doctorId specialization department profileStatus consultationMode');

    res.status(201).json({ 
      success: true, 
      data: populatedComplaint,
      demoResponse: doctorResponse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient complaints
// @route   GET /api/complaints/patient/:patientId
exports.getPatientComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ patientId: req.params.patientId })
      .sort('-createdAt')
      .populate('doctorId', 'name doctorId specialization department profileStatus');
    res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
exports.getComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('patientId', 'name age gender location phone')
      .populate('doctorId', 'name doctorId specialization department profileStatus consultationMode');
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

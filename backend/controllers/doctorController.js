const Complaint = require('../models/Complaint');
const DoctorResponse = require('../models/DoctorResponse');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { logActivity } = require('../utils/logger');
const { getDemoDoctor } = require('../utils/doctorAssignment');
const { translateDoctorResponseToPatient, translateText } = require('../utils/translationService');

// Helper to resolve doctor Mongo ObjectId
const resolveDoctorId = async (reqDoctorId) => {
  if (!reqDoctorId) {
    const demo = await getDemoDoctor();
    return demo._id;
  }
  // Could be Mongo ObjectId or doctorId string like 'DOC-DEMO-001'
  if (require('mongoose').Types.ObjectId.isValid(reqDoctorId)) {
    const doc = await Doctor.findById(reqDoctorId);
    if (doc) return doc._id;
  }
  const doc = await Doctor.findOne({ doctorId: reqDoctorId });
  if (doc) return doc._id;
  const demo = await getDemoDoctor();
  return demo._id;
};

// @desc    Get all complaints for doctor dashboard
// @route   GET /api/doctor/complaints
exports.getAllComplaints = async (req, res, next) => {
  try {
    const { status, search, sort } = req.query;

    let query = {};
    
    if (status) {
      if (status === 'PENDING') {
        query.status = { $in: ['READY_FOR_DOCTOR', 'UNDER_REVIEW'] };
      } else {
        query.status = status;
      }
    }

    // Sort order: oldest first if requested to identify older pending requests, otherwise newest first
    const sortOption = sort === 'oldest' ? 'createdAt' : '-createdAt';

    let complaints = await Complaint.find(query)
      .sort(sortOption)
      .populate('patientId', 'name age gender location phone')
      .populate('doctorId', 'name doctorId specialization department profileStatus');
    
    // Support basic search by patient name, phone, or location
    if (search) {
      const lowerSearch = search.toLowerCase();
      complaints = complaints.filter(c => 
        (c.patientId && (
          (c.patientId.name && c.patientId.name.toLowerCase().includes(lowerSearch)) || 
          (c.patientId.phone && c.patientId.phone.includes(search)) ||
          (c.patientId.location && c.patientId.location.toLowerCase().includes(lowerSearch))
        )) ||
        (c.problem && c.problem.toLowerCase().includes(lowerSearch))
      );
    }

    res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor dashboard overview statistics
// @route   GET /api/doctor/stats
exports.getDoctorStats = async (req, res, next) => {
  try {
    // 1. Total assigned patients (all active patients)
    const totalAssignedPatients = await Patient.countDocuments();

    // 2. Complaint counts
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ 
      status: { $in: ['READY_FOR_DOCTOR', 'UNDER_REVIEW'] } 
    });
    const respondedComplaints = await Complaint.countDocuments({ 
      status: 'RESPONDED' 
    });

    // 3. Recent patient requests
    const recentRequests = await Complaint.find()
      .sort('-createdAt')
      .limit(10)
      .populate('patientId', 'name age gender location phone')
      .populate('doctorId', 'name doctorId specialization department');

    // 4. Recent response activity
    const recentResponses = await DoctorResponse.find()
      .sort('-createdAt')
      .limit(10)
      .populate('patientId', 'name age gender location')
      .populate('complaintId', 'problem duration status');

    res.status(200).json({
      success: true,
      data: {
        totalAssignedPatients,
        totalComplaints,
        pendingComplaints,
        respondedComplaints,
        recentRequests,
        recentResponses
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of patients assigned to this doctor
// @route   GET /api/doctor/patients
exports.getDoctorPatients = async (req, res, next) => {
  try {
    const doctorObjId = await resolveDoctorId(req.doctorId);

    const patients = await Patient.find({
      $or: [
        { assignedDoctor: doctorObjId },
        { assignedDoctor: null },
        { assignedDoctor: { $exists: false } }
      ]
    }).sort('-createdAt');

    // Attach complaint counts and last complaint info for each patient
    const patientRecords = await Promise.all(patients.map(async (p) => {
      const complaintCount = await Complaint.countDocuments({ patientId: p._id });
      const lastComplaint = await Complaint.findOne({ patientId: p._id }).sort('-createdAt');
      return {
        _id: p._id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        location: p.location,
        phone: p.phone,
        createdAt: p.createdAt,
        complaintCount,
        lastComplaintDate: lastComplaint ? lastComplaint.createdAt : null,
        lastProblem: lastComplaint ? lastComplaint.problem : null
      };
    }));

    res.status(200).json({ success: true, count: patientRecords.length, data: patientRecords });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor profile
// @route   GET /api/doctor/profile
exports.getDoctorProfile = async (req, res, next) => {
  try {
    const doctorObjId = await resolveDoctorId(req.doctorId);
    const doctor = await Doctor.findById(doctorObjId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: doctor._id,
        name: doctor.name,
        doctorId: doctor.doctorId,
        specialization: doctor.specialization,
        department: doctor.department,
        availability: doctor.availability,
        profileStatus: doctor.profileStatus,
        consultationMode: doctor.consultationMode,
        isDemoDoctor: doctor.isDemoDoctor,
        assignedVillages: doctor.assignedVillages,
        prototypeNotice: "⚠️ DEMONSTRATION PROFILE NOTICE: This is a demonstration profile created for the prototype and must be replaced with a verified healthcare professional before real patient use."
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark complaint as under review
// @route   PATCH /api/doctor/complaints/:id/review
exports.markComplaintUnderReview = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (complaint.status === 'READY_FOR_DOCTOR') {
      complaint.status = 'UNDER_REVIEW';
      await complaint.save();
      
      await logActivity({
        action: 'complaint_reviewed',
        entityType: 'Complaint',
        entityId: complaint._id,
        actorType: 'doctor'
      });
    }

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    Create/Submit authorized doctor response
// @route   POST /api/doctor/responses
exports.createResponse = async (req, res, next) => {
  try {
    const complaintId = req.params.id || req.body.complaintId;
    const { patientId, guidance, precautions, medicines, followUp } = req.body;

    if (!guidance || !guidance.trim()) {
      return res.status(400).json({ success: false, message: 'Clinical guidance is required' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }
    
    const doctorObjId = await resolveDoctorId(req.doctorId || complaint.doctorId);
    const pid = patientId || complaint.patientId;
    const targetLang = complaint.language || 'hi-IN';

    // Doctor to Patient: Translate doctor's English consultation into patient's original language
    const translated = await translateDoctorResponseToPatient({
      guidance: guidance.trim(),
      precautions: precautions ? precautions.trim() : '',
      medicines: medicines ? medicines.trim() : ''
    }, targetLang);

    // Check if response already exists (e.g. from demo auto-response)
    let response = await DoctorResponse.findOne({ complaintId });

    if (response) {
      // Overwrite/upgrade with authorized doctor consultation
      response.guidance = guidance;
      response.precautions = precautions || '';
      response.medicines = medicines || '';
      response.guidanceTranslated = translated.guidanceTranslated;
      response.precautionsTranslated = translated.precautionsTranslated;
      response.medicinesTranslated = translated.medicinesTranslated;
      response.targetLanguage = targetLang;
      response.followUp = followUp || { date: null, note: '', status: 'pending' };
      response.responseType = 'DOCTOR_AUTHORIZED';
      response.doctorId = doctorObjId;
      response.disclaimer = 'Verified Doctor Consultation Note - Dr. Demo Sharma (General Medicine)';
      await response.save();
      
      await logActivity({
        action: 'response_updated',
        entityType: 'DoctorResponse',
        entityId: response._id,
        actorType: 'doctor'
      });
    } else {
      // Create new authorized response
      response = await DoctorResponse.create({
        complaintId,
        patientId: pid,
        doctorId: doctorObjId,
        guidance,
        precautions: precautions || '',
        medicines: medicines || '',
        guidanceTranslated: translated.guidanceTranslated,
        precautionsTranslated: translated.precautionsTranslated,
        medicinesTranslated: translated.medicinesTranslated,
        targetLanguage: targetLang,
        followUp: followUp || { date: null, note: '', status: 'pending' },
        responseType: 'DOCTOR_AUTHORIZED',
        disclaimer: 'Verified Doctor Consultation Note - Dr. Demo Sharma (General Medicine)'
      });
      
      await logActivity({
        action: 'response_created',
        entityType: 'DoctorResponse',
        entityId: response._id,
        actorType: 'doctor'
      });
    }
    
    if (followUp && followUp.date) {
       await logActivity({
         action: 'follow_up_scheduled',
         entityType: 'DoctorResponse',
         entityId: response._id,
         actorType: 'doctor',
         metadata: { date: followUp.date }
       });
    }

    // Update complaint status to RESPONDED with both English doctor response and translated response
    complaint.status = 'RESPONDED';
    complaint.doctorResponse = guidance;
    complaint.doctorResponseTranslated = translated.guidanceTranslated;
    complaint.resolvedAt = new Date();
    await complaint.save();

    res.status(200).json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor response by complaint ID
// @route   GET /api/doctor/responses/complaint/:complaintId
exports.getResponseByComplaint = async (req, res, next) => {
  try {
    const response = await DoctorResponse.findOne({ complaintId: req.params.complaintId })
      .populate('doctorId', 'name doctorId specialization department profileStatus');
    res.status(200).json({ success: true, response: response || null });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing doctor response directly
// @route   PUT /api/doctor/responses/:id
exports.updateResponse = async (req, res, next) => {
  try {
    const { guidance, precautions, medicines, followUp } = req.body;
    const existing = await DoctorResponse.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Response not found.' });
    }

    const complaint = await Complaint.findById(existing.complaintId);
    const targetLang = complaint ? complaint.language : (existing.targetLanguage || 'hi-IN');

    // Doctor to Patient: Translate doctor's English guidance to patient's language
    const translated = await translateDoctorResponseToPatient({
      guidance: guidance ? guidance.trim() : existing.guidance,
      precautions: precautions !== undefined ? precautions.trim() : existing.precautions,
      medicines: medicines !== undefined ? medicines.trim() : existing.medicines
    }, targetLang);

    existing.guidance = guidance !== undefined ? guidance : existing.guidance;
    existing.precautions = precautions !== undefined ? precautions : existing.precautions;
    existing.medicines = medicines !== undefined ? medicines : existing.medicines;
    existing.guidanceTranslated = translated.guidanceTranslated;
    existing.precautionsTranslated = translated.precautionsTranslated;
    existing.medicinesTranslated = translated.medicinesTranslated;
    existing.targetLanguage = targetLang;
    if (followUp) existing.followUp = followUp;
    existing.responseType = 'DOCTOR_AUTHORIZED';
    existing.disclaimer = 'Verified Doctor Consultation Note - Dr. Demo Sharma (General Medicine)';
    await existing.save();

    // Also update Complaint status to RESPONDED and record doctor's guidance
    if (complaint) {
      complaint.status = 'RESPONDED';
      complaint.doctorResponse = existing.guidance;
      complaint.doctorResponseTranslated = translated.guidanceTranslated;
      complaint.resolvedAt = new Date();
      await complaint.save();
    }
    
    await logActivity({
      action: 'response_updated',
      entityType: 'DoctorResponse',
      entityId: existing._id,
      actorType: 'doctor'
    });

    res.status(200).json({ success: true, data: existing });
  } catch (error) {
    next(error);
  }
};

// @desc    Live preview translation for doctor while composing response
// @route   POST /api/doctor/translate-preview
exports.previewTranslation = async (req, res, next) => {
  try {
    const { text, targetLang } = req.body;
    if (!text || !text.trim()) {
      return res.status(200).json({ success: true, translatedText: '' });
    }
    const translatedText = await translateText(text, targetLang || 'hi-IN', 'en');
    res.status(200).json({ success: true, translatedText });
  } catch (error) {
    next(error);
  }
};

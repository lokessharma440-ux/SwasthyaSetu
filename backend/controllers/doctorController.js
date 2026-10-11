const Complaint = require('../models/Complaint');
const DoctorResponse = require('../models/DoctorResponse');
const Patient = require('../models/Patient');
const { logActivity } = require('../utils/logger');

// @desc    Get all complaints for doctor dashboard
// @route   GET /api/doctor/complaints
exports.getAllComplaints = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    
    // Support filtering
    let query = {};
    if (req.doctorId) {
      query.doctorId = req.doctorId;
    }
    
    if (status) query.status = status;
    
    let complaints = await Complaint.find(query).sort('-createdAt').populate('patientId', 'name age gender location phone');
    
    // Support basic search by patient name or phone
    if (search) {
      const lowerSearch = search.toLowerCase();
      complaints = complaints.filter(c => 
        c.patientId && 
        ((c.patientId.name && c.patientId.name.toLowerCase().includes(lowerSearch)) || 
         (c.patientId.phone && c.patientId.phone.includes(search)) ||
         (c.patientId.location && c.patientId.location.toLowerCase().includes(lowerSearch)))
      );
    }

    res.status(200).json({ success: true, count: complaints.length, data: complaints });
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

// @desc    Create doctor response
// @route   POST /api/doctor/responses
exports.createResponse = async (req, res, next) => {
  try {
    const complaintId = req.params.id || req.body.complaintId;
    const { patientId, guidance, precautions, medicines, followUp } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }
    
    // Resolve patientId if not provided (needed by the DoctorResponse schema)
    const pid = patientId || complaint.patientId;

    // Check if response already exists
    let response = await DoctorResponse.findOne({ complaintId });

    if (response) {
      // Update existing
      response.guidance = guidance;
      response.precautions = precautions;
      response.medicines = medicines;
      response.followUp = followUp;
      await response.save();
      
      await logActivity({
        action: 'response_updated',
        entityType: 'DoctorResponse',
        entityId: response._id,
        actorType: 'doctor'
      });
    } else {
      // Create new
      response = await DoctorResponse.create({
        complaintId,
        patientId: pid,
        guidance,
        precautions,
        medicines,
        followUp
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

    // Update complaint status
    if (complaint.status !== 'RESPONDED') {
      complaint.status = 'RESPONDED';
      complaint.doctorResponse = guidance; // Denormalized for easy patient access
      complaint.resolvedAt = new Date();
      await complaint.save();
    }

    res.status(200).json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor response by complaint ID
// @route   GET /api/doctor/responses/complaint/:complaintId
exports.getResponseByComplaint = async (req, res, next) => {
  try {
    const response = await DoctorResponse.findOne({ complaintId: req.params.complaintId });
    // Note: Do not return 404 if missing, just return null as requested in Phase 6 prompt
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
    const response = await DoctorResponse.findByIdAndUpdate(req.params.id, {
      guidance, precautions, medicines, followUp
    }, { new: true, runValidators: true });

    if (!response) {
      return res.status(404).json({ success: false, message: 'Response not found.' });
    }
    
    await logActivity({
      action: 'response_updated',
      entityType: 'DoctorResponse',
      entityId: response._id,
      actorType: 'doctor'
    });

    res.status(200).json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};

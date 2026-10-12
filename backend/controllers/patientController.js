const Patient = require('../models/Patient');
const Complaint = require('../models/Complaint');
const { logActivity } = require('../utils/logger');
const MedicalDocument = require('../models/MedicalDocument');
const DoctorResponse = require('../models/DoctorResponse');
const { assignDoctorToPatient, getDemoDoctor } = require('../utils/doctorAssignment');

// @desc    Create new patient
// @route   POST /api/patients
exports.createPatient = async (req, res, next) => {
  try {
    const { name, age, gender, location, phone } = req.body;
    let patient = await Patient.create({ name, age, gender, location, phone });
    
    // Automatically assign DOC-DEMO-001 on backend
    await assignDoctorToPatient(patient);
    
    // Reload populated patient
    patient = await Patient.findById(patient._id).populate('assignedDoctor', 'name doctorId specialization department availability profileStatus consultationMode');
    
    await logActivity({
      action: 'patient_registered',
      entityType: 'Patient',
      entityId: patient._id,
      actorType: 'patient',
      actorId: patient._id
    });
    
    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
exports.getPatient = async (req, res, next) => {
  try {
    let patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // If existing patient has no assigned doctor, automatically assign demo doctor safely on backend
    if (!patient.assignedDoctor) {
      await assignDoctorToPatient(patient);
    }

    patient = await Patient.findById(req.params.id).populate('assignedDoctor', 'name doctorId specialization department availability profileStatus consultationMode');

    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
exports.updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient timeline
// @route   GET /api/patients/:patientId/timeline
exports.getTimeline = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const complaints = await Complaint.find({ patientId: req.params.patientId }).sort('-createdAt').populate('doctorId');
    const responses = await DoctorResponse.find({ patientId: req.params.patientId }).sort('-createdAt');
    const documents = await MedicalDocument.find({ patientId: req.params.patientId }).sort('-createdAt');
    
    // Map to a combined timeline
    let timeline = [];
    
    // 1. Patient registration
    timeline.push({
      type: 'Patient Registered',
      date: patient.createdAt,
      description: 'रजिस्ट्रेशन किया गया',
      status: 'completed',
      data: patient
    });

    // 2. Complaints
    complaints.forEach(complaint => {
      timeline.push({
        type: 'Health Complaint Submitted',
        date: complaint.createdAt,
        description: `${complaint.problem}\n${complaint.duration}`,
        status: complaint.status,
        data: complaint
      });
      if (complaint.doctorId) {
        timeline.push({
          type: 'Doctor Assigned',
          date: new Date(complaint.createdAt).getTime() + 1000, // 1 sec after
          description: `Dr. ${complaint.doctorId.name.replace('Dr. ', '')} Assigned`,
          status: 'viewed',
          data: complaint
        });
      }
      if (complaint.status === 'UNDER_REVIEW' || complaint.status === 'RESPONDED') {
        timeline.push({
          type: 'Doctor Reviewed',
          date: new Date(complaint.updatedAt).getTime() - 1000, // mock slightly before response
          description: 'डॉक्टर आपकी जानकारी देख रहे हैं',
          status: 'viewed',
          data: complaint
        });
      }
    });

    // 3. Responses and Follow-ups
    responses.forEach(response => {
      const isDemo = response.responseType === 'DEMO_AUTO';
      timeline.push({
        type: isDemo ? 'Interim Health Guidance' : 'Doctor Advice (Authorized)',
        date: response.createdAt,
        description: isDemo 
          ? (response.guidanceTranslated || 'प्राथमिक स्वास्थ्य सलाह उपलब्ध कराई गई')
          : (response.guidanceTranslated || response.guidance || 'डॉक्टर की सलाह उपलब्ध है (Doctor Consultation Note)'),
        status: 'responded',
        isDemo: isDemo,
        data: response
      });

      if (response.followUp && response.followUp.date) {
        timeline.push({
          type: 'Follow-up Scheduled',
          date: response.followUp.date,
          description: `अगली जांच: ${new Date(response.followUp.date).toLocaleDateString('hi-IN')}\n${response.followUp.note || ''}`,
          status: response.followUp.status === 'completed' ? 'completed' : 'pending',
          data: response
        });
      }
    });

    // 4. Documents
    documents.forEach(doc => {
      timeline.push({
        type: 'Medical Document Uploaded',
        date: doc.createdAt,
        description: `${doc.documentType} - ${doc.fileName}`,
        status: 'uploaded',
        data: doc
      });
    });

    // Sort timeline newest first
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      data: {
        patient,
        timeline
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assigned doctor for patient
// @route   GET /api/patients/:patientId/doctor
exports.getAssignedDoctor = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    let doctor = null;
    if (patient.assignedDoctor) {
      doctor = await require('../models/Doctor').findById(patient.assignedDoctor);
    }

    if (!doctor) {
      doctor = await assignDoctorToPatient(patient);
    }

    res.status(200).json({
      success: true,
      data: {
        doctorId: doctor.doctorId,
        name: doctor.name,
        specialization: doctor.specialization,
        department: doctor.department,
        availability: doctor.availability,
        profileStatus: doctor.profileStatus,
        consultationMode: doctor.consultationMode,
        isDemoDoctor: doctor.isDemoDoctor,
        notice: "Prototype demonstration profile - Replace with verified medical professional before real patient use."
      }
    });
  } catch (error) {
    next(error);
  }
};

const Patient = require('../models/Patient');
const Complaint = require('../models/Complaint');
const DoctorResponse = require('../models/DoctorResponse');

// @desc    Get dashboard overview
// @route   GET /api/health-worker/overview
exports.getOverview = async (req, res, next) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'READY_FOR_DOCTOR' });
    const respondedComplaints = await Complaint.countDocuments({ status: 'RESPONDED' });
    
    // Count upcoming follow-ups
    const now = new Date();
    const followUpsDue = await DoctorResponse.countDocuments({
      'followUp.date': { $gte: new Date(now.setHours(0,0,0,0)) },
      'followUp.status': 'pending'
    });

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        pendingComplaints,
        respondedComplaints,
        followUpsDue
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patients list with latest complaint
// @route   GET /api/health-worker/patients
exports.getPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find().sort('-createdAt').lean();
    
    // For each patient, get the latest complaint
    for (let i = 0; i < patients.length; i++) {
      const latestComplaint = await Complaint.findOne({ patientId: patients[i]._id }).sort('-createdAt').lean();
      patients[i].latestComplaint = latestComplaint || null;
      
      if (latestComplaint && latestComplaint.status === 'RESPONDED') {
         const response = await DoctorResponse.findOne({ complaintId: latestComplaint._id }).lean();
         if (response && response.followUp && response.followUp.date) {
             patients[i].nextFollowUp = response.followUp;
         }
      }
    }

    res.status(200).json({ success: true, data: patients });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming follow-ups
// @route   GET /api/health-worker/followups
exports.getFollowups = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0,0,0,0));
    
    const responses = await DoctorResponse.find({
      'followUp.date': { $gte: startOfToday },
      'followUp.status': 'pending'
    }).populate('patientId', 'name location phone').sort('followUp.date');
    
    res.status(200).json({ success: true, data: responses });
  } catch (error) {
    next(error);
  }
};

const Doctor = require('../models/Doctor');

const DEMO_DOCTOR_CONFIG = {
  name: 'Dr. Demo Sharma',
  doctorId: 'DOC-DEMO-001',
  passwordHash: 'demo123',
  specialization: 'General Medicine',
  department: 'General Healthcare',
  availability: 'Demo Mode',
  profileStatus: 'Prototype Demo Doctor',
  consultationMode: 'Prototype complaint-and-response workflow',
  isDemoDoctor: true,
  assignedVillages: ['Rampur', 'Sitapur', 'Jaipur', 'All Villages (Demo)'],
  role: 'DOCTOR'
};

/**
 * Ensures the predefined prototype demo doctor exists in MongoDB.
 * Avoids creating duplicate doctor records on server restarts.
 */
const initDemoDoctor = async () => {
  try {
    let doctor = await Doctor.findOne({ doctorId: DEMO_DOCTOR_CONFIG.doctorId });
    if (!doctor) {
      doctor = await Doctor.create(DEMO_DOCTOR_CONFIG);
      console.log('✅ Demo Doctor initialized:', doctor.name, `(${doctor.doctorId})`);
    } else {
      // Ensure all prototype profile fields match the prompt specification
      let updated = false;
      for (const [key, val] of Object.entries(DEMO_DOCTOR_CONFIG)) {
        if (doctor[key] !== val && key !== 'assignedVillages') {
          doctor[key] = val;
          updated = true;
        }
      }
      if (updated) {
        await doctor.save();
        console.log('🔄 Demo Doctor profile synchronized:', doctor.name);
      }
    }
    return doctor;
  } catch (error) {
    console.error('❌ Failed to initialize Demo Doctor:', error.message);
    throw error;
  }
};

module.exports = {
  initDemoDoctor,
  DEMO_DOCTOR_CONFIG
};

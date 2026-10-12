const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { initDemoDoctor, DEMO_DOCTOR_CONFIG } = require('./initDemoDoctor');

/**
 * Retrieves the primary demo doctor record.
 */
const getDemoDoctor = async () => {
  let doc = await Doctor.findOne({ doctorId: DEMO_DOCTOR_CONFIG.doctorId });
  if (!doc) {
    doc = await initDemoDoctor();
  }
  return doc;
};

/**
 * Assigns a doctor to a patient record modularly.
 * Preserves existing assignment if already set.
 * Returns the populated doctor document.
 */
const assignDoctorToPatient = async (patientOrId) => {
  let patient = typeof patientOrId === 'string' || patientOrId instanceof require('mongoose').Types.ObjectId
    ? await Patient.findById(patientOrId)
    : patientOrId;

  if (!patient) {
    throw new Error('Patient not found for doctor assignment');
  }

  // 1. If already assigned, ensure it exists and return it
  if (patient.assignedDoctor) {
    const existingDoc = await Doctor.findById(patient.assignedDoctor);
    if (existingDoc) {
      return existingDoc;
    }
  }

  // 2. Assign predefined prototype demo doctor DOC-DEMO-001 (Modular: ready for future village routing)
  let targetDoctor = await getDemoDoctor();

  if (!targetDoctor) {
    throw new Error('No doctor available for assignment');
  }

  // 3. Atomically update patient record with assigned doctor
  patient.assignedDoctor = targetDoctor._id;
  await patient.save();

  return targetDoctor;
};

module.exports = {
  getDemoDoctor,
  assignDoctorToPatient
};

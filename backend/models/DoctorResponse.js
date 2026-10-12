const mongoose = require('mongoose');

const doctorResponseSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true,
    unique: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  responseType: {
    type: String,
    enum: ['DEMO_AUTO', 'DOCTOR_AUTHORIZED'],
    default: 'DEMO_AUTO'
  },
  disclaimer: {
    type: String,
    default: "DEMO RESPONSE — NOT A REAL DOCTOR'S CONSULTATION"
  },
  // Doctor's Original Response (English)
  guidance: {
    type: String,
    required: true
  },
  precautions: {
    type: String
  },
  medicines: {
    type: String
  },
  // Translated Response for Patient (in patient's original language)
  guidanceTranslated: {
    type: String
  },
  precautionsTranslated: {
    type: String
  },
  medicinesTranslated: {
    type: String
  },
  targetLanguage: {
    type: String,
    default: 'hi-IN'
  },
  followUp: {
    date: { type: Date },
    note: { type: String },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DoctorResponse', doctorResponseSchema);

const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  originalStatement: {
    type: String,
    required: true
  },
  problem: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  additionalSymptoms: {
    type: String
  },
  // English translations for doctor view
  originalStatementEnglish: {
    type: String
  },
  problemEnglish: {
    type: String
  },
  durationEnglish: {
    type: String
  },
  additionalSymptomsEnglish: {
    type: String
  },
  status: {
    type: String,
    enum: ['READY_FOR_DOCTOR', 'UNDER_REVIEW', 'RESPONDED'],
    default: 'READY_FOR_DOCTOR'
  },
  inputMethod: {
    type: String,
    enum: ['voice', 'text'],
    required: true
  },
  language: {
    type: String,
    default: 'hi-IN'
  },
  // Doctor original English response
  doctorResponse: {
    type: String
  },
  // Translated doctor response in patient's language
  doctorResponseTranslated: {
    type: String
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Explicit indexes for triage queues and patient lookups
complaintSchema.index({ patientId: 1, createdAt: -1 });
complaintSchema.index({ doctorId: 1, status: 1 });
complaintSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);

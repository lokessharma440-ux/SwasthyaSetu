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
  followUp: {
    date: { type: Date },
    note: { type: String },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DoctorResponse', doctorResponseSchema);

const mongoose = require('mongoose');

const medicalDocumentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  storagePath: { type: String, required: true },
  documentType: { type: String, enum: ['prescription', 'lab report', 'medical report', 'other'], default: 'other' },
}, { timestamps: true });

module.exports = mongoose.model('MedicalDocument', medicalDocumentSchema);

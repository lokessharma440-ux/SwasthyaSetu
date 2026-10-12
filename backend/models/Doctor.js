const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  doctorId: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  specialization: { type: String, default: 'General Medicine' },
  department: { type: String, default: 'General Healthcare' },
  availability: { type: String, default: 'Demo Mode' },
  profileStatus: { type: String, default: 'Prototype Demo Doctor' },
  consultationMode: { type: String, default: 'Prototype complaint-and-response workflow' },
  isDemoDoctor: { type: Boolean, default: true },
  assignedVillages: [{ type: String }],
  role: { type: String, default: 'DOCTOR' }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
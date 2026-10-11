const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  doctorId: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  assignedVillages: [{ type: String }],
  role: { type: String, default: 'DOCTOR' }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
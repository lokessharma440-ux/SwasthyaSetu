const mongoose = require('mongoose');

const healthcareFacilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // PHC, CHC, District Hospital, Health Centre
  address: { type: String },
  village: { type: String },
  district: { type: String },
  state: { type: String },
  phone: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  services: [{ type: String }],
  isEmergencyAvailable: { type: Boolean, default: false }
});

module.exports = mongoose.model('HealthcareFacility', healthcareFacilitySchema);

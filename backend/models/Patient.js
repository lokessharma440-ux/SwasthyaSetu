const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  age: {
    type: Number,
    min: [1, 'Age must be at least 1'],
    max: [120, 'Age must be less than 120']
  },
  gender: {
    type: String,
    enum: ['महिला', 'पुरुष', 'अन्य', 'बताना नहीं चाहते', 'Male', 'Female', 'Other', 'Prefer not to say']
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid 10-digit phone number!`
    }
  },
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  }
}, {
  timestamps: true
});

// Explicit indexes for patient lookups and triage assignment
patientSchema.index({ phone: 1 });
patientSchema.index({ assignedDoctor: 1 });
patientSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Patient', patientSchema);

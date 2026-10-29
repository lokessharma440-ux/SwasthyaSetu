const mongoose = require('../backend/node_modules/mongoose');

async function clean() {
  await mongoose.connect('mongodb://127.0.0.1:27017/swasthyasetu');
  
  const patientSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Name is required'] },
    phone: { 
      type: String, 
      validate: {
        validator: (v) => !v || /^\d{10}$/.test(v),
        message: 'Invalid phone'
      }
    },
    location: { type: String, required: [true, 'Location is required'] },
    assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }
  }, { strict: false, timestamps: true });
  patientSchema.index({ phone: 1 });
  patientSchema.index({ createdAt: -1 });

  const complaintSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: [true, 'Patient ID required'] },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    problem: { type: String, required: [true, 'Problem required'] },
    duration: { type: String, required: [true, 'Duration required'] },
    status: { type: String, enum: ['READY_FOR_DOCTOR', 'UNDER_REVIEW', 'RESPONDED'], default: 'READY_FOR_DOCTOR' }
  }, { strict: false, timestamps: true });
  complaintSchema.index({ patientId: 1 });
  complaintSchema.index({ status: 1 });

  const doctorSchema = new mongoose.Schema({
    doctorId: { type: String, required: [true, 'Doctor ID required'], unique: true },
    name: { type: String, required: [true, 'Doctor name required'] }
  }, { strict: false, timestamps: true });
  doctorSchema.index({ doctorId: 1 });

  const doctorResponseSchema = new mongoose.Schema({
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: [true, 'Complaint ID required'], unique: true }
  }, { strict: false, timestamps: true });
  doctorResponseSchema.index({ complaintId: 1 });

  const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);
  const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);
  const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);
  const DoctorResponse = mongoose.models.DoctorResponse || mongoose.model('DoctorResponse', doctorResponseSchema);

  // 1. Delete all fake Ramesh Patel patients
  await Patient.deleteMany({ name: /Ramesh Patel/i });

  // 2. Delete test dummy complaints
  await Complaint.deleteMany({ 
    $or: [
      { problem: /Tez bukhar/i },
      { problem: /General uneasiness/i },
      { problem: 'Severe Headache' },
      { problem: /Severe stomach pain/i },
      { duration: 'Not specified' }
    ]
  });

  // 3. Keep the single primary active patient for Lokesh Sharma
  let pLatest = await Patient.findOne({ name: /lokesh/i }).sort('-createdAt');
  if (pLatest) {
    pLatest.name = 'Lokesh Sharma';
    pLatest.phone = '9453123295';
    pLatest.location = 'Lucknow';
    await pLatest.save();
    
    // Delete any other duplicate patient records
    await Patient.deleteMany({ _id: { $ne: pLatest._id } });
    
    // Point all valid complaints to this patient
    await Complaint.updateMany({}, { patientId: pLatest._id });
  }

  // 4. Ensure demo doctor exists and link complaints to demo doctor
  const demoDoc = await Doctor.findOne({ doctorId: 'DOC-DEMO-001' });
  if (demoDoc) {
    await Patient.updateMany({}, { assignedDoctor: demoDoc._id });
    await Complaint.updateMany({}, { doctorId: demoDoc._id });
  }

  // 5. Clean DoctorResponses for deleted complaints
  const existingComplaintIds = (await Complaint.find()).map(c => c._id);
  await DoctorResponse.deleteMany({ complaintId: { $nin: existingComplaintIds } });

  console.log('--- CLEANUP COMPLETE ---');
  const patients = await Patient.find();
  console.log('Total Patients:', patients.length);
  patients.forEach(p => console.log({ id: p._id.toString(), name: p.name, phone: p.phone, location: p.location }));

  const complaints = await Complaint.find().sort('-createdAt');
  console.log('Total Complaints:', complaints.length);
  complaints.forEach(c => console.log({ id: c._id.toString(), problem: c.problem, duration: c.duration, status: c.status, createdAt: c.createdAt }));

  process.exit(0);
}

clean().catch(err => {
  console.error(err);
  process.exit(1);
});

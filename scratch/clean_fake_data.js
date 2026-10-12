const mongoose = require('../backend/node_modules/mongoose');

async function clean() {
  await mongoose.connect('mongodb://127.0.0.1:27017/swasthyasetu');
  const Patient = mongoose.model('Patient', new mongoose.Schema({}, { strict: false }));
  const Complaint = mongoose.model('Complaint', new mongoose.Schema({}, { strict: false }));
  const Doctor = mongoose.model('Doctor', new mongoose.Schema({}, { strict: false }));
  const DoctorResponse = mongoose.model('DoctorResponse', new mongoose.Schema({}, { strict: false }));

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

require('dotenv').config();
const mongoose = require('mongoose');
const Patient = require('./models/Patient');
const Complaint = require('./models/Complaint');
const Doctor = require('./models/Doctor');
const connectDB = require('./config/db');

async function check() {
  await connectDB();
  console.log('=== DOCTORS ===');
  const docs = await Doctor.find({}).lean();
  console.log(docs.map(d => ({ _id: d._id.toString(), doctorId: d.doctorId, name: d.name })));

  console.log('\n=== RECENT PATIENTS (latest 5) ===');
  const patients = await Patient.find({}).sort('-createdAt').limit(5).lean();
  console.log(patients.map(p => ({ _id: p._id.toString(), name: p.name, location: p.location, assignedDoctor: p.assignedDoctor })));

  console.log('\n=== RECENT COMPLAINTS (latest 10) ===');
  const complaints = await Complaint.find({}).sort('-createdAt').limit(10).lean();
  console.log(complaints.map(c => ({
    _id: c._id.toString(),
    patientId: c.patientId,
    doctorId: c.doctorId,
    problem: c.problem,
    originalStatement: c.originalStatement,
    status: c.status,
    createdAt: c.createdAt
  })));

  process.exit();
}

check();

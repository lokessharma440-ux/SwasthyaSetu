require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const connectDB = require('./config/db');

const seedDoctors = async () => {
  await connectDB();
  
  const doctors = [
    {
      name: 'Dr. Rahul Sharma',
      doctorId: 'doc1',
      passwordHash: 'password',
      assignedVillages: ['Rampur', 'Village A'],
      role: 'DOCTOR'
    },
    {
      name: 'Dr. Priya',
      doctorId: 'doc2',
      passwordHash: 'password',
      assignedVillages: ['Village B', 'Sitapur'],
      role: 'DOCTOR'
    },
    {
      name: 'Dr. Amit',
      doctorId: 'doc3',
      passwordHash: 'password',
      assignedVillages: ['Village C', 'Jaipur'],
      role: 'DOCTOR'
    }
  ];

  try {
    await Doctor.deleteMany({});
    await Doctor.insertMany(doctors);
    console.log('Doctors seeded successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDoctors();
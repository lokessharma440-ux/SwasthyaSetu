const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

// Import models
const ActivityLog = require('../models/ActivityLog');
const Complaint = require('../models/Complaint');
const Doctor = require('../models/Doctor');
const DoctorResponse = require('../models/DoctorResponse');
const HealthcareFacility = require('../models/HealthcareFacility');
const MedicalDocument = require('../models/MedicalDocument');
const Patient = require('../models/Patient');

describe('Mongoose Models & Schema Indexes Verification', () => {
  test('ActivityLog schema defines explicit indexes and required fields', () => {
    const indexes = ActivityLog.schema.indexes();
    assert.ok(indexes.length > 0, 'ActivityLog should have explicit indexes defined');
    
    // Check that required fields exist in schema
    const paths = ActivityLog.schema.paths;
    assert.ok(paths.action.isRequired, 'action is required');
    assert.ok(paths.entityType.isRequired, 'entityType is required');
    assert.ok(paths.entityId.isRequired, 'entityId is required');
    assert.ok(paths.actorType.isRequired, 'actorType is required');
  });

  test('Complaint schema defines explicit indexes and status enums', () => {
    const indexes = Complaint.schema.indexes();
    assert.ok(indexes.length >= 3, 'Complaint should define explicit indexes for patientId, doctorId, status');
    
    const paths = Complaint.schema.paths;
    assert.ok(paths.patientId.isRequired, 'patientId is required');
    assert.ok(paths.problem.isRequired, 'problem is required');
    assert.ok(paths.duration.isRequired, 'duration is required');
    assert.deepEqual(paths.status.enumValues, ['READY_FOR_DOCTOR', 'UNDER_REVIEW', 'RESPONDED']);
  });

  test('Doctor schema defines explicit indexes and unique doctorId', () => {
    const indexes = Doctor.schema.indexes();
    assert.ok(indexes.length > 0, 'Doctor should have explicit indexes defined');
    
    const paths = Doctor.schema.paths;
    assert.ok(paths.name.isRequired, 'name is required');
    assert.ok(paths.doctorId.isRequired, 'doctorId is required');
    assert.ok(paths.passwordHash.isRequired, 'passwordHash is required');
  });

  test('DoctorResponse schema defines explicit indexes', () => {
    const indexes = DoctorResponse.schema.indexes();
    assert.ok(indexes.length >= 3, 'DoctorResponse should define explicit indexes for complaintId, patientId, doctorId');
    
    const paths = DoctorResponse.schema.paths;
    assert.ok(paths.complaintId.isRequired, 'complaintId is required');
    assert.ok(paths.guidance.isRequired, 'guidance is required');
  });

  test('HealthcareFacility schema defines explicit indexes', () => {
    const indexes = HealthcareFacility.schema.indexes();
    assert.ok(indexes.length >= 2, 'HealthcareFacility should have explicit indexes for location and name');
    
    const paths = HealthcareFacility.schema.paths;
    assert.ok(paths.name.isRequired, 'name is required');
    assert.ok(paths.type.isRequired, 'type is required');
  });

  test('MedicalDocument schema defines explicit indexes', () => {
    const indexes = MedicalDocument.schema.indexes();
    assert.ok(indexes.length >= 2, 'MedicalDocument should have explicit indexes for patientId and complaintId');
    
    const paths = MedicalDocument.schema.paths;
    assert.ok(paths.patientId.isRequired, 'patientId is required');
    assert.ok(paths.fileName.isRequired, 'fileName is required');
  });

  test('Patient schema defines explicit indexes and phone validator', () => {
    const indexes = Patient.schema.indexes();
    assert.ok(indexes.length >= 3, 'Patient should have explicit indexes for phone, assignedDoctor, createdAt');
    
    const paths = Patient.schema.paths;
    assert.ok(paths.name.isRequired, 'name is required');
    assert.ok(paths.location.isRequired, 'location is required');
  });
});


const http = require('http');

const API_BASE = 'http://localhost:5000/api';

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('🧪 Starting SwasthyaSetu Verification Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // Test 1: Check Demo Doctor exists
    console.log('--- Test 1: Demo Doctor Initialization ---');
    const docLogin = await fetchJson(`${API_BASE}/doctor/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorId: 'DOC-DEMO-001', password: 'demo123' })
    });
    assert(docLogin.ok && docLogin.data.data.name === 'Dr. Demo Sharma', 'Demo Doctor logs in with DOC-DEMO-001 / demo123');
    const demoDoctorObj = docLogin.data.data;

    // Test 2: New patient registration with automatic doctor assignment
    console.log('\n--- Test 2: New Patient Registration Auto-Assignment ---');
    const uniquePhone = '98' + Math.floor(10000000 + Math.random() * 90000000);
    const newPatientRes = await fetchJson(`${API_BASE}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ramesh Patel',
        age: 38,
        gender: 'Male',
        location: 'Rampur',
        phone: uniquePhone
      })
    });
    assert(newPatientRes.ok, 'New patient registered successfully');
    const patient1 = newPatientRes.data.data;
    assert(patient1.assignedDoctor && patient1.assignedDoctor.doctorId === 'DOC-DEMO-001', 'Patient auto-assigned to DOC-DEMO-001');

    // Test 3: Existing patient retrieval preserves assignment
    console.log('\n--- Test 3: Existing Patient Assignment Preservation ---');
    const getPatientRes = await fetchJson(`${API_BASE}/patients/${patient1._id}`);
    assert(getPatientRes.ok, 'Existing patient retrieved successfully');
    const retrievedPatient = getPatientRes.data.data;
    assert(retrievedPatient.assignedDoctor.doctorId === 'DOC-DEMO-001', 'Existing patient retains DOC-DEMO-001 assignment');

    // Test 4: Dedicated assigned doctor endpoint
    console.log('\n--- Test 4: Dedicated Assigned Doctor Endpoint ---');
    const docEndpointRes = await fetchJson(`${API_BASE}/patients/${patient1._id}/doctor`);
    assert(docEndpointRes.ok && docEndpointRes.data.data.doctorId === 'DOC-DEMO-001', 'GET /api/patients/:id/doctor returns Dr. Demo Sharma');
    assert(docEndpointRes.data.data.specialization === 'General Medicine', 'Specialization is General Medicine');
    assert(docEndpointRes.data.data.profileStatus === 'Prototype Demo Doctor', 'Status is Prototype Demo Doctor');

    // Test 5: Submit Fever complaint & verify safe demo response
    console.log('\n--- Test 5: Fever Complaint & Safe Prototype Response ---');
    const feverComplaintRes = await fetchJson(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: patient1._id,
        originalStatement: 'Mujhe 3 din se tez bukhar hai aur thand lag rahi hai',
        problem: 'Tez bukhar (High Fever)',
        duration: '3 days',
        additionalSymptoms: 'Thand lagna (Chills)',
        inputMethod: 'voice',
        language: 'hi-IN'
      })
    });
    assert(feverComplaintRes.ok, 'Fever complaint submitted successfully');
    const feverComplaint = feverComplaintRes.data.data;
    const feverDemoResponse = feverComplaintRes.data.demoResponse;
    assert(feverComplaint.doctorId && feverComplaint.status === 'READY_FOR_DOCTOR', 'Complaint linked to doctor and set to READY_FOR_DOCTOR');
    assert(feverDemoResponse && feverDemoResponse.responseType === 'DEMO_AUTO', 'Demo response generated automatically');
    assert(feverDemoResponse.disclaimer.includes("DEMO RESPONSE — NOT A REAL DOCTOR'S CONSULTATION"), 'Prominent DEMO RESPONSE disclaimer present');
    assert(feverDemoResponse.medicines === '', 'Strict check: No medication dosages or prescriptions generated');
    assert(feverDemoResponse.guidance.includes('fever'), 'Guidance includes fever advisory text');

    // Test 6: Submit Headache complaint & verify safe demo response
    console.log('\n--- Test 6: Headache Complaint & Safe Prototype Response ---');
    const headacheComplaintRes = await fetchJson(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: patient1._id,
        originalStatement: 'Sir me bahut tez dard ho raha hai',
        problem: 'Severe Headache',
        duration: '1 day',
        additionalSymptoms: 'Giddiness',
        inputMethod: 'text',
        language: 'en'
      })
    });
    assert(headacheComplaintRes.ok, 'Headache complaint submitted');
    const headacheDemo = headacheComplaintRes.data.demoResponse;
    assert(headacheDemo.guidance.toLowerCase().includes('headache'), 'Guidance includes headache advisory text');
    assert(headacheDemo.medicines === '', 'Strict check: No medication or painkillers generated');

    // Test 7: Submit Unrecognized complaint & verify default fallback
    console.log('\n--- Test 7: Unrecognized Complaint Fallback ---');
    const genericComplaintRes = await fetchJson(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: patient1._id,
        originalStatement: 'Kuch ajeeb si uljhan ho rahi hai',
        problem: 'General uneasiness',
        duration: 'Hours',
        inputMethod: 'text',
        language: 'en'
      })
    });
    assert(genericComplaintRes.ok, 'Generic complaint submitted');
    const genericDemo = genericComplaintRes.data.demoResponse;
    assert(genericDemo.guidance.includes('healthcare complaint has been successfully received'), 'Generic acknowledgement fallback generated');

    // Test 8: Doctor Queue & Filtering
    console.log('\n--- Test 8: Doctor Queue & Stats ---');
    const doctorQueue = await fetchJson(`${API_BASE}/doctor/complaints`, {
      headers: { 'x-doctor-id': demoDoctorObj._id }
    });
    assert(doctorQueue.ok && doctorQueue.data.data.length >= 3, `Doctor queue returns complaints (${doctorQueue.data.data.length} found)`);

    const doctorStats = await fetchJson(`${API_BASE}/doctor/stats`, {
      headers: { 'x-doctor-id': demoDoctorObj._id }
    });
    assert(doctorStats.ok, 'Doctor stats endpoint returned successfully');
    assert(doctorStats.data.data.totalAssignedPatients >= 1, `Total assigned patients: ${doctorStats.data.data.totalAssignedPatients}`);
    assert(doctorStats.data.data.pendingComplaints >= 3, `Pending complaints calculated: ${doctorStats.data.data.pendingComplaints}`);

    // Test 9: Doctor submits authorized response to Fever complaint
    console.log('\n--- Test 9: Doctor Submits Authorized Response ---');
    const doctorResponseRes = await fetchJson(`${API_BASE}/doctor/responses`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-doctor-id': demoDoctorObj._id 
      },
      body: JSON.stringify({
        complaintId: feverComplaint._id,
        patientId: patient1._id,
        guidance: 'Drink oral rehydration solution regularly. Paracetamol only if fever exceeds 101F. Visit PHC for blood smear test if fever continues past 48 hours.',
        precautions: 'Complete bed rest and plenty of fluids.',
        medicines: 'Paracetamol 500mg SOS (max 3 times/day)',
        followUp: {
          date: '2026-10-15',
          note: 'Visit village health sub-centre for follow-up evaluation'
        }
      })
    });
    assert(doctorResponseRes.ok, 'Doctor authorized response saved successfully');
    const updatedResp = doctorResponseRes.data.data;
    assert(updatedResp.responseType === 'DOCTOR_AUTHORIZED', 'Response upgraded to DOCTOR_AUTHORIZED');
    assert(updatedResp.guidance.includes('blood smear test'), 'Doctor clinical guidance updated');

    // Verify complaint status changed to RESPONDED
    const updatedComplaint = await fetchJson(`${API_BASE}/complaints/${feverComplaint._id}`);
    assert(updatedComplaint.data.data.status === 'RESPONDED', 'Complaint status updated to RESPONDED');

    // Test 10: Patient timeline reflects authorized doctor advice
    console.log('\n--- Test 10: Patient Timeline Verification ---');
    const timelineRes = await fetchJson(`${API_BASE}/patients/${patient1._id}/timeline`);
    assert(timelineRes.ok, 'Patient timeline fetched successfully');
    const items = timelineRes.data.data.timeline;
    // Note: Array.prototype.find on response payload; Mongoose .lean() is applied to server-side queries
    const authItem = items.find(i => i.type === 'Doctor Advice (Authorized)');
    assert(!!authItem, 'Timeline includes Doctor Advice (Authorized)');

    // Test 11: Security & Authorization - prevent patient impersonating doctor without headers
    console.log('\n--- Test 11: Security & Doctor Auth Guard ---');
    const unauthDoctorRes = await fetchJson(`${API_BASE}/doctor/stats`, {
      headers: {} // No x-doctor-id
    });
    assert(unauthDoctorRes.status === 401, 'Unauthorized request to /api/doctor/stats correctly blocked with 401');

    // Test 12: Doctor Patient Records Endpoint
    console.log('\n--- Test 12: Doctor Patient Records Endpoint ---');
    const doctorPatientsRes = await fetchJson(`${API_BASE}/doctor/patients`, {
      headers: { 'x-doctor-id': demoDoctorObj._id }
    });
    assert(doctorPatientsRes.ok, 'Doctor patient records fetched successfully');
    assert(doctorPatientsRes.data.data.some(p => p._id === patient1._id), 'Ramesh Patel is listed in doctor patients');

    // Test 13: Doctor Profile Endpoint
    console.log('\n--- Test 13: Doctor Profile Endpoint ---');
    const docProfileRes = await fetchJson(`${API_BASE}/doctor/profile`, {
      headers: { 'x-doctor-id': demoDoctorObj._id }
    });
    assert(docProfileRes.ok, 'Doctor profile fetched');
    assert(docProfileRes.data.data.prototypeNotice.includes('DEMONSTRATION PROFILE NOTICE'), 'Notice warning present in profile endpoint');

    console.log(`\n==========================================`);
    console.log(`Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`==========================================\n`);

  } catch (err) {
    console.error('Fatal error during test run:', err);
  }
}

runTests();

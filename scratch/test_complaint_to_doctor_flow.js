async function runTest() {
  console.log('--- STARTING VERIFICATION TEST ---');

  // Test 1: Spoken complaint with local patient ID
  console.log('\n1. Testing complaint submission with local/unregistered patient ID...');
  const localComplaintRes = await fetch('http://localhost:5000/api/complaints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientId: 'local_' + Date.now(),
      patientName: 'Lokesh Sharma Voice Verification',
      phone: '9988776655',
      problem: 'Pet me tez dard ho raha hai (Severe stomach pain)',
      originalStatement: 'Mujhe kal raat se pet me bahut dard hai aur ulti jaisa lag raha hai',
      duration: 'Since last night',
      additionalSymptoms: 'Nausea and weakness',
      inputMethod: 'voice',
      language: 'hi-IN'
    })
  });

  const localComplaintJson = await localComplaintRes.json();
  console.log('Status code:', localComplaintRes.status);
  console.log('Success:', localComplaintJson.success);
  console.log('Created Complaint ID:', localComplaintJson.data?._id);
  console.log('Patient Name:', localComplaintJson.data?.patientId?.name);
  console.log('Assigned Doctor:', localComplaintJson.data?.doctorId?.name);

  if (!localComplaintJson.success) {
    throw new Error('Local complaint failed to persist to MongoDB: ' + JSON.stringify(localComplaintJson));
  }
  const complaintId = localComplaintJson.data._id;
  const patientId = localComplaintJson.data.patientId._id;

  // Test 2: Check Doctor Complaints Queue
  console.log('\n2. Fetching complaints queue on Doctor Portal (/api/doctor/complaints)...');
  const doctorQueueRes = await fetch('http://localhost:5000/api/doctor/complaints', {
    headers: {
      'x-doctor-id': 'DOC-DEMO-001'
    }
  });

  const doctorQueueJson = await doctorQueueRes.json();
  console.log('Status code:', doctorQueueRes.status);
  console.log('Total Complaints in queue:', doctorQueueJson.count);
  
  const foundComplaint = doctorQueueJson.data?.find(c => c._id === complaintId);
  console.log('Spoken complaint found on Doctor Dashboard?:', !!foundComplaint);
  if (!foundComplaint) {
    throw new Error('Spoken complaint was NOT found in doctor complaints queue!');
  }
  console.log('  -> Patient:', foundComplaint.patientId?.name);
  console.log('  -> Problem:', foundComplaint.problem);
  console.log('  -> Status:', foundComplaint.status);
  console.log('  -> Input method:', foundComplaint.inputMethod);

  // Test 3: Check Doctor Stats
  console.log('\n3. Fetching doctor overview stats (/api/doctor/stats)...');
  const doctorStatsRes = await fetch('http://localhost:5000/api/doctor/stats', {
    headers: {
      'x-doctor-id': 'DOC-DEMO-001'
    }
  });
  const doctorStatsJson = await doctorStatsRes.json();
  console.log('Doctor Stats:', {
    totalAssignedPatients: doctorStatsJson.data?.totalAssignedPatients,
    totalComplaints: doctorStatsJson.data?.totalComplaints,
    pendingComplaints: doctorStatsJson.data?.pendingComplaints,
    recentRequestsCount: doctorStatsJson.data?.recentRequests?.length
  });

  const latestRequest = doctorStatsJson.data?.recentRequests?.[0];
  console.log('Top recent request on Doctor Overview:', {
    id: latestRequest?._id,
    patient: latestRequest?.patientId?.name,
    problem: latestRequest?.problem
  });

  // Test 4: Doctor marks under review and submits authorized consultation note
  console.log('\n4. Doctor reviews and submits authorized clinical response...');
  const reviewRes = await fetch(`http://localhost:5000/api/doctor/complaints/${complaintId}/review`, {
    method: 'PATCH',
    headers: { 'x-doctor-id': 'DOC-DEMO-001' }
  });
  console.log('Mark under review status:', (await reviewRes.json()).data?.status);

  const submitResponseRes = await fetch('http://localhost:5000/api/doctor/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-doctor-id': 'DOC-DEMO-001'
    },
    body: JSON.stringify({
      complaintId,
      patientId,
      guidance: 'Take ORS solution, drink boiled water, avoid spicy and heavy food. Rest in a well-ventilated room.',
      precautions: 'Do not eat outside food. Maintain hydration.',
      medicines: 'ORS sachet 1 packet in 1 litre water, Paracetamol 500mg if fever persists.',
      followUp: {
        date: new Date(Date.now() + 86400000 * 2).toISOString(),
        note: 'Follow-up in 2 days if pain continues.'
      }
    })
  });
  const submitResponseJson = await submitResponseRes.json();
  console.log('Doctor Response Submitted:', submitResponseJson.success);

  // Test 5: Verify complaint status updated to RESPONDED
  console.log('\n5. Verifying complaint updated to RESPONDED on patient and doctor APIs...');
  const verifyComplaintRes = await fetch(`http://localhost:5000/api/complaints/${complaintId}`);
  const verifyComplaintJson = await verifyComplaintRes.json();
  console.log('Updated Complaint Status:', verifyComplaintJson.data?.status);
  console.log('Clinical Advice:', verifyComplaintJson.data?.doctorResponse);

  if (verifyComplaintJson.data?.status !== 'RESPONDED') {
    throw new Error('Complaint status did not update to RESPONDED!');
  }

  console.log('\n✅ ALL 5 END-TO-END WORKFLOW TESTS PASSED SUCCESSFULLY!');
}

runTest().catch(err => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});

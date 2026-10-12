// Normalize API URL from environment variable (VITE_API_URL) with localhost fallback
const getApiBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();
  if (!envUrl) {
    return 'http://localhost:5000/api';
  }
  const cleanUrl = envUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

export const API_BASE = getApiBaseUrl();

const getAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const doctorStr = localStorage.getItem('swasthya_doctor');
    if (doctorStr) {
      const doctor = JSON.parse(doctorStr);
      headers['x-doctor-id'] = doctor._id || doctor.doctorId || 'DOC-DEMO-001';
    } else {
      // Default to demo doctor ID for seamless prototype workflow
      headers['x-doctor-id'] = 'DOC-DEMO-001';
    }
  } catch (e) {
    headers['x-doctor-id'] = 'DOC-DEMO-001';
  }
  return headers;
};

const handleResponse = async (res) => {
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Something went wrong');
  }
  return json.data !== undefined ? json.data : json;
};

// --- Patient APIs ---

export const createPatient = async (patientData) => {
  const res = await fetch(`${API_BASE}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData)
  });
  return handleResponse(res);
};

export const getPatient = async (id) => {
  const res = await fetch(`${API_BASE}/patients/${id}`);
  return handleResponse(res);
};

export const getAssignedDoctor = async (patientId) => {
  const res = await fetch(`${API_BASE}/patients/${patientId}/doctor`);
  return handleResponse(res);
};

export const createComplaint = async (complaintData) => {
  const res = await fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(complaintData)
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Error creating complaint');
  }
  return {
    ...json.data,
    demoResponse: json.demoResponse
  };
};

export const getPatientComplaints = async (patientId) => {
  const res = await fetch(`${API_BASE}/complaints/patient/${patientId}`);
  return handleResponse(res);
};

export const getTimeline = async (patientId) => {
  const res = await fetch(`${API_BASE}/patients/${patientId}/timeline`);
  return handleResponse(res);
};

// --- Doctor APIs ---

export const loginDoctor = async (credentials) => {
  const res = await fetch(`${API_BASE}/doctor/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return handleResponse(res);
};

export const getDoctorStats = async () => {
  const res = await fetch(`${API_BASE}/doctor/stats`, { 
    headers: getAuthHeaders() 
  });
  return handleResponse(res);
};

export const getDoctorPatients = async () => {
  const res = await fetch(`${API_BASE}/doctor/patients`, { 
    headers: getAuthHeaders() 
  });
  return handleResponse(res);
};

export const getDoctorProfile = async () => {
  const res = await fetch(`${API_BASE}/doctor/profile`, { 
    headers: getAuthHeaders() 
  });
  return handleResponse(res);
};

export const getDoctorComplaints = async (status = '', search = '', sort = 'newest') => {
  let url = `${API_BASE}/doctor/complaints?`;
  if (status) url += `status=${status}&`;
  if (search) url += `search=${encodeURIComponent(search)}&`;
  if (sort) url += `sort=${sort}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const markComplaintUnderReview = async (id) => {
  const res = await fetch(`${API_BASE}/doctor/complaints/${id}/review`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const createDoctorResponse = async (complaintId, responseData) => {
  const res = await fetch(`${API_BASE}/doctor/responses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ complaintId, ...responseData })
  });
  return handleResponse(res);
};

export const updateDoctorResponse = async (id, responseData) => {
  const res = await fetch(`${API_BASE}/doctor/responses/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(responseData)
  });
  return handleResponse(res);
};

export const getDoctorResponse = async (complaintId) => {
  const res = await fetch(`${API_BASE}/doctor/responses/complaint/${complaintId}`, {
    headers: getAuthHeaders()
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error fetching response');
  return json.response; 
};

export const previewDoctorTranslation = async (text, targetLang) => {
  const res = await fetch(`${API_BASE}/doctor/translate-preview`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ text, targetLang })
  });
  const json = await res.json();
  return json.translatedText || '';
};

// --- Health Worker APIs ---
export const getHealthWorkerOverview = async () => {
  const res = await fetch(`${API_BASE}/health-worker/overview`);
  return res.json();
};

export const getHealthWorkerPatients = async () => {
  const res = await fetch(`${API_BASE}/health-worker/patients`);
  return res.json();
};

// --- Documents APIs ---
export const getPatientDocuments = async (patientId) => {
  const res = await fetch(`${API_BASE}/documents/patient/${patientId}`);
  return res.json();
};

export const uploadMedicalDocument = async (docData) => {
  const res = await fetch(`${API_BASE}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(docData)
  });
  return res.json();
};

// --- Facilities APIs ---
export const getHealthcareFacilities = async () => {
  const res = await fetch(`${API_BASE}/facilities`);
  return res.json();
};



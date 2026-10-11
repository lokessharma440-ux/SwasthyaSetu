// Use relative URL in development if proxy is set, or explicit localhost
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const doctor = localStorage.getItem('swasthya_doctor');
  if (doctor) {
    headers['x-doctor-id'] = JSON.parse(doctor)._id;
  }
  return headers;
};

const handleResponse = async (res) => {
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Something went wrong');
  }
  return json.data || json;
};

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

export const createComplaint = async (complaintData) => {
  const res = await fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(complaintData)
  });
  return handleResponse(res);
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

export const getDoctorComplaints = async (status = '', search = '') => {
  let url = `${API_BASE}/doctor/consultations?`;
  if (status) url += `status=${status}&`;
  if (search) url += `search=${encodeURIComponent(search)}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const markComplaintUnderReview = async (id) => {
  const res = await fetch(`${API_BASE}/doctor/consultations/${id}/start`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
};

export const createDoctorResponse = async (complaintId, responseData) => {
  const res = await fetch(`${API_BASE}/doctor/consultations/${complaintId}/resolve`, {
    method: 'PATCH',
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
  // Return the entire response field, it could be null if no response yet
  return json.response; 
};

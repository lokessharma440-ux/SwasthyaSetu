import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Welcome from '../pages/Welcome';
import PatientLayout from '../layouts/PatientLayout';
import PatientHome from '../pages/PatientHome';
import Profile from '../pages/Profile';
import Register from '../pages/Register';
import Complaint from '../pages/Complaint';
import Advice from '../pages/Advice';
import History from '../pages/History';
import HealthcareFacilities from '../pages/patient/HealthcareFacilities';
import EmergencyHelp from '../pages/patient/EmergencyHelp';
import MedicalDocuments from '../pages/patient/MedicalDocuments';
import Settings from '../pages/patient/Settings';

import DoctorLogin from '../pages/doctor/DoctorLogin';
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import ComplaintDetail from '../pages/doctor/ComplaintDetail';

import HealthWorkerDashboard from '../pages/healthWorker/HealthWorkerDashboard';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/welcome" replace />} />
      <Route path="/welcome" element={<Welcome />} />
      
      <Route path="/patient" element={<PatientLayout />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<PatientHome />} />
        <Route path="profile" element={<Profile />} />
        <Route path="register" element={<Register />} />
        <Route path="complaint" element={<Complaint />} />
        <Route path="advice" element={<Advice />} />
        <Route path="history" element={<History />} />
        <Route path="facilities" element={<HealthcareFacilities />} />
        <Route path="emergency" element={<EmergencyHelp />} />
        <Route path="documents" element={<MedicalDocuments />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="/doctor/login" element={<DoctorLogin />} />
      <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
      <Route path="/doctor/complaints/:id" element={<ComplaintDetail />} />
      
      <Route path="/health-worker" element={<HealthWorkerDashboard />} />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  );
};

export default AppRoutes;

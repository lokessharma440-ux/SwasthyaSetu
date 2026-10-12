import React, { createContext, useState, useEffect, useContext } from 'react';
import { getPatient } from '../services/api';

const PatientContext = createContext();

export const usePatient = () => useContext(PatientContext);

export const PatientProvider = ({ children }) => {
  const [patient, setPatient] = useState(() => {
    try {
      const saved = localStorage.getItem('swasthyasetu_patient');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [complaint, setComplaint] = useState(() => {
    try {
      const saved = localStorage.getItem('swasthyasetu_complaint');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoaded, setIsLoaded] = useState(true);

  // Synchronize patient data (including assigned doctor) with backend on mount
  useEffect(() => {
    if (patient && patient._id && !patient.isLocal) {
      getPatient(patient._id)
        .then(data => {
          if (data) {
            setPatient(data);
            localStorage.setItem('swasthyasetu_patient', JSON.stringify(data));
          }
        })
        .catch(err => console.warn('Could not sync patient:', err.message));
    }
  }, [patient?._id]);

  const savePatient = (data) => {
    setPatient(data);
    localStorage.setItem('swasthyasetu_patient', JSON.stringify(data));
  };

  const clearPatient = () => {
    setPatient(null);
    localStorage.removeItem('swasthyasetu_patient');
  };

  const saveComplaint = (data) => {
    setComplaint(data);
    localStorage.setItem('swasthyasetu_complaint', JSON.stringify(data));
  };

  const clearComplaint = () => {
    setComplaint(null);
    localStorage.removeItem('swasthyasetu_complaint');
  };

  return (
    <PatientContext.Provider value={{ 
      patient, savePatient, clearPatient, 
      complaint, saveComplaint, clearComplaint, 
      isLoaded 
    }}>
      {children}
    </PatientContext.Provider>
  );
};

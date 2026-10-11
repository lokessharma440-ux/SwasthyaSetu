import React, { createContext, useState, useEffect, useContext } from 'react';

const PatientContext = createContext();

export const usePatient = () => useContext(PatientContext);

export const PatientProvider = ({ children }) => {
  const [patient, setPatient] = useState(null);
  const [complaint, setComplaint] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedPatient = localStorage.getItem('swasthyasetu_patient');
    if (savedPatient) {
      try { setPatient(JSON.parse(savedPatient)); } catch (e) {}
    }
    const savedComplaint = localStorage.getItem('swasthyasetu_complaint');
    if (savedComplaint) {
      try { setComplaint(JSON.parse(savedComplaint)); } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

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

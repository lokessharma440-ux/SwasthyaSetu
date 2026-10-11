import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { PatientProvider } from './context/PatientContext';

import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <PatientProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </PatientProvider>
    </LanguageProvider>
  );
}

export default App;

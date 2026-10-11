import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginDoctor } from '../../services/api';
import { Stethoscope, LogIn, AlertCircle } from 'lucide-react';
import Button from '../../components/Button';

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [doctorId, setDoctorId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const doctor = await loginDoctor({ doctorId, password });
      localStorage.setItem('swasthya_doctor', JSON.stringify(doctor));
      navigate('/doctor/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 shadow-sm border border-blue-200">
          <Stethoscope className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Doctor Portal</h2>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to SwasthyaSetu as a registered doctor
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-blue-900/5 sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Doctor ID / Email
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                  placeholder="e.g. doc1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <Button 
                type="submit" 
                className="w-full py-3 flex justify-center items-center text-base"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" /> Sign in
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;
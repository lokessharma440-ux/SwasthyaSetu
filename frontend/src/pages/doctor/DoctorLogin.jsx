import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginDoctor } from '../../services/api';
import { Stethoscope, LogIn, AlertCircle, Sparkles, ArrowLeft, ShieldAlert } from 'lucide-react';
import Button from '../../components/Button';

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [doctorId, setDoctorId] = useState('DOC-DEMO-001');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
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

  const handleQuickDemoLogin = async () => {
    setDoctorId('DOC-DEMO-001');
    setPassword('demo123');
    setError('');
    setIsLoading(true);
    try {
      const doctor = await loginDoctor({ doctorId: 'DOC-DEMO-001', password: 'demo123' });
      localStorage.setItem('swasthya_doctor', JSON.stringify(doctor));
      navigate('/doctor/dashboard');
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <Link 
          to="/patient/home" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-white border border-emerald-100 rounded-full px-3 py-1.5 mb-6 hover:bg-emerald-50 shadow-2xs transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Patient Portal</span>
        </Link>

        <div className="mx-auto w-16 h-16 bg-blue-100/80 rounded-2xl flex items-center justify-center text-blue-600 mb-4 shadow-sm border border-blue-200">
          <Stethoscope className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">SwasthyaSetu Doctor Portal</h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Doctor consultation and patient triage
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-5 shadow-xl shadow-slate-900/5 sm:rounded-3xl sm:px-10 border border-slate-100">
          
          {/* Quick Doctor Sign In Button */}
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={isLoading}
            className="w-full mb-6 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Sign In as Dr. Demo Sharma (General Medicine)</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold">Or enter credentials</span>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 text-red-700 p-3.5 rounded-xl flex items-start gap-2.5 border border-red-100 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Doctor ID
              </label>
              <input
                type="text"
                required
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="appearance-none block w-full px-4 py-2.5 border border-slate-300 rounded-xl shadow-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all"
                placeholder="DOC-DEMO-001"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-2.5 border border-slate-300 rounded-xl shadow-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all"
                placeholder="demo123"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full py-3 flex justify-center items-center text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : (
                <>
                  <LogIn className="w-4 h-4 mr-2" /> Sign In
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;
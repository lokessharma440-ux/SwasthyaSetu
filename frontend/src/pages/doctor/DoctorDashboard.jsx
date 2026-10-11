import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctorComplaints } from '../../services/api';
import { Stethoscope, Loader2, AlertCircle, Search, Filter, Calendar, Activity, CheckCircle2, SearchIcon, Clock, ChevronRight } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '', 'READY_FOR_DOCTOR', 'UNDER_REVIEW', 'RESPONDED'

  // Auth check
  useEffect(() => {
    const docData = localStorage.getItem('swasthya_doctor');
    if (!docData) {
      navigate('/doctor/login');
    } else {
      setDoctor(JSON.parse(docData));
    }
  }, [navigate]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setIsLoading(true);
    getDoctorComplaints(statusFilter, debouncedSearch)
      .then(data => {
        setComplaints(data.data || []);
        setIsLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch complaints');
        setIsLoading(false);
      });
  }, [statusFilter, debouncedSearch]);

  const getStatusKey = (status) => {
    if (status === 'UNDER_REVIEW') return 'viewed';
    if (status === 'RESPONDED') return 'responded';
    return 'saved'; // READY_FOR_DOCTOR
  };

  const getStatusLabel = (status) => {
    if (status === 'READY_FOR_DOCTOR') return 'WAITING';
    if (status === 'UNDER_REVIEW') return 'IN CONSULTATION';
    if (status === 'RESPONDED') return 'RESOLVED';
    return status;
  };

  const handleLogout = () => {
    localStorage.removeItem('swasthya_doctor');
    navigate('/doctor/login');
  };

  // Compute stats
  const waitingCount = complaints.filter(c => c.status === 'READY_FOR_DOCTOR').length;
  const reviewCount = complaints.filter(c => c.status === 'UNDER_REVIEW').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESPONDED').length;
  const totalCount = complaints.length;

  if (!doctor) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">SwasthyaSetu <span className="font-medium text-gray-500">Doctor</span></span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-gray-900">{doctor?.name}</p>
                <p className="text-xs text-gray-500">Assigned: {doctor?.assignedVillages?.join(', ')}</p>
              </div>
              <button onClick={handleLogout} className="text-sm text-red-600 font-semibold hover:bg-red-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-red-100 transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
            <span className="text-3xl font-black text-blue-600">{waitingCount}</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">Waiting Patients</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
            <span className="text-3xl font-black text-orange-500">{reviewCount}</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">In Consultation</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
            <span className="text-3xl font-black text-green-600">{resolvedCount}</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">Resolved Today</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
            <span className="text-3xl font-black text-gray-800">{totalCount}</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">Total Consultations</span>
          </div>
        </div>

        {/* Header and Quick Filters */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Consultation Queue</h1>
            <p className="text-gray-500 mt-1">Process your patients one by one.</p>
          </div>
          
          {/* Quick Filters */}
          <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm self-start md:self-auto">
             <button 
                onClick={() => setStatusFilter('')} 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === '' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
             >
                All
             </button>
             <button 
                onClick={() => setStatusFilter('READY_FOR_DOCTOR')} 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === 'READY_FOR_DOCTOR' ? 'bg-red-50 text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
             >
                Pending
             </button>
             <button 
                onClick={() => setStatusFilter('RESPONDED')} 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === 'RESPONDED' ? 'bg-green-50 text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
             >
                Completed
             </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-shadow hover:shadow-md"
              placeholder="Search patients by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-2xl flex flex-col items-center justify-center border border-red-100 text-center">
            <AlertCircle className="w-12 h-12 mb-2 opacity-50" />
            <h3 className="font-bold text-lg">Failed to load data</h3>
            <p>{error}</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 text-center flex flex-col items-center justify-center">
             <div className="bg-gray-50 p-4 rounded-full mb-4">
                <CheckCircle2 className="w-12 h-12 text-gray-300" />
             </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">No complaints found</h3>
            <p className="text-gray-500">There are no complaints matching your current filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {complaints.map(complaint => (
              <div 
                key={complaint._id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col group"
                onClick={() => navigate(`/doctor/complaints/${complaint._id}`)}
              >
                {/* Card Header */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg">
                      {complaint.patientId?.name ? complaint.patientId.name.charAt(0) : '?'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 truncate max-w-[150px]">
                        {complaint.patientId?.name || 'Unknown'}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        {complaint.patientId?.age ? `${complaint.patientId.age}y` : ''} 
                        {complaint.patientId?.gender ? ` • ${complaint.patientId.gender}` : ''}
                      </p>
                    </div>
                  </div>
                  
                  <StatusBadge 
                    status={getStatusKey(complaint.status)} 
                    labelOverride={getStatusLabel(complaint.status)}
                  />
                </div>
                
                {/* Card Body */}
                <div className="p-5 flex-1">
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 mb-1 text-gray-500">
                      <Activity className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Chief Complaint</span>
                    </div>
                    <p className="text-gray-900 font-medium line-clamp-2">{complaint.problem}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1.5 mb-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Duration</span>
                    </div>
                    <p className="text-gray-700 text-sm line-clamp-1">{complaint.duration}</p>
                  </div>
                </div>
                
                {/* Card Footer */}
                <div className="p-4 bg-gray-50 rounded-b-2xl border-t border-gray-100 flex items-center justify-between text-xs font-medium text-gray-500 group-hover:bg-blue-50 transition-colors">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center text-blue-600 group-hover:text-blue-800 font-bold">
                    {complaint.status === 'READY_FOR_DOCTOR' ? 'Start Consultation' : complaint.status === 'UNDER_REVIEW' ? 'Continue Consultation' : 'View Summary'} <ChevronRight className="w-4 h-4 ml-0.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorDashboard;
import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  getDoctorStats,
  getDoctorComplaints,
  getDoctorPatients,
  getDoctorProfile
} from '../../services/api';
import {
  Stethoscope,
  Loader2,
  AlertCircle,
  Search,
  Calendar,
  Activity,
  CheckCircle2,
  Clock,
  ChevronRight,
  Users,
  FileText,
  UserCheck,
  ArrowUpRight,
  ShieldAlert,
  ArrowUpDown,
  ExternalLink,
  LogOut,
  MessageSquare,
  Phone,
  MapPin,
  Sparkles,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTabState] = useState(() => searchParams.get('tab') || 'requests');

  const setActiveTab = (tabId) => {
    setActiveTabState(tabId);
    setSearchParams({ tab: tabId });
  };

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTabState(tabFromUrl);
    }
  }, [searchParams]);

  const [doctor, setDoctor] = useState(null);
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters for requests queue
  const [statusFilter, setStatusFilter] = useState(''); // '' (All), 'PENDING', 'RESPONDED'
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

  // Auth check & initial doctor load
  useEffect(() => {
    let docData = localStorage.getItem('swasthya_doctor');
    if (!docData) {
      // Default to doctor profile
      const defaultDoc = {
        name: 'Dr. Demo Sharma',
        doctorId: 'DOC-DEMO-001',
        specialization: 'General Medicine',
        department: 'General Healthcare',
        isDemoDoctor: false
      };
      localStorage.setItem('swasthya_doctor', JSON.stringify(defaultDoc));
      setDoctor(defaultDoc);
    } else {
      setDoctor(JSON.parse(docData));
    }
  }, [navigate]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load tab-specific data
  const fetchData = async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setError('');
    try {
      if (activeTab === 'overview') {
        const statsData = await getDoctorStats();
        setStats(statsData);
      } else if (activeTab === 'requests') {
        const compData = await getDoctorComplaints(statusFilter, debouncedSearch, sortOrder);
        const list = Array.isArray(compData) ? compData : (compData?.data || []);
        setComplaints(list);
      } else if (activeTab === 'patients') {
        const patientsData = await getDoctorPatients();
        const list = Array.isArray(patientsData) ? patientsData : (patientsData?.data || []);
        setPatients(list);
      } else if (activeTab === 'responses') {
        const compData = await getDoctorComplaints('RESPONDED', debouncedSearch, 'newest');
        const list = Array.isArray(compData) ? compData : (compData?.data || []);
        setComplaints(list);
      } else if (activeTab === 'profile') {
        const profData = await getDoctorProfile();
        setDoctorProfile(profData);
      }
    } catch (err) {
      console.error(err);
      if (!isSilent) setError(err.message || 'Failed to load dashboard data');
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, [activeTab, statusFilter, debouncedSearch, sortOrder]);

  // Live auto-polling every 3.5 seconds for instant patient request detection
  useEffect(() => {
    const timer = setInterval(() => {
      if (activeTab === 'overview' || activeTab === 'requests') {
        fetchData(true);
      }
    }, 3500);
    return () => clearInterval(timer);
  }, [activeTab, statusFilter, debouncedSearch, sortOrder]);

  const handleLogout = () => {
    localStorage.removeItem('swasthya_doctor');
    navigate('/doctor/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Main Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-sm">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  SwasthyaSetu <span className="text-blue-600 font-semibold text-sm">Doctor Portal</span>
                </span>
                <p className="text-[11px] text-slate-400 font-medium leading-none">Rural Health Consultation Triage</p>
              </div>
            </div>

            {/* Doctor Info & Switch to Patient Portal */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-xs font-bold text-slate-800">Dr. Demo Sharma</p>
                <p className="text-[11px] text-slate-500">General Medicine • DOC-DEMO-001</p>
              </div>

              <Link
                to="/patient/home"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-3 py-1.5 rounded-xl transition-all shadow-2xs"
                title="Switch to Patient View"
              >
                <span>Patient Portal</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </Link>

              <button
                onClick={handleLogout}
                className="text-xs text-red-600 hover:text-red-700 font-bold hover:bg-red-50 p-2 rounded-xl transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Phase 3 Requirement) */}
          <div className="flex items-center justify-between border-t border-slate-100 py-2">
            <div className="flex space-x-1 sm:space-x-3 overflow-x-auto no-scrollbar">
              {[
                { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
                { id: 'requests', label: 'Patient Requests', icon: <MessageSquare className="w-4 h-4" /> },
                { id: 'patients', label: 'Patient Records', icon: <Users className="w-4 h-4" /> },
                { id: 'responses', label: 'Responses Log', icon: <FileText className="w-4 h-4" /> },
                { id: 'profile', label: 'Doctor Profile', icon: <UserCheck className="w-4 h-4" /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-2 pl-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Consultation Feed</span>
              </span>
              <button
                onClick={() => fetchData(false)}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                title="Refresh consultations"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">

        {/* ==================== TAB: OVERVIEW ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Dashboard Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-md">
              <div>
                <span className="text-xs uppercase tracking-wider text-blue-300 font-bold">Doctor Console</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">Welcome, Dr. Demo Sharma</h1>
                <p className="text-sm text-slate-300 mt-1 max-w-xl">
                  General Medicine • All assigned patient consultations and medical reviews appear here in real-time.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('requests')}
                  className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>Review Requests</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pending Consultation Alert if complaints waiting */}
            {stats?.pendingComplaints > 0 && (
              <div
                onClick={() => setActiveTab('requests')}
                className="bg-amber-500/10 border border-amber-300 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-amber-500/15 transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {stats.pendingComplaints}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-amber-950">
                      {stats.pendingComplaints} Patient Consultation {stats.pendingComplaints === 1 ? 'Request' : 'Requests'} Waiting for Review
                    </h4>
                    <p className="text-xs text-amber-800">Click to view incoming patient requests in the consultation queue</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1 shrink-0">
                  Open Queue &rarr;
                </span>
              </div>
            )}

            {/* Calculated Statistics Strip (Phase 3A - Real DB data) */}
            {isLoading && !stats ? (
              <div className="flex justify-center items-center h-48 bg-white rounded-2xl border border-slate-100">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Assigned Patients</span>
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-3xl font-black text-slate-900">{stats?.totalAssignedPatients ?? 0}</span>
                  <span className="text-[11px] text-slate-400 mt-1">Automatic backend assignment</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Complaints</span>
                    <Activity className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-3xl font-black text-slate-900">{stats?.totalComplaints ?? 0}</span>
                  <span className="text-[11px] text-slate-400 mt-1">Voice & text submissions</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Pending Review</span>
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-3xl font-black text-amber-600">{stats?.pendingComplaints ?? 0}</span>
                  <span className="text-[11px] text-slate-400 mt-1">Awaiting doctor consultation</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Responded</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-3xl font-black text-emerald-600">{stats?.respondedComplaints ?? 0}</span>
                  <span className="text-[11px] text-slate-400 mt-1">Completed consultations</span>
                </div>
              </div>
            )}

            {/* Split Grid: Recent Requests & Recent Response Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Recent Patient Requests */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">Recent Patient Requests</h3>
                    <p className="text-xs text-slate-400">Incoming complaints from assigned patients</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    View All &rarr;
                  </button>
                </div>

                {stats?.recentRequests && stats.recentRequests.length > 0 ? (
                  <div className="space-y-3 flex-1">
                    {stats.recentRequests.map(req => (
                      <div
                        key={req._id}
                        onClick={() => navigate(`/doctor/complaints/${req._id}`)}
                        className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-100 hover:border-blue-100 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div className="pr-2">
                          <p className="text-xs font-bold text-slate-800">{req.patientId?.name || 'Unknown Patient'}</p>
                          <p className="text-xs text-slate-700 font-semibold truncate max-w-xs mt-0.5">
                            {req.problemEnglish || req.problem}
                          </p>
                          {req.problemEnglish && req.problemEnglish !== req.problem && (
                            <p className="text-[10px] text-slate-400 truncate italic">
                              Original ({req.language || 'hi'}): "{req.problem}"
                            </p>
                          )}
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(req.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <StatusBadge
                          status={req.status === 'RESPONDED' ? 'responded' : req.status === 'UNDER_REVIEW' ? 'viewed' : 'saved'}
                          labelOverride={req.status === 'READY_FOR_DOCTOR' ? 'WAITING' : req.status}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <MessageSquare className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-xs font-medium">No recent requests yet</p>
                  </div>
                )}
              </div>

              {/* Recent Response Activity */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">Recent Response Activity</h3>
                    <p className="text-xs text-slate-400">Simulated demo & doctor consultations</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('responses')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    View All &rarr;
                  </button>
                </div>

                {stats?.recentResponses && stats.recentResponses.length > 0 ? (
                  <div className="space-y-3 flex-1">
                    {stats.recentResponses.map(res => (
                      <div
                        key={res._id}
                        onClick={() => navigate(`/doctor/complaints/${res.complaintId?._id || res.complaintId}`)}
                        className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 cursor-pointer transition-all"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-slate-800">{res.patientId?.name || 'Patient'}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${res.responseType === 'DOCTOR_AUTHORIZED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                            }`}>
                            {res.responseType === 'DOCTOR_AUTHORIZED' ? 'Authorized' : 'Demo Auto'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-1 italic">"{res.guidance}"</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(res.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <FileText className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-xs font-medium">No response activity yet</p>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB: PATIENT REQUESTS QUEUE ==================== */}
        {activeTab === 'requests' && (
          <div className="space-y-6">

            {/* Header, Filters & Search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Patient Consultation Queue</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Complaints submitted by assigned patients awaiting review or resolution
                </p>
              </div>

              {/* Status Filters & Sorting */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-2xs flex">
                  <button
                    onClick={() => setStatusFilter('')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === '' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                      }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter('PENDING')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'PENDING' ? 'bg-amber-500 text-white' : 'text-slate-500 hover:text-slate-900'
                      }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setStatusFilter('RESPONDED')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'RESPONDED' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-900'
                      }`}
                  >
                    Responded
                  </button>
                </div>

                {/* Sort Toggle (Phase 3B - Sort so older pending complaints can be identified) */}
                <button
                  onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                  className="px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
                  title="Toggle oldest/newest sort"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sort: {sortOrder === 'oldest' ? 'Oldest First' : 'Newest First'}</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by patient name, phone, or problem..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs transition-all"
              />
            </div>

            {/* Complaint Queue Cards */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-3xl border border-slate-100">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : complaints.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 flex flex-col items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-slate-300 mb-3" />
                <h3 className="font-bold text-slate-800 text-base">No complaints found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  There are no patient requests matching your current filter criteria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {complaints.map(comp => (
                  <div
                    key={comp._id}
                    onClick={() => navigate(`/doctor/complaints/${comp._id}`)}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      {/* Patient Details & Status */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-extrabold flex items-center justify-center text-sm border border-blue-100">
                            {comp.patientId?.name ? comp.patientId.name.charAt(0).toUpperCase() : 'P'}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{comp.patientId?.name || 'Patient'}</h4>
                            <p className="text-[11px] text-slate-500">
                              {comp.patientId?.age ? `${comp.patientId.age} yrs` : ''}
                              {comp.patientId?.gender ? ` • ${comp.patientId.gender}` : ''}
                            </p>
                          </div>
                        </div>
                        <StatusBadge
                          status={comp.status === 'RESPONDED' ? 'responded' : comp.status === 'UNDER_REVIEW' ? 'viewed' : 'saved'}
                          labelOverride={comp.status === 'READY_FOR_DOCTOR' ? 'WAITING' : comp.status}
                        />
                      </div>

                      {/* Complaint Details */}
                      <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 mb-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chief Problem (English)</span>
                          {comp.language && !comp.language.startsWith('en') && (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                              🌐 Translated from {comp.language}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-900 text-xs sm:text-sm font-extrabold mt-0.5 line-clamp-2">
                          {comp.problemEnglish || comp.problem}
                        </p>
                        {comp.problemEnglish && comp.problemEnglish !== comp.problem && (
                          <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded-xl border border-slate-100 line-clamp-1">
                            <span className="font-semibold text-slate-400 not-italic">Patient's words:</span> "{comp.problem}"
                          </p>
                        )}
                        {comp.duration && (
                          <p className="text-[11px] text-slate-500">
                            <strong>Duration:</strong> {comp.durationEnglish || comp.duration}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(comp.createdAt).toLocaleDateString()}
                      </span>
                      <span className="font-bold text-blue-600 group-hover:text-blue-800 flex items-center gap-0.5">
                        {comp.status === 'RESPONDED' ? 'View Details' : 'Start Review'} &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ==================== TAB: PATIENT RECORDS ==================== */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Assigned Patient Records</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Patients under Dr. Demo Sharma's direct clinical care
                </p>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
                Total Patients: {patients.length}
              </span>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-3xl border border-slate-100">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : patients.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 text-base">No assigned patients found</h3>
                <p className="text-xs text-slate-500 mt-1">Newly registered patients will automatically appear here.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                      <tr>
                        <th className="px-6 py-4">Patient Name</th>
                        <th className="px-4 py-4">Age / Gender</th>
                        <th className="px-4 py-4">Location</th>
                        <th className="px-4 py-4">Contact</th>
                        <th className="px-4 py-4">Complaints</th>
                        <th className="px-4 py-4">Last Activity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {patients.map(p => (
                        <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">
                            {p.name}
                          </td>
                          <td className="px-4 py-4">
                            {p.age} yrs • {p.gender}
                          </td>
                          <td className="px-4 py-4 flex items-center gap-1 text-slate-600">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {p.location}
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            {p.phone || 'N/A'}
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                              {p.complaintCount} requests
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs text-slate-500">
                            {p.lastComplaintDate ? new Date(p.lastComplaintDate).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: RESPONSES LOG ==================== */}
        {activeTab === 'responses' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Consultation Responses Log</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Audit history of doctor consultations and clinical guidance notes
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-3xl border border-slate-100">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : complaints.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 text-base">No completed responses yet</h3>
                <p className="text-xs text-slate-500 mt-1">Responses submitted by the doctor will be recorded here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.map(c => (
                  <div
                    key={c._id}
                    onClick={() => navigate(`/doctor/complaints/${c._id}`)}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-200 cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-sm">{c.patientId?.name || 'Patient'}</span>
                        <span className="text-xs text-slate-400">• {new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700">Problem: {c.problem}</p>
                      {c.doctorResponse && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic bg-slate-50 p-2 rounded-xl">
                          Advice: "{c.doctorResponse}"
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        Open Review &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: DOCTOR PROFILE ==================== */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Profile Information Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 font-black text-2xl flex items-center justify-center border border-blue-200">
                  <Stethoscope className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Dr. Demo Sharma</h2>
                  <p className="text-sm font-semibold text-blue-600">DOC-DEMO-001</p>
                  <span className="inline-block mt-1 text-[11px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-100">
                    Primary Care Physician
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Specialization</span>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">General Medicine</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Department</span>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">General Healthcare</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Availability</span>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">Active / On-Duty</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Consultation Mode</span>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">Live Clinical Consultation & Triage</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500 leading-relaxed">
                <strong>Assigned Coverage:</strong> Lucknow, Sitapur, Rampur, and regional health sub-centres. Connected to Primary Health Centre (PHC) catchment areas.
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default DoctorDashboard;
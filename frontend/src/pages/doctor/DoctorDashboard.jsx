import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  getDoctorStats, 
  getDoctorComplaints, 
  getDoctorPatients
} from '../../services/api';
import { 
  Activity, 
  Users, 
  FileText, 
  Stethoscope, 
  LogOut, 
  Sparkles,
  ClipboardList
} from 'lucide-react';
import DoctorOverviewTab from './tabs/DoctorOverviewTab';
import DoctorRequestsTab from './tabs/DoctorRequestsTab';
import DoctorPatientsTab from './tabs/DoctorPatientsTab';
import DoctorResponsesTab from './tabs/DoctorResponsesTab';
import DoctorProfileTab from './tabs/DoctorProfileTab';

const DoctorDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Active Tab state
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTabState] = useState(tabParam || 'overview');

  // Overview stats state
  const [stats, setStats] = useState(null);
  
  // Complaints list & filters state
  const [complaints, setComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

  // Patients list state
  const [patients, setPatients] = useState([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTabState(tabParam);
    }
  }, [tabParam]);

  // Initial load: Fetch overview statistics immediately
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch data depending on active tab
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats();
    } else if (activeTab === 'requests') {
      fetchComplaints();
    } else if (activeTab === 'patients') {
      fetchPatients();
    } else if (activeTab === 'responses') {
      fetchComplaints('RESPONDED');
    }
  }, [activeTab, statusFilter, sortOrder]);

  // Debounced search for complaints
  useEffect(() => {
    const handler = setTimeout(() => {
      if (activeTab === 'overview' || activeTab === 'requests') {
        fetchComplaints();
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const data = await getDoctorStats();
      setStats(data);
    } catch (err) {
      console.warn('Could not fetch doctor stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComplaints = async (forceStatus = null) => {
    try {
      setIsLoading(true);
      const effectiveStatus = forceStatus || statusFilter;
      const data = await getDoctorComplaints(effectiveStatus, searchTerm, sortOrder);
      setComplaints(data);
    } catch (err) {
      console.warn('Could not fetch complaints queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const data = await getDoctorPatients();
      setPatients(data);
    } catch (err) {
      console.warn('Could not fetch patient list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('swasthya_doctor');
    navigate('/doctor/login');
  };

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'requests', label: 'Triage Queue', icon: ClipboardList, badge: stats?.pendingComplaints },
    { id: 'patients', label: 'My Patients', icon: Users, badge: stats?.totalAssignedPatients },
    { id: 'responses', label: 'Consultations Log', icon: FileText },
    { id: 'profile', label: 'Doctor Profile', icon: Stethoscope },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Banner / Prototype Environment Notice */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="truncate">
            <strong>Demonstration Doctor Workspace:</strong> Logged in as Dr. Demo Sharma (DOC-DEMO-001) • General Medicine.
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      {/* Main Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo / Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-slate-900 block leading-tight">
                  SwasthyaSetu <span className="text-blue-600 font-extrabold text-xs uppercase px-1.5 py-0.5 rounded-md bg-blue-50 border border-blue-100">Doctor</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium block">
                  Tele-triage & Clinical Review Portal
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <div className="hidden md:flex items-center gap-1">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                    {tab.badge > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex overflow-x-auto px-4 py-2 border-t border-slate-100 gap-2 no-scrollbar bg-white">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                    isActive ? 'bg-white text-blue-600' : 'bg-slate-300 text-slate-800'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {activeTab === 'overview' && (
          <DoctorOverviewTab
            stats={stats}
            isLoading={isLoading}
            setActiveTab={setActiveTab}
            navigate={navigate}
          />
        )}

        {activeTab === 'requests' && (
          <DoctorRequestsTab
            complaints={complaints}
            isLoading={isLoading}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            navigate={navigate}
          />
        )}

        {activeTab === 'patients' && (
          <DoctorPatientsTab
            patients={patients}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'responses' && (
          <DoctorResponsesTab
            complaints={complaints}
            isLoading={isLoading}
            navigate={navigate}
          />
        )}

        {activeTab === 'profile' && (
          <DoctorProfileTab />
        )}
      </main>
    </div>
  );
};

export default DoctorDashboard;

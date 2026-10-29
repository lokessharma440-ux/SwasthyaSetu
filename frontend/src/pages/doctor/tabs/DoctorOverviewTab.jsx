import React from 'react';
import { 
  Users, 
  Activity, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  MessageSquare, 
  FileText, 
  Loader2 
} from 'lucide-react';
import StatusBadge from '../../../components/StatusBadge';

export const DoctorOverviewTab = ({
  stats,
  isLoading,
  setActiveTab,
  navigate
}) => {
  return (
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
            className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
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

      {/* Calculated Statistics Strip */}
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
              className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
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
              className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
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
  );
};

export default DoctorOverviewTab;


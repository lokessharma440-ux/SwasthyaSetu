import React from 'react';
import { 
  ArrowUpDown, 
  Search, 
  Loader2, 
  CheckCircle2, 
  Calendar 
} from 'lucide-react';
import StatusBadge from '../../../components/StatusBadge';

export const DoctorRequestsTab = ({
  complaints,
  isLoading,
  statusFilter,
  setStatusFilter,
  sortOrder,
  setSortOrder,
  searchTerm,
  setSearchTerm,
  navigate
}) => {
  return (
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === '' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'PENDING' ? 'bg-amber-500 text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('RESPONDED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'RESPONDED' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              Responded
            </button>
          </div>

          {/* Sort Toggle */}
          <button
            onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
            className="px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
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
  );
};

export default DoctorRequestsTab;


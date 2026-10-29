import React from 'react';
import { Loader2, Users, MapPin } from 'lucide-react';

export const DoctorPatientsTab = ({
  patients,
  isLoading
}) => {
  return (
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
  );
};

export default DoctorPatientsTab;


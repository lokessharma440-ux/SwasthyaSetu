import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertCircle, Clock, CheckCircle2, ChevronRight, Activity, Loader2 } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { getHealthWorkerOverview, getHealthWorkerPatients } from '../../services/api';

const HealthWorkerDashboard = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, patientsRes] = await Promise.all([
          getHealthWorkerOverview(),
          getHealthWorkerPatients()
        ]);
        
        if (overviewRes.success) setOverview(overviewRes.data);
        if (patientsRes.success) setPatients(patientsRes.data);
      } catch (err) {
        console.error('Error fetching health worker data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const getStatusKey = (status) => {
    if (status === 'UNDER_REVIEW') return 'viewed';
    if (status === 'RESPONDED') return 'responded';
    return 'saved';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <header className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Health Worker Dashboard</h1>
        <p className="text-gray-500 mt-2">आशा कार्यकर्ता / स्वास्थ्य मित्र</p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600"><Users className="w-6 h-6" /></div>
          <div><p className="text-gray-500 text-sm">Total Patients</p><h2 className="text-2xl font-bold text-gray-900">{overview?.totalPatients || 0}</h2></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-orange-100 p-4 rounded-full text-orange-600"><AlertCircle className="w-6 h-6" /></div>
          <div><p className="text-gray-500 text-sm">Pending</p><h2 className="text-2xl font-bold text-gray-900">{overview?.pendingComplaints || 0}</h2></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-full text-green-600"><CheckCircle2 className="w-6 h-6" /></div>
          <div><p className="text-gray-500 text-sm">Responded</p><h2 className="text-2xl font-bold text-gray-900">{overview?.respondedComplaints || 0}</h2></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-yellow-100 p-4 rounded-full text-yellow-600"><Clock className="w-6 h-6" /></div>
          <div><p className="text-gray-500 text-sm">Follow-ups Due</p><h2 className="text-2xl font-bold text-gray-900">{overview?.followUpsDue || 0}</h2></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Patients Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4 font-semibold">Patient Name</th>
                <th className="p-4 font-semibold">Location</th>
                <th className="p-4 font-semibold">Latest Complaint</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Follow-up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No patients found.</td>
                </tr>
              ) : (
                patients.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{p.name}<span className="block text-gray-500 text-xs">{p.phone}</span></td>
                    <td className="p-4 text-gray-600">{p.location || 'Unknown'}</td>
                    <td className="p-4 text-gray-600 max-w-xs truncate">
                      {p.latestComplaint ? p.latestComplaint.problem : '-'}
                    </td>
                    <td className="p-4">
                      {p.latestComplaint ? (
                        <StatusBadge status={getStatusKey(p.latestComplaint.status)} />
                      ) : '-'}
                    </td>
                    <td className="p-4">
                      {p.nextFollowUp && p.nextFollowUp.date ? (
                        <span className="text-yellow-700 bg-yellow-100 px-2 py-1 rounded text-xs font-semibold">
                          {new Date(p.nextFollowUp.date).toLocaleDateString('hi-IN')}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HealthWorkerDashboard;
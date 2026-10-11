import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, Plus, Loader2, X } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../../components/Button';

const MedicalDocuments = () => {
  const navigate = useNavigate();
  const { patient, isLoaded } = usePatient();
  const { t } = useLanguage();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('prescription');
  
  const fetchDocuments = async () => {
    if (!patient || patient.isLocal) {
      setIsLoading(false);
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:5000/api/documents/patient/${patient._id}`);
      const data = await res.json();
      if (data.success) {
        setDocuments(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      fetchDocuments();
    }
  }, [isLoaded, patient]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !patient || patient.isLocal) return;

    setUploading(true);
    
    // Simulate file upload (Since it's Phase 8 foundation without real S3/storage yet)
    const mockStoragePath = `/mock-storage/${Date.now()}-${file.name}`;
    
    try {
      const res = await fetch('http://localhost:5000/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient._id,
          fileName: file.name,
          fileType: file.type || 'application/pdf',
          fileSize: file.size,
          storagePath: mockStoragePath,
          documentType: docType
        })
      });
      
      if (res.ok) {
        setShowUploadModal(false);
        setFile(null);
        fetchDocuments();
      }
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const getDocIcon = (type) => {
    return <FileText className="w-8 h-8 text-blue-500" />;
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto pb-4 relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/patient/history')}
            className="p-2 bg-white rounded-full shadow-sm text-neutral-text hover:bg-gray-50"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-neutral-text">{t('documents')}</h2>
        </div>
        <button 
           onClick={() => setShowUploadModal(true)}
           className="bg-blue-100 text-blue-700 p-2 rounded-full hover:bg-blue-200"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        {(!patient || patient.isLocal) ? (
          <div className="bg-orange-50 p-6 rounded-2xl text-center border border-orange-100">
            <p className="text-orange-800 font-medium">Please complete profile first.</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center shadow-sm flex flex-col items-center justify-center h-64">
             <div className="bg-gray-50 p-4 rounded-full mb-4">
                <FileText className="w-10 h-10 text-gray-300" />
             </div>
             <p className="text-neutral-muted mb-4">No documents found.</p>
             <Button onClick={() => setShowUploadModal(true)} variant="outline" className="flex items-center gap-2">
               <Upload className="w-4 h-4" /> Upload Document
             </Button>
          </div>
        ) : (
          documents.map(doc => (
            <div key={doc._id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-xl">
                {getDocIcon(doc.documentType)}
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-bold text-neutral-text truncate">{doc.fileName}</h3>
                <p className="text-xs text-neutral-muted mt-1">
                  {new Date(doc.uploadDate).toLocaleDateString()} • {doc.documentType}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Add Document</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Document Type</label>
                <select 
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                >
                  <option value="prescription">Prescription</option>
                  <option value="lab_report">Lab Report</option>
                  <option value="scan">Scan (X-Ray/MRI)</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Choose File</label>
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1 justify-center" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1 justify-center" disabled={!file || uploading}>
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalDocuments;
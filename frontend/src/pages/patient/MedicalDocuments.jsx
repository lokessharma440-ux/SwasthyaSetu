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
    <div className="flex flex-col h-full w-full pb-4 relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/patient/history')}
            className="p-2.5 bg-white rounded-2xl shadow-sm text-slate-700 hover:bg-slate-50 border border-slate-100 active:scale-95 transition-all"
            aria-label={t('back')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">{t('documents')}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{t('documents_subtitle')}</p>
          </div>
        </div>
        <button 
           onClick={() => setShowUploadModal(true)}
           className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 p-3 rounded-2xl flex items-center gap-2 font-bold text-sm border border-emerald-200/60 active:scale-95 transition-all shadow-xs"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">{t('add_document')}</span>
        </button>
      </div>

      <div>
        {(!patient || patient.isLocal) ? (
          <div className="bg-orange-50 p-6 rounded-3xl text-center border border-orange-100 max-w-md mx-auto">
            <p className="text-orange-800 font-medium">{t('please_complete_profile')}</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border border-slate-100 text-center shadow-sm flex flex-col items-center justify-center h-72 max-w-lg mx-auto">
             <div className="bg-slate-50 p-4 rounded-2xl mb-4 text-slate-300">
                <FileText className="w-12 h-12" />
             </div>
             <p className="text-slate-500 font-medium mb-4">{t('no_documents')}</p>
             <Button onClick={() => setShowUploadModal(true)} variant="outline" className="flex items-center gap-2">
               <Upload className="w-4 h-4" /> {t('upload_document')}
             </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map(doc => (
              <div key={doc._id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all duration-200">
                <div className="bg-emerald-50 p-3.5 rounded-2xl text-emerald-600 shrink-0">
                  {getDocIcon(doc.documentType)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-bold text-slate-800 truncate text-base">{doc.fileName}</h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    {new Date(doc.uploadDate).toLocaleDateString()} • {t(doc.documentType) || doc.documentType}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{t('add_document')}</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('document_type')}</label>
                <select 
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                >
                  <option value="prescription">{t('prescription')}</option>
                  <option value="lab_report">{t('lab_report')}</option>
                  <option value="scan">{t('scan')}</option>
                  <option value="other">{t('other_doc')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('choose_file')}</label>
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1 justify-center" onClick={() => setShowUploadModal(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" variant="primary" className="flex-1 justify-center" disabled={!file || uploading}>
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('upload_btn')}
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
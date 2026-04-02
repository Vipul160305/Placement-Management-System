import { useState, useRef } from 'react';
import { Briefcase, Clock, CheckCircle, FileText, UploadCloud, Loader2, FileCheck } from 'lucide-react';
import { uploadStudentResume } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const StudentDashboard = () => {
  const [resume, setResume] = useState(null); // { name, date }
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      addToast('Please upload a PDF file only', 'error');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await uploadStudentResume(formData);
      
      setResume({ name: response.filename, date: new Date(response.uploadDate).toLocaleDateString() });
      addToast(response.message, 'success');
    } catch (error) {
      addToast('Failed to upload resume', 'error');
    } finally {
      setUploading(false);
      e.target.value = ''; // clear input
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-manrope font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-500 mt-1">Track your placement journey and upcoming drives.</p>
        </div>
      </div>

      {/* Profile & Resume Upload Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-l-primary">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900">Profile Completeness: {resume ? '100%' : '85%'}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {resume 
              ? 'Your profile is fully complete and ready for applications.' 
              : 'Upload your resume to reach 100% and improve your chances.'}
          </p>
        </div>
        
        <div className="shrink-0 flex items-center">
          <input 
            type="file" 
            accept=".pdf" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={uploading}
          />
          
          {uploading ? (
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-500 bg-gray-50 font-medium">
              <Loader2 size={18} className="animate-spin text-primary" />
              <span>Uploading...</span>
            </div>
          ) : resume ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600">
                  <FileCheck size={16} /> {resume.name}
                </span>
                <span className="text-xs text-gray-400">Uploaded {resume.date}</span>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-300 transition"
              >
                Update
              </button>
            </div>
          ) : (
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="btn-primary flex items-center gap-2 px-6 py-2.5 whitespace-nowrap"
            >
              <UploadCloud size={20} />
              <span>Upload Resume (PDF)</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Applied Drives</h3>
            <Briefcase size={20} className="text-primary" />
          </div>
          <div className="text-3xl font-bold text-gray-900">4</div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">In Progress</h3>
            <Clock size={20} className="text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">2</div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Offers Received</h3>
            <CheckCircle size={20} className="text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">0</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Upcoming Drives</h2>
          <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            No upcoming drives match your eligibility.
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Recent Applications</h2>
          <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            You haven't applied to any drives yet.
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

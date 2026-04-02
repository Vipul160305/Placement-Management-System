import React from 'react';
import { Briefcase, Clock, CheckCircle } from 'lucide-react';

const StudentDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-manrope font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-500 mt-1">Track your placement journey and upcoming drives.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-l-4 border-l-primary">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Profile Completeness: 85%</h2>
          <p className="text-sm text-gray-500 mt-1">Update your resume to reach 100% and improve your chances.</p>
        </div>
        <button className="btn-primary whitespace-nowrap">Complete Profile</button>
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

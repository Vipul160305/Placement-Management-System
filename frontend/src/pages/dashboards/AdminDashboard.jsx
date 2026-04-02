import React from 'react';
import { ShieldCheck, UserPlus, Activity } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-manrope font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">System overview and user management.</p>
        </div>
        <button className="btn-primary">Add New User</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg"><UserPlus size={24} /></div>
            <div>
              <div className="text-sm text-gray-500 font-medium">Total Users</div>
              <div className="text-2xl font-bold text-gray-900">2,450</div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Activity size={24} /></div>
            <div>
              <div className="text-sm text-gray-500 font-medium">System Status</div>
              <div className="text-2xl font-bold text-gray-900">Online</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><ShieldCheck size={24} /></div>
            <div>
              <div className="text-sm text-gray-500 font-medium">Active Roles</div>
              <div className="text-2xl font-bold text-gray-900">4</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-lg font-bold mb-4">Recent Activity Logs</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3 rounded-r-lg">Time</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-3 font-medium text-gray-900">Admin</td>
                <td className="px-4 py-3">Logged in</td>
                <td className="px-4 py-3">Just now</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

import React from 'react';
import { Briefcase, TrendingUp, Users } from 'lucide-react';

const TPODashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-manrope font-bold text-gray-900">Placement Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of drives and placement stats.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Briefcase size={18} />
          Create New Drive
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Active Drives</h3>
            <Briefcase size={20} className="text-primary" />
          </div>
          <div className="text-3xl font-bold text-gray-900">12</div>
          <p className="text-sm text-green-600 mt-2">↑ 2 from last month</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Total Placed</h3>
            <Users size={20} className="text-primary" />
          </div>
          <div className="text-3xl font-bold text-gray-900">450</div>
          <p className="text-sm text-green-600 mt-2">78% placement rate</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Average Package</h3>
            <TrendingUp size={20} className="text-primary" />
          </div>
          <div className="text-3xl font-bold text-gray-900">8.5 LPA</div>
          <p className="text-sm text-gray-500 mt-2">Highest: 42 LPA</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-bold mb-4">Ongoing Drives</h2>
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          No drives are currently accepting applications.
        </div>
      </div>
    </div>
  );
};

export default TPODashboard;

import { Users, FileText, CheckCircle } from "lucide-react";

const CoordinatorDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-manrope font-bold text-gray-900">Coordinator Hub</h1>
          <p className="text-gray-500 mt-1">Manage your assigned sections and students.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">My Sections</h3>
            <Users size={20} className="text-primary" />
          </div>
          <div className="text-3xl font-bold text-gray-900">2</div>
          <p className="text-sm text-gray-500 mt-2">CSE-A, CSE-B</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Total Students</h3>
            <FileText size={20} className="text-primary" />
          </div>
          <div className="text-3xl font-bold text-gray-900">120</div>
          <p className="text-sm text-gray-500 mt-2">Across all sections</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Verified Profiles</h3>
            <CheckCircle size={20} className="text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">115</div>
          <p className="text-sm text-green-600 mt-2">5 pending verification</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-bold mb-4">Recent Student Activity</h2>
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          No recent activity in your sections.
        </div>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;

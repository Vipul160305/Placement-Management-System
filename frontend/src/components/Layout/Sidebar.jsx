import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Briefcase, FileText, LogOut, ClipboardList, ShieldCheck } from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => 
      `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
        isActive 
          ? 'bg-primary text-white' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`
    }
  >
    <Icon size={18} />
    <span>{label}</span>
  </NavLink>
);

const Sidebar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const renderLinks = () => {
    switch (user.role) {
      case 'admin':
        return (
          <>
            <SidebarLink to="/admin" icon={ShieldCheck} label="System Overview" />
            <SidebarLink to="/admin/users" icon={Users} label="Users" />
            <SidebarLink to="/admin/logs" icon={ClipboardList} label="Audit Logs" />
          </>
        );
      case 'tpo':
        return (
          <>
            <SidebarLink to="/tpo" icon={LayoutDashboard} label="Dashboard" />
            <SidebarLink to="/tpo/create" icon={Briefcase} label="Placement Drives" />
            <SidebarLink to="/tpo/stats" icon={FileText} label="Analytics" />
          </>
        );
      case 'coordinator':
        return (
          <>
            <SidebarLink to="/coordinator" icon={LayoutDashboard} label="Overview" />
            <SidebarLink to="/coordinator/sections" icon={Users} label="My Sections" />
          </>
        );
      case 'student':
        return (
          <>
            <SidebarLink to="/student" icon={LayoutDashboard} label="Dashboard" />
            <SidebarLink to="/student/drives" icon={Briefcase} label="Job Openings" />
            <SidebarLink to="/student/apps" icon={FileText} label="Applications" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h2 className="text-lg font-manrope font-bold text-primary">ScholarFlow</h2>
      </div>

      <div className="flex-1 py-4 px-3 space-y-1">
        {renderLinks()}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50/50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
            {user.name[0]}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

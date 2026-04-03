import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  LogOut,
  ClipboardList,
  BarChart2,
  Building2,
  X,
} from "lucide-react";

const SidebarLink = ({
  to,
  icon: Icon,
  label,
  onClick,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
        isActive
          ? "bg-primary text-white"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`
    }
  >
    <Icon size={18} />
    <span>{label}</span>
  </NavLink>
);

const Sidebar = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const closeSidebar = () => setIsOpen(false);

  const renderLinks = () => {
    switch (user.role) {
      case "tpo":
        return (
          <>
            <SidebarLink to="/tpo" icon={LayoutDashboard} label="Dashboard" onClick={closeSidebar} />
            <SidebarLink to="/tpo/create" icon={Briefcase} label="Placement Drives" onClick={closeSidebar} />
            <SidebarLink to="/tpo/companies" icon={Building2} label="Companies" onClick={closeSidebar} />
            <SidebarLink to="/tpo/applications" icon={ClipboardList} label="Applications" onClick={closeSidebar} />
            <SidebarLink to="/tpo/stats" icon={BarChart2} label="Analytics" onClick={closeSidebar} />
            <SidebarLink to="/tpo/users" icon={Users} label="Users" onClick={closeSidebar} />
          </>
        );
      case "hr":
        return (
          <>
            <SidebarLink to="/hr" icon={LayoutDashboard} label="Dashboard" onClick={closeSidebar} />
            <SidebarLink to="/hr/applications" icon={ClipboardList} label="Applications" onClick={closeSidebar} />
          </>
        );
      case "student":
        return (
          <>
            <SidebarLink to="/student" icon={LayoutDashboard} label="Dashboard" onClick={closeSidebar} />
            <SidebarLink to="/student/drives" icon={Briefcase} label="Job Openings" onClick={closeSidebar} />
            <SidebarLink to="/student/apps" icon={FileText} label="Applications" onClick={closeSidebar} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 h-screen flex flex-col shrink-0 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 shrink-0">
        <h2 className="text-lg font-manrope font-bold text-primary">ScholarFlow</h2>
        <button className="lg:hidden p-1 text-gray-400 hover:bg-gray-100 rounded-md" onClick={closeSidebar}>
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">{renderLinks()}</div>

      <div className="p-4 border-t border-gray-200 bg-gray-50/50 shrink-0">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
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

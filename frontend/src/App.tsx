import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import type { Role } from "./types/auth";
import Login from "./pages/Login";
import DashboardLayout from "./components/Layout/DashboardLayout";

// Dashboards
import TPODashboard from "./pages/dashboards/TPODashboard";
import StudentDashboard from "./pages/dashboards/StudentDashboard";

// TPO Pages
import UsersManagement from "./pages/admin/UsersManagement";
import CompaniesPage from "./pages/tpo/CompaniesPage";
import DrivesPage from "./pages/tpo/DrivesPage";
import Analytics from "./pages/tpo/Analytics";
import ApplicationsPage from "./pages/tpo/ApplicationsPage";
import ProfileRequests from "./pages/tpo/ProfileRequests";

// HR Pages
import HRDashboard from "./pages/hr/HRDashboard";

// Student Pages
import DriveList from "./pages/student/DriveList";
import MyApplications from "./pages/student/MyApplications";
import StudentProfile from "./pages/student/StudentProfile";

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: Role[];
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-primary font-medium">
        Loading…
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role))
    return <Navigate to="/" replace />;
  return <>{children}</>;
};

const DashboardRouter = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-primary font-medium">
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case "tpo":
      return <Navigate to="/tpo" replace />;
    case "hr":
      return <Navigate to="/hr" replace />;
    case "student":
      return <Navigate to="/student" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const PR = ({ roles, children }: { roles: Role[]; children: ReactNode }) => (
  <ProtectedRoute allowedRoles={roles}>{children}</ProtectedRoute>
);

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<DashboardRouter />} />

      <Route element={<DashboardLayout />}>
        {/* TPO — full access */}
        <Route path="/tpo" element={<PR roles={["tpo"]}><TPODashboard /></PR>} />
        <Route path="/tpo/create" element={<PR roles={["tpo"]}><DrivesPage /></PR>} />
        <Route path="/tpo/companies" element={<PR roles={["tpo"]}><CompaniesPage /></PR>} />
        <Route path="/tpo/applications" element={<PR roles={["tpo"]}><ApplicationsPage /></PR>} />
        <Route path="/tpo/stats" element={<PR roles={["tpo"]}><Analytics /></PR>} />
        <Route path="/tpo/users" element={<PR roles={["tpo"]}><UsersManagement /></PR>} />
        <Route path="/tpo/profile-requests" element={<PR roles={["tpo"]}><ProfileRequests /></PR>} />

        {/* Legacy admin routes — redirect to tpo equivalents */}
        <Route path="/admin" element={<Navigate to="/tpo" replace />} />
        <Route path="/admin/users" element={<Navigate to="/tpo/users" replace />} />
        <Route path="/admin/logs" element={<Navigate to="/tpo" replace />} />

        {/* Coordinator legacy redirects */}
        <Route path="/coordinator" element={<PR roles={["hr"]}><HRDashboard /></PR>} />
        <Route path="/coordinator/sections" element={<PR roles={["hr"]}><HRDashboard /></PR>} />
        <Route path="/coordinator/applications" element={<PR roles={["hr"]}><ApplicationsPage /></PR>} />

        {/* HR */}
        <Route path="/hr" element={<PR roles={["hr"]}><HRDashboard /></PR>} />
        <Route path="/hr/applications" element={<PR roles={["hr"]}><ApplicationsPage /></PR>} />

        {/* Student */}
        <Route path="/student" element={<PR roles={["student"]}><StudentDashboard /></PR>} />
        <Route path="/student/drives" element={<PR roles={["student"]}><DriveList /></PR>} />
        <Route path="/student/apps" element={<PR roles={["student"]}><MyApplications /></PR>} />
        <Route path="/student/profile" element={<PR roles={["student"]}><StudentProfile /></PR>} />
      </Route>
    </Routes>
  </Router>
);

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;

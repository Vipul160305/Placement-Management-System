import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Login from './pages/Login';
import DashboardLayout from './components/Layout/DashboardLayout';

// Dashboards
import AdminDashboard from './pages/dashboards/AdminDashboard';
import TPODashboard from './pages/dashboards/TPODashboard';
import CoordinatorDashboard from './pages/dashboards/CoordinatorDashboard';
import StudentDashboard from './pages/dashboards/StudentDashboard';

// Admin Pages
import UsersManagement from './pages/admin/UsersManagement';

// TPO Pages
import CompaniesPage from './pages/tpo/CompaniesPage';
import DrivesPage from './pages/tpo/DrivesPage';
import Analytics from './pages/tpo/Analytics';

// Coordinator Pages
import SectionAssignment from './pages/coordinator/SectionAssignment';

// Student Pages
import DriveList from './pages/student/DriveList';
import MyApplications from './pages/student/MyApplications';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-primary font-medium">
        Loading…
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
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
    case 'admin':       return <Navigate to="/admin" replace />;
    case 'tpo':         return <Navigate to="/tpo" replace />;
    case 'coordinator': return <Navigate to="/coordinator" replace />;
    case 'student':     return <Navigate to="/student" replace />;
    default:            return <Navigate to="/login" replace />;
  }
};

const PR = ({ roles, children }) => <ProtectedRoute allowedRoles={roles}>{children}</ProtectedRoute>;

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<DashboardRouter />} />

      <Route element={<DashboardLayout />}>
        {/* Admin */}
        <Route path="/admin"       element={<PR roles={['admin']}><AdminDashboard /></PR>} />
        <Route path="/admin/users" element={<PR roles={['admin']}><UsersManagement /></PR>} />

        {/* TPO */}
        <Route path="/tpo"           element={<PR roles={['tpo']}><TPODashboard /></PR>} />
        <Route path="/tpo/create"    element={<PR roles={['tpo']}><DrivesPage /></PR>} />
        <Route path="/tpo/companies" element={<PR roles={['tpo']}><CompaniesPage /></PR>} />
        <Route path="/tpo/stats"     element={<PR roles={['tpo']}><Analytics /></PR>} />

        {/* Coordinator */}
        <Route path="/coordinator"          element={<PR roles={['coordinator']}><CoordinatorDashboard /></PR>} />
        <Route path="/coordinator/sections" element={<PR roles={['coordinator']}><SectionAssignment /></PR>} />

        {/* Student */}
        <Route path="/student"       element={<PR roles={['student']}><StudentDashboard /></PR>} />
        <Route path="/student/drives" element={<PR roles={['student']}><DriveList /></PR>} />
        <Route path="/student/apps"  element={<PR roles={['student']}><MyApplications /></PR>} />
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

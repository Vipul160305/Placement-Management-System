import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { ShieldCheck, User, Users, Briefcase, GraduationCap, ArrowRight } from 'lucide-react';

const roles = [
  {
    role: 'admin',
    label: 'Administrator',
    description: 'System config & user management',
    icon: ShieldCheck,
    accent: '#003466',
    lightBg: '#e8eef7',
  },
  {
    role: 'tpo',
    label: 'Placement Officer',
    description: 'Manage drives & analytics',
    icon: Briefcase,
    accent: '#006970',
    lightBg: '#e5f4f5',
  },
  {
    role: 'coordinator',
    label: 'Coordinator',
    description: 'Sectional assignments & tracking',
    icon: Users,
    accent: '#5c5490',
    lightBg: '#eeecf8',
  },
  {
    role: 'student',
    label: 'Student',
    description: 'Track applications & drives',
    icon: User,
    accent: '#7a4f00',
    lightBg: '#f7f0e5',
  },
];

const RoleCard = ({ role, label, description, icon: Icon, accent, lightBg, onClick }) => (
  <button
    onClick={onClick}
    className="group w-full text-left rounded-xl border border-gray-100 bg-white hover:border-transparent hover:shadow-lg transition-all duration-250 p-4 flex items-center gap-4 relative overflow-hidden"
    style={{ '--accent': accent }}
  >
    {/* hover highlight bar */}
    <span
      className="absolute left-0 top-0 h-full w-1 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      style={{ background: accent }}
    />

    <div
      className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-200"
      style={{ backgroundColor: lightBg, color: accent }}
    >
      <Icon size={20} />
    </div>

    <div className="flex-1 min-w-0">
      <p className="font-manrope font-semibold text-[15px] text-gray-900 leading-tight">{label}</p>
      <p className="text-xs text-gray-500 mt-0.5 truncate">{description}</p>
    </div>

    <ArrowRight
      size={16}
      className="shrink-0 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all duration-200"
    />
  </button>
);

const Login = () => {
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex bg-white">
      {/* ── Left brand panel ── */}
      <div
        className="hidden lg:flex lg:w-[44%] xl:w-[42%] flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #002a52 0%, #003466 55%, #004080 100%)' }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-10 -left-16 w-56 h-56 rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #8df2fc 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="font-manrope font-bold text-white text-lg tracking-tight">ScholarFlow</span>
        </div>

        {/* Middle content */}
        <div className="relative z-10 space-y-6">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-5"
              style={{ background: 'rgba(141,242,252,0.15)', color: '#8df2fc' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#8df2fc] animate-pulse" />
              Placement Management System
            </div>
            <h1 className="text-3xl xl:text-4xl font-manrope font-bold text-white leading-snug">
              Connecting <br />
              talent with <br />
              <span style={{ color: '#8df2fc' }}>opportunity.</span>
            </h1>
          </div>

          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            A unified platform for placement drives, student tracking, and campus recruitment — built for modern colleges.
          </p>

          {/* Stats row */}
          <div className="flex gap-6">
            {[
              { value: '4+', label: 'Roles' },
              { value: '100%', label: 'Role-Based' },
              { value: '∞', label: 'Scalable' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-white font-manrope font-bold text-xl">{value}</p>
                <p className="text-white/50 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom attribution */}
        <p className="relative z-10 text-white/30 text-xs">
          © {new Date().getFullYear()} ScholarFlow · All rights reserved
        </p>
      </div>

      {/* ── Right login panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50/60">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#003466' }}>
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-manrope font-bold text-gray-900 text-base">ScholarFlow</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="font-manrope font-bold text-2xl text-gray-900 leading-tight">
              Welcome back
            </h2>
            <p className="text-gray-500 text-sm mt-1">Choose your role to continue</p>
          </div>

          {/* Role cards */}
          <div className="space-y-2.5">
            {roles.map((r) => (
              <RoleCard
                key={r.role}
                {...r}
                onClick={() => login(r.role)}
              />
            ))}
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-400 mt-8">
            Demo mode — no credentials required
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

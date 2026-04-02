import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Loader2,
  ShieldCheck,
  User,
  Users,
  Briefcase,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

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

const RoleCard = ({ label, description, icon: Icon, accent, lightBg, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group w-full text-left rounded-xl border border-gray-100 bg-white hover:border-transparent hover:shadow-lg transition-all duration-250 p-4 flex items-center gap-4 relative overflow-hidden"
    style={{ '--accent': accent }}
  >
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
  const { login, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [step, setStep] = useState('choose');
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedMeta = roles.find((r) => r.role === selectedRole);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const goBackToRoles = () => {
    setStep('choose');
    setSelectedRole(null);
    setEmail('');
    setPassword('');
  };

  const handleChooseRole = (role) => {
    setSelectedRole(role);
    setStep('credentials');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login({ email: email.trim(), password });
      if (user.role !== selectedRole) {
        await logout();
        addToast(
          `This account is signed up as ${user.role}. Go back and choose that role, or use different credentials.`,
          'error'
        );
        return;
      }
      addToast('Signed in successfully', 'success');
      navigate('/', { replace: true });
    } catch (err) {
      addToast(err.message || 'Sign in failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div
        className="hidden lg:flex lg:w-[44%] xl:w-[42%] flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #002a52 0%, #003466 55%, #004080 100%)' }}
      >
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

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="font-manrope font-bold text-white text-lg tracking-tight">ScholarFlow</span>
        </div>

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
          <div className="flex gap-6">
            {[
              { value: '4+', label: 'Roles' },
              { value: '100%', label: 'Role-based' },
              { value: '∞', label: 'Scalable' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-white font-manrope font-bold text-xl">{value}</p>
                <p className="text-white/50 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/30 text-xs">
          © {new Date().getFullYear()} ScholarFlow · All rights reserved
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50/60">
        <div className="w-full max-w-[400px]">
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#003466' }}>
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-manrope font-bold text-gray-900 text-base">ScholarFlow</span>
          </div>

          {step === 'choose' ? (
            <>
              <div className="mb-8">
                <h2 className="font-manrope font-bold text-2xl text-gray-900 leading-tight">Welcome back</h2>
                <p className="text-gray-500 text-sm mt-1">Choose your role to continue</p>
              </div>
              <div className="space-y-2.5">
                {roles.map((r) => (
                  <RoleCard
                    key={r.role}
                    label={r.label}
                    description={r.description}
                    icon={r.icon}
                    accent={r.accent}
                    lightBg={r.lightBg}
                    onClick={() => handleChooseRole(r.role)}
                  />
                ))}
              </div>
              <p className="text-center text-xs text-gray-400 mt-8">
                You will sign in with your email and password. Your account must match the role you pick.
              </p>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={goBackToRoles}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 -mt-1"
              >
                <ArrowLeft size={16} />
                Change role
              </button>
              <div className="mb-8">
                <h2 className="font-manrope font-bold text-2xl text-gray-900 leading-tight">
                  Sign in as {selectedMeta?.label}
                </h2>
                <p className="text-gray-500 text-sm mt-1">Enter the email and password for this role.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="you@institute.edu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 disabled:opacity-60"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
                  {submitting ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

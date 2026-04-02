import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Circle, Clock, Trophy, XCircle, Briefcase, Download, Loader2 } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { listMyApplications } from '../../services/api';

const STATUS_FLOW = ['applied', 'shortlisted', 'offered'];

const STATUS_CONFIG = {
  applied: { label: 'Applied', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
  shortlisted: { label: 'Shortlisted', icon: CheckCircle2, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
  offered: { label: 'Offer Received', icon: Trophy, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-400', bg: 'bg-red-50', border: 'border-red-100' },
  withdrawn: { label: 'Withdrawn', icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' },
};

const StepTracker = ({ currentStatus }) => {
  if (currentStatus === 'rejected') {
    return (
      <div className="flex items-center gap-2 mt-4">
        <XCircle size={16} className="text-red-400" />
        <span className="text-sm text-red-500 font-medium">Application rejected</span>
      </div>
    );
  }
  if (currentStatus === 'withdrawn') {
    return (
      <div className="flex items-center gap-2 mt-4">
        <span className="text-sm text-gray-500 font-medium">You withdrew this application.</span>
      </div>
    );
  }

  const currentIdx = STATUS_FLOW.indexOf(currentStatus);

  return (
    <div className="flex items-center gap-2 mt-4 flex-wrap">
      {STATUS_FLOW.map((step, idx) => {
        const cfg = STATUS_CONFIG[step];
        const done = idx <= currentIdx;
        const Icon = cfg.icon;
        return (
          <div key={step} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${done ? cfg.color : 'text-gray-300'}`}>
              {done ? <Icon size={14} /> : <Circle size={14} />}
              {cfg.label}
            </div>
            {idx < STATUS_FLOW.length - 1 && <div className={`h-px w-6 sm:w-10 ${idx < currentIdx ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        );
      })}
    </div>
  );
};

function driveCompanyName(drive) {
  if (!drive || typeof drive !== 'object') return '—';
  const c = drive.company;
  if (c && typeof c === 'object' && c.name) return c.name;
  return '—';
}

function formatAppliedDate(app) {
  const d = app.createdAt || app.updatedAt;
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return '—';
  }
}

function applicationsToCsv(apps) {
  const headers = ['company', 'title', 'role', 'package', 'status', 'applied'];
  const lines = [headers.join(',')];
  for (const app of apps) {
    const d = app.drive;
    const row = [
      driveCompanyName(d),
      (d && d.title) || '',
      (d && d.jobRole) || '',
      (d && d.package) || '',
      app.status,
      formatAppliedDate(app),
    ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`);
    lines.push(row.join(','));
  }
  return lines.join('\n');
}

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { applications: rows } = await listMyApplications();
      setApplications(rows || []);
    } catch (e) {
      addToast(e.message || 'Failed to load applications', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = {
    total: applications.length,
    applied: applications.filter((a) => a.status === 'applied').length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    offered: applications.filter((a) => a.status === 'offered').length,
  };

  const handleExport = () => {
    if (!applications.length) {
      addToast('Nothing to export', 'info');
      return;
    }
    const blob = new Blob([applicationsToCsv(applications)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-applications.csv';
    a.click();
    URL.revokeObjectURL(url);
    addToast('Download started', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-manrope font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-500 mt-1">Track the status of all your placement applications.</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors whitespace-nowrap"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total applied', value: counts.total, color: 'text-gray-900', bg: 'bg-white' },
          { label: 'Under review', value: counts.applied, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Shortlisted', value: counts.shortlisted, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Offers', value: counts.offered, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((s) => (
          <div key={s.label} className={`card !p-4 ${s.bg} border`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="card flex items-center justify-center gap-2 py-12 text-gray-500">
          <Loader2 className="animate-spin" size={22} /> Loading…
        </div>
      ) : applications.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
          You haven&apos;t applied to any drives yet.
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const d = app.drive;
            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
            const Icon = cfg.icon;
            return (
              <div key={app.id || app._id} className={`card border ${cfg.border}`}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <Icon size={22} className={cfg.color} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900 text-base">{driveCompanyName(d)}</span>
                        <Badge variant={app.status}>{cfg.label}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {(d && d.jobRole) || (d && d.title) || '—'}
                        {d?.package ? ` · ${d.package}` : ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Applied on {formatAppliedDate(app)}</p>
                    </div>
                  </div>
                </div>
                <StepTracker currentStatus={app.status} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyApplications;

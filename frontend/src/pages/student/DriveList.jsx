import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Briefcase, CalendarDays, CheckCircle, Loader2 } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { listDrives, listMyApplications, applyToDrive } from '../../services/api';

function driveIdFromApp(app) {
  const d = app.drive;
  if (!d) return null;
  if (typeof d === 'string') return d;
  return d.id || d._id;
}

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return '—';
  }
}

const DriveList = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedIds, setAppliedIds] = useState(() => new Set());
  const [applyingId, setApplyingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ drives: drows }, appsRes] = await Promise.all([listDrives(), listMyApplications()]);
      setDrives(drows || []);
      const apps = appsRes.applications || [];
      const ids = new Set(apps.map(driveIdFromApp).filter(Boolean));
      setAppliedIds(ids);
    } catch (e) {
      addToast(e.message || 'Failed to load drives', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return drives.filter((drive) => {
      const companyName =
        typeof drive.company === 'object' && drive.company?.name ? drive.company.name : '';
      const roleText = drive.jobRole || drive.title || '';
      const matchSearch =
        companyName.toLowerCase().includes(search.toLowerCase()) ||
        roleText.toLowerCase().includes(search.toLowerCase());
      const eligible = drive.eligibility?.eligible;
      const isApplied = appliedIds.has(drive.id);
      if (filter === 'eligible') return matchSearch && eligible;
      if (filter === 'applied') return matchSearch && isApplied;
      return matchSearch;
    });
  }, [drives, search, filter, appliedIds]);

  const handleApply = async (driveId) => {
    setApplyingId(driveId);
    try {
      await applyToDrive(driveId);
      setAppliedIds((prev) => new Set([...prev, driveId]));
      addToast('Application submitted', 'success');
    } catch (e) {
      addToast(e.message || 'Could not apply', 'error');
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-manrope font-bold text-gray-900">Placement Drives</h1>
        <p className="text-gray-500 mt-1">Browse open drives and apply when you are eligible.</p>
      </div>

      <div className="card bg-primary/5 border-primary/10 !p-4 flex flex-wrap gap-6">
        <div>
          <span className="text-xs text-gray-500 block mb-0.5 font-medium">Your CGPA</span>
          <span className="font-bold text-gray-900">{user?.cgpa ?? '—'}</span>
        </div>
        <div>
          <span className="text-xs text-gray-500 block mb-0.5 font-medium">Backlogs</span>
          <span className="font-bold text-gray-900">{user?.backlogCount ?? 0}</span>
        </div>
        <div>
          <span className="text-xs text-gray-500 block mb-0.5 font-medium">Department</span>
          <span className="font-bold text-gray-900">{user?.department ?? '—'}</span>
        </div>
        <div>
          <span className="text-xs text-gray-500 block mb-0.5 font-medium">Section</span>
          <span className="font-bold text-gray-900">{user?.section ?? '—'}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies or roles..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'eligible', 'applied'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors capitalize ${
                filter === f ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card flex items-center justify-center gap-2 py-12 text-gray-500">
          <Loader2 className="animate-spin" size={22} /> Loading drives…
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No drives found matching your criteria.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((drive) => {
            const companyName =
              typeof drive.company === 'object' && drive.company?.name ? drive.company.name : 'Company';
            const eligible = !!drive.eligibility?.eligible;
            const isApplied = appliedIds.has(drive.id);
            const isOpen = drive.status === 'open';
            const reasons = drive.eligibility?.reasons || [];

            return (
              <div key={drive.id} className={`card border ${eligible ? 'border-gray-200' : 'border-red-100 bg-red-50/30'}`}>
                <div className="flex flex-col md:flex-row md:items-start gap-4 justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                      {companyName[0]}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900 text-base">{companyName}</span>
                        <Badge variant={drive.status}>{drive.status}</Badge>
                        <Badge variant={eligible ? 'eligible' : 'ineligible'}>{eligible ? 'Eligible' : 'Not eligible'}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{drive.jobRole || drive.title}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                        {drive.package && (
                          <span className="flex items-center gap-1">
                            <Briefcase size={11} />
                            {drive.package}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <CalendarDays size={11} />
                          {formatDate(drive.scheduledAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {isApplied ? (
                      <span className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <CheckCircle size={16} className="fill-green-600 text-white" /> Applied
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApply(drive.id)}
                        disabled={!eligible || !isOpen || applyingId === drive.id}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          eligible && isOpen ? 'btn-primary' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {applyingId === drive.id ? 'Applying…' : 'Apply now'}
                      </button>
                    )}
                  </div>
                </div>
                {!eligible && reasons.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-red-100 text-xs text-red-600 space-y-1">
                    {reasons.map((r, i) => (
                      <div key={i}>
                        • {r}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DriveList;

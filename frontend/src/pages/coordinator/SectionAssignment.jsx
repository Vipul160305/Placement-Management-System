import { useState, useEffect, useCallback, useMemo } from 'react';
import { Building2, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { listDrives, putDriveAssignments } from '../../services/api';

const SECTION_OPTIONS = ['A', 'B', 'C', 'D'];

function sectionsForDept(drive, deptNorm) {
  if (!deptNorm) return [];
  const row = (drive.sectionAssignments || []).find(
    (a) => (a.department || '').trim().toLowerCase() === deptNorm
  );
  return row?.sections || [];
}

const SectionAssignment = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({});
  const [savingId, setSavingId] = useState(null);

  const dept = (user?.department || '').trim();
  const deptNorm = dept.toLowerCase();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { drives: rows } = await listDrives();
      setDrives(rows || []);
      const next = {};
      (rows || []).forEach((d) => {
        next[d.id] = sectionsForDept(d, deptNorm);
      });
      setDraft(next);
    } catch (e) {
      addToast(e.message || 'Failed to load drives', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, deptNorm]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSection = (driveId, letter) => {
    setDraft((prev) => {
      const cur = [...(prev[driveId] || [])];
      const i = cur.findIndex((s) => s.toLowerCase() === letter.toLowerCase());
      if (i >= 0) cur.splice(i, 1);
      else cur.push(letter);
      return { ...prev, [driveId]: cur };
    });
  };

  const save = async (driveId) => {
    if (!dept) {
      addToast('Your account has no department set.', 'error');
      return;
    }
    setSavingId(driveId);
    try {
      await putDriveAssignments(driveId, [{ department: dept, sections: draft[driveId] || [] }]);
      addToast('Section assignment saved', 'success');
      load();
    } catch (e) {
      addToast(e.message || 'Save failed', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const stats = useMemo(() => {
    const assigned = drives.filter((d) => sectionsForDept(d, deptNorm).length > 0).length;
    return { drives: drives.length, assigned };
  }, [drives, deptNorm]);

  if (!dept) {
    return (
      <div className="card text-center py-12 text-amber-700">
        Your profile is missing a department. Ask an admin to set your department so you can assign sections.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-manrope font-bold text-gray-900">Section assignment</h1>
        <p className="text-gray-500 mt-1">
          For drives in <span className="font-semibold text-gray-800">{dept}</span>, choose which sections may apply.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <div className="card !p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.drives}</div>
          <div className="text-sm text-gray-500 mt-0.5">Visible drives</div>
        </div>
        <div className="card !p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.assigned}</div>
          <div className="text-sm text-gray-500 mt-0.5">With sections set</div>
        </div>
      </div>

      {loading ? (
        <div className="card flex items-center justify-center gap-2 py-12 text-gray-500">
          <Loader2 className="animate-spin" size={22} /> Loading drives…
        </div>
      ) : drives.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No drives available for your department yet.</div>
      ) : (
        <div className="space-y-4">
          {drives.map((drive) => {
            const companyName =
              typeof drive.company === 'object' && drive.company?.name ? drive.company.name : 'Company';
            const selected = draft[drive.id] || [];
            return (
              <div key={drive.id} className="card">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{drive.title || 'Untitled drive'}</h3>
                      <p className="text-sm text-gray-500">{companyName}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={savingId === drive.id}
                    onClick={() => save(drive.id)}
                    className="btn-primary text-sm px-4 py-2 whitespace-nowrap disabled:opacity-60"
                  >
                    {savingId === drive.id ? 'Saving…' : 'Save sections'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-3">Sections for {dept}</p>
                <div className="flex flex-wrap gap-2">
                  {SECTION_OPTIONS.map((letter) => {
                    const on = selected.some((s) => s.toLowerCase() === letter.toLowerCase());
                    return (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => toggleSection(drive.id, letter)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                          on ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-300 hover:border-primary'
                        }`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SectionAssignment;

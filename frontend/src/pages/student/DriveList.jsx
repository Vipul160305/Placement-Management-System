import { useState } from 'react';
import { Search, Briefcase, CalendarDays, CheckCircle, XCircle } from 'lucide-react';
import { mockDrives } from '../../data/mockData';
import Badge from '../../components/ui/Badge';

// Mock current student profile
const STUDENT = { cgpa: 8.5, backlogs: 0, department: 'CSE', section: 'CSE-A' };

const checkEligibility = (drive) => {
  const cgpaOk = STUDENT.cgpa >= drive.minCGPA;
  const backlogOk = STUDENT.backlogs <= drive.maxBacklogs;
  const deptOk = drive.departments.includes(STUDENT.department);
  const sectionOk = drive.sections.includes(STUDENT.section);
  return { eligible: cgpaOk && backlogOk && deptOk && sectionOk, cgpaOk, backlogOk, deptOk, sectionOk };
};

const DriveList = () => {
  const [drives] = useState(mockDrives);
  const [applied, setApplied] = useState(new Set([1])); // drive 1 already applied
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = drives.filter(d => {
    const { eligible } = checkEligibility(d);
    const matchSearch = d.companyName.toLowerCase().includes(search.toLowerCase()) || d.role.toLowerCase().includes(search.toLowerCase());
    if (filter === 'eligible') return matchSearch && eligible;
    if (filter === 'applied') return matchSearch && applied.has(d.id);
    return matchSearch;
  });

  const handleApply = (driveId) => {
    setApplied(prev => new Set([...prev, driveId]));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-manrope font-bold text-gray-900">Placement Drives</h1>
        <p className="text-gray-500 mt-1">Browse available drives and apply based on your eligibility.</p>
      </div>

      {/* Eligibility summary card */}
      <div className="card bg-primary/5 border-primary/10 !p-4 flex flex-wrap gap-6">
        <div><span className="text-xs text-gray-500 block mb-0.5 font-medium">Your CGPA</span><span className="font-bold text-gray-900">{STUDENT.cgpa}</span></div>
        <div><span className="text-xs text-gray-500 block mb-0.5 font-medium">Backlogs</span><span className="font-bold text-gray-900">{STUDENT.backlogs}</span></div>
        <div><span className="text-xs text-gray-500 block mb-0.5 font-medium">Department</span><span className="font-bold text-gray-900">{STUDENT.department}</span></div>
        <div><span className="text-xs text-gray-500 block mb-0.5 font-medium">Section</span><span className="font-bold text-gray-900">{STUDENT.section}</span></div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies or roles..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div className="flex gap-2">
          {['all', 'eligible', 'applied'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors capitalize ${filter === f ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Drive cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">No drives found matching your criteria.</div>
        ) : filtered.map(drive => {
          const { eligible, cgpaOk, backlogOk, deptOk } = checkEligibility(drive);
          const isApplied = applied.has(drive.id);
          const isOpen = drive.status === 'open';

          return (
            <div key={drive.id} className={`card border ${eligible ? 'border-gray-200' : 'border-red-100 bg-red-50/30'}`}>
              <div className="flex flex-col md:flex-row md:items-start gap-4 justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                    {drive.companyName[0]}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-900 text-base">{drive.companyName}</span>
                      <Badge variant={drive.status}>{drive.status}</Badge>
                      <Badge variant={eligible ? 'eligible' : 'ineligible'}>{eligible ? 'Eligible' : 'Not Eligible'}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{drive.role}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Briefcase size={11} />₹{drive.package} LPA</span>
                      <span className="flex items-center gap-1"><CalendarDays size={11} />Drive: {drive.date}</span>
                      <span className="text-red-500 font-medium">Deadline: {drive.deadline}</span>
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
                      onClick={() => handleApply(drive.id)}
                      disabled={!eligible || !isOpen}
                      className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${eligible && isOpen ? 'btn-primary' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>

              {/* Eligibility breakdown */}
              {!eligible && (
                <div className="mt-4 pt-4 border-t border-red-100 flex flex-wrap gap-3 text-xs">
                  {[
                    { ok: cgpaOk, msg: `Min CGPA ${drive.minCGPA} required (You: ${STUDENT.cgpa})` },
                    { ok: backlogOk, msg: `Max ${drive.maxBacklogs} backlog(s) allowed (You: ${STUDENT.backlogs})` },
                    { ok: deptOk, msg: `Dept: ${drive.departments.join(', ')} (You: ${STUDENT.department})` },
                  ].filter(r => !r.ok).map((r, i) => (
                    <span key={i} className="flex items-center gap-1 text-red-500 font-medium"><XCircle size={12} />{r.msg}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DriveList;

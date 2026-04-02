import { useState } from 'react';
import { Plus, CalendarDays, Briefcase, ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import { mockDrives, mockCompanies } from '../../data/mockData';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';

const BLANK = { companyId: '', role: '', date: '', deadline: '', departments: [], sections: [], minCGPA: '', maxBacklogs: 0, status: 'open' };
const SECTIONS = ['CSE-A', 'CSE-B', 'CSE-C', 'ECE-A', 'ECE-B', 'IT-A'];

const DrivesPage = () => {
  const [drives, setDrives] = useState(mockDrives);
  const [companies] = useState(mockCompanies);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = statusFilter === 'all' ? drives : drives.filter(d => d.status === statusFilter);

  const openAdd = () => { setForm(BLANK); setModalOpen(true); };

  const handleSave = (e) => {
    e.preventDefault();
    const company = companies.find(c => c.id === Number(form.companyId));
    const newDrive = {
      ...form, id: Date.now(), companyId: Number(form.companyId),
      companyName: company?.name || 'Unknown',
      package: company?.package || 0,
      minCGPA: Number(form.minCGPA), maxBacklogs: Number(form.maxBacklogs),
    };
    setDrives(prev => [...prev, newDrive]);
    setModalOpen(false);
  };

  const updateStatus = (id, status) => setDrives(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  const f = field => e => setForm(p => ({ ...p, [field]: e.target.value }));
  const toggleArr = (field, val) => setForm(p => ({
    ...p, [field]: p[field].includes(val) ? p[field].filter(x => x !== val) : [...p[field], val]
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-manrope font-bold text-gray-900">Placement Drives</h1>
          <p className="text-gray-500 mt-1">Create and manage placement drives for companies.</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus size={18} /> Create Drive
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {['all', 'open', 'closed'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${statusFilter === s ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {s === 'all' ? 'All Drives' : s === 'open' ? 'Open' : 'Closed'}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${statusFilter === s ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
              {s === 'all' ? drives.length : drives.filter(d => d.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {/* Drive Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">No drives found.</div>
        ) : filtered.map(drive => (
          <div key={drive.id} className="card !p-0 overflow-hidden">
            <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {drive.companyName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{drive.companyName}</span>
                    <Badge variant={drive.status}>{drive.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{drive.role} · ₹{drive.package} LPA</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <CalendarDays size={13} /> Drive: {drive.date}
                </div>
                <div className="flex gap-2">
                  {drive.status === 'open'
                    ? <button onClick={() => updateStatus(drive.id, 'closed')} className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">Close</button>
                    : <button onClick={() => updateStatus(drive.id, 'open')} className="text-xs px-3 py-1.5 rounded-lg border border-green-300 text-green-600 hover:bg-green-50">Reopen</button>
                  }
                  <button onClick={() => setExpandedId(expandedId === drive.id ? null : drive.id)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center gap-1">
                    Details {expandedId === drive.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                </div>
              </div>
            </div>
            {expandedId === drive.id && (
              <div className="border-t border-gray-100 bg-gray-50 p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-gray-500 block text-xs font-medium mb-0.5">Min CGPA</span><span className="font-semibold">≥ {drive.minCGPA}</span></div>
                <div><span className="text-gray-500 block text-xs font-medium mb-0.5">Max Backlogs</span><span className="font-semibold">≤ {drive.maxBacklogs}</span></div>
                <div><span className="text-gray-500 block text-xs font-medium mb-0.5">Departments</span><span className="font-semibold">{drive.departments?.join(', ')}</span></div>
                <div><span className="text-gray-500 block text-xs font-medium mb-0.5">Sections</span><span className="font-semibold">{drive.sections?.join(', ')}</span></div>
                <div><span className="text-gray-500 block text-xs font-medium mb-0.5">Apply Deadline</span><span className="font-semibold text-red-600">{drive.deadline}</span></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Drive Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Placement Drive" size="xl">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company <span className="text-red-500">*</span></label>
              <select required value={form.companyId} onChange={f('companyId')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Select Company</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name} (₹{c.package} LPA)</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Role <span className="text-red-500">*</span></label>
              <input required value={form.role} onChange={f('role')} placeholder="e.g. Software Engineer" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Drive Date <span className="text-red-500">*</span></label>
              <input required type="date" value={form.date} onChange={f('date')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apply Deadline <span className="text-red-500">*</span></label>
              <input required type="date" value={form.deadline} onChange={f('deadline')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min CGPA <span className="text-red-500">*</span></label>
              <input required type="number" step="0.1" value={form.minCGPA} onChange={f('minCGPA')} placeholder="e.g. 7.5" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Sections</label>
            <div className="flex flex-wrap gap-2">
              {SECTIONS.map(s => (
                <button key={s} type="button" onClick={() => toggleArr('sections', s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${form.sections.includes(s) ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-300 hover:border-primary'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="btn-primary">Create Drive</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DrivesPage;

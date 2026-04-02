import { useState } from 'react';
import { Plus, Pencil, Trash2, Building2, Search } from 'lucide-react';
import { mockCompanies } from '../../data/mockData';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';

const BLANK = { name: '', industry: 'Technology', package: '', minCGPA: '', maxBacklogs: 0, departments: [] };

const DEPTS = ['CSE', 'ECE', 'IT', 'MECH', 'CIVIL'];

const CompaniesPage = () => {
  const [companies, setCompanies] = useState(mockCompanies);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editCo, setEditCo] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAdd = () => { setEditCo(null); setForm(BLANK); setModalOpen(true); };
  const openEdit = (c) => { setEditCo(c); setForm({ ...c, minCGPA: c.eligibility.minCGPA, maxBacklogs: c.eligibility.maxBacklogs, departments: c.eligibility.departments }); setModalOpen(true); };

  const handleSave = (e) => {
    e.preventDefault();
    const payload = { ...form, package: Number(form.package), eligibility: { minCGPA: Number(form.minCGPA), maxBacklogs: Number(form.maxBacklogs), departments: form.departments } };
    if (editCo) {
      setCompanies(prev => prev.map(c => c.id === editCo.id ? { ...payload, id: c.id } : c));
    } else {
      setCompanies(prev => [...prev, { ...payload, id: Date.now() }]);
    }
    setModalOpen(false);
  };

  const toggleDept = (dept) => setForm(p => ({
    ...p, departments: p.departments.includes(dept) ? p.departments.filter(d => d !== dept) : [...p.departments, dept]
  }));

  const f = field => e => setForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-manrope font-bold text-gray-900">Companies</h1>
          <p className="text-gray-500 mt-1">Manage recruiting companies and their eligibility criteria.</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus size={18} /> Add Company
        </button>
      </div>

      {/* Search */}
      <div className="card !p-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search companies..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
          <Building2 size={18} className="text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">{filtered.length} Companies</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left font-semibold">Company</th>
                <th className="px-4 py-3 text-left font-semibold">Industry</th>
                <th className="px-4 py-3 text-left font-semibold">Package (LPA)</th>
                <th className="px-4 py-3 text-left font-semibold">Min CGPA</th>
                <th className="px-4 py-3 text-left font-semibold">Max Backlogs</th>
                <th className="px-4 py-3 text-left font-semibold">Departments</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">No companies found.</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500">{c.industry}</td>
                  <td className="px-4 py-3 font-bold text-primary">₹{c.package} LPA</td>
                  <td className="px-4 py-3 text-gray-700">≥ {c.eligibility.minCGPA}</td>
                  <td className="px-4 py-3 text-gray-700">≤ {c.eligibility.maxBacklogs}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.eligibility.departments.map(d => <Badge key={d} variant="student">{d}</Badge>)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"><Pencil size={15} /></button>
                      <button onClick={() => setDeleteConfirm(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editCo ? 'Edit Company' : 'Add Company'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
              <input required value={form.name} onChange={f('name')} placeholder="e.g. Google" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select value={form.industry} onChange={f('industry')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                {['Technology','IT Services','Finance','E-Commerce','Data Tech','Consulting'].map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Package (LPA) <span className="text-red-500">*</span></label>
              <input required type="number" value={form.package} onChange={f('package')} placeholder="e.g. 12" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min CGPA <span className="text-red-500">*</span></label>
              <input required type="number" step="0.1" value={form.minCGPA} onChange={f('minCGPA')} placeholder="e.g. 7.5" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Backlogs</label>
              <input type="number" value={form.maxBacklogs} onChange={f('maxBacklogs')} placeholder="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Eligible Departments</label>
            <div className="flex flex-wrap gap-2">
              {DEPTS.map(d => (
                <button key={d} type="button" onClick={() => toggleDept(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${form.departments.includes(d) ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-300 hover:border-primary'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="btn-primary">{editCo ? 'Save Changes' : 'Add Company'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Remove Company" size="sm">
        <p className="text-gray-600 text-sm mb-6">Are you sure you want to remove this company? All associated drives may be affected.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={() => { setCompanies(p => p.filter(c => c.id !== deleteConfirm)); setDeleteConfirm(null); }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Remove</button>
        </div>
      </Modal>
    </div>
  );
};

export default CompaniesPage;

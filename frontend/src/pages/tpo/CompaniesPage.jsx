import { useState, useRef } from 'react';
import { Search, Plus, Building2, Upload } from 'lucide-react';
import { mockCompanies } from '../../data/mockData';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';

const BLANK_COMPANY = { name: '', package: '', minCGPA: '', maxBacklogs: '' };

const InputField = ({ label, type = 'text', value, onChange, required, placeholder, step }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
    <input
      type={type} value={value} onChange={onChange} required={required} placeholder={placeholder} step={step}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
    />
  </div>
);

const CompaniesPage = () => {
  const [companies, setCompanies] = useState(mockCompanies);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(BLANK_COMPANY);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const filtered = companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleSave = (e) => {
    e.preventDefault();
    const newCompany = {
      id: Date.now(),
      name: form.name,
      package: Number(form.package),
      eligibility: { minCGPA: Number(form.minCGPA), maxBacklogs: Number(form.maxBacklogs) },
      activeDrives: 0,
    };
    setCompanies([...companies, newCompany]);
    setModalOpen(false);
    setForm(BLANK_COMPANY);
    addToast('Company and criteria added successfully', 'success');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Mock CSV parsing
    setTimeout(() => {
      const mockImportedCount = Math.floor(Math.random() * 15) + 3;
      addToast(`Successfully imported ${mockImportedCount} companies from ${file.name}`, 'success');
      e.target.value = ''; // Reset input
    }, 1000);
  };

  const f = field => e => setForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-manrope font-bold text-gray-900">Companies & Criteria</h1>
          <p className="text-gray-500 mt-1">Manage recruiting companies and their default eligibility criteria.</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors whitespace-nowrap"
          >
            <Upload size={18} /> Import CSV
          </button>
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus size={18} /> Add Company
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..."
          className="w-full pl-9 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <div key={c.id} className="card flex flex-col h-full">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                {c.name[0]}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{c.name}</h3>
                <p className="text-primary font-semibold mt-1">₹{c.package} LPA</p>
              </div>
            </div>
            <div className="mt-auto bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Min CGPA</span>
                <span className="font-semibold text-gray-900">{c.eligibility.minCGPA}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Max Backlogs</span>
                <span className="font-semibold text-gray-900">{c.eligibility.maxBacklogs}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Company">
        <form onSubmit={handleSave} className="space-y-4">
          <InputField label="Company Name" value={form.name} onChange={f('name')} required placeholder="e.g. Google" />
          <InputField label="Package (LPA)" type="number" value={form.package} onChange={f('package')} required placeholder="e.g. 24" step="0.1" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Min CGPA" type="number" value={form.minCGPA} onChange={f('minCGPA')} required placeholder="e.g. 8.0" step="0.1" />
            <InputField label="Max Backlogs" type="number" value={form.maxBacklogs} onChange={f('maxBacklogs')} required placeholder="e.g. 0" />
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 sm:pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 w-full sm:w-auto">Cancel</button>
            <button type="submit" className="btn-primary w-full sm:w-auto">Save Company</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CompaniesPage;

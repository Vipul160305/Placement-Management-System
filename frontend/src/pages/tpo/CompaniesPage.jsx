import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Plus, Upload, Pencil, Trash2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { listCompanies, createCompany, updateCompany, deleteCompany, importCompaniesCsv } from '../../services/api';

const BLANK = { name: '', website: '', contactEmail: '', contactPhone: '' };

const InputField = ({ label, type = 'text', value, onChange, required, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
    />
  </div>
);

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { companies: rows } = await listCompanies();
      setCompanies(rows || []);
    } catch (e) {
      addToast(e.message || 'Failed to load companies', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = companies.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => {
    setEditing(null);
    setForm(BLANK);
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name,
      website: c.website || '',
      contactEmail: c.contactEmail || '',
      contactPhone: c.contactPhone || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const body = {
        name: form.name.trim(),
        website: form.website.trim() || undefined,
        contactEmail: form.contactEmail.trim() || undefined,
        contactPhone: form.contactPhone.trim() || undefined,
      };
      if (editing) {
        await updateCompany(editing.id, body);
        addToast('Company updated', 'success');
      } else {
        await createCompany(body);
        addToast('Company created', 'success');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      addToast(err.message || 'Save failed', 'error');
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete ${c.name}?`)) return;
    try {
      await deleteCompany(c.id);
      addToast('Company deleted', 'info');
      load();
    } catch (err) {
      addToast(err.message || 'Delete failed', 'error');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await importCompaniesCsv(file);
      addToast(`Imported ${res.imported} companies. ${res.failed} rows failed.`, res.failed ? 'warning' : 'success');
      load();
    } catch (err) {
      addToast(err.message || 'Import failed', 'error');
    }
    e.target.value = '';
  };

  const f = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-manrope font-bold text-gray-900">Companies</h1>
          <p className="text-gray-500 mt-1">Manage recruiting companies and contacts.</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors whitespace-nowrap"
          >
            <Upload size={18} /> Import CSV
          </button>
          <button type="button" onClick={openAdd} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus size={18} /> Add Company
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies..."
          className="w-full pl-9 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {loading ? (
        <div className="card text-center py-12 text-gray-400">Loading companies…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="card flex flex-col h-full">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{c.name}</h3>
                  {c.contactEmail && <p className="text-sm text-gray-500 mt-1 truncate">{c.contactEmail}</p>}
                  {c.website && (
                    <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`} className="text-xs text-primary mt-1 inline-block truncate max-w-full" target="_blank" rel="noreferrer">
                      {c.website}
                    </a>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button type="button" onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400" title="Edit">
                    <Pencil size={16} />
                  </button>
                  <button type="button" onClick={() => handleDelete(c)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-auto bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-600">
                {c.contactPhone ? <div>Phone: {c.contactPhone}</div> : <div className="text-gray-400">No phone on file</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Company' : 'Add Company'}>
        <form onSubmit={handleSave} className="space-y-4">
          <InputField label="Company Name" value={form.name} onChange={f('name')} required placeholder="e.g. Acme Corp" />
          <InputField label="Website" value={form.website} onChange={f('website')} placeholder="https://example.com" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Contact email" type="email" value={form.contactEmail} onChange={f('contactEmail')} placeholder="hr@company.com" />
            <InputField label="Contact phone" value={form.contactPhone} onChange={f('contactPhone')} placeholder="+91 …" />
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 sm:pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 w-full sm:w-auto">
              Cancel
            </button>
            <button type="submit" className="btn-primary w-full sm:w-auto">
              {editing ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CompaniesPage;

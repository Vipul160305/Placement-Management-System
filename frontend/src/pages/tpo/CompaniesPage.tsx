import { useState, useRef, useEffect, useCallback, type ChangeEvent, type FormEvent } from "react";
import { Search, Plus, Upload, Pencil, Trash2, UserCheck } from "lucide-react";
import Modal from "../../components/ui/Modal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useToast } from "../../context/ToastContext";
import { listCompanies, createCompany, updateCompany, deleteCompany, importCompaniesCsv } from "../../services/api";

const BLANK = {
  name: "", website: "", contactEmail: "", contactPhone: "",
  hrName: "", hrEmail: "", hrPassword: "",
};
type FormState = typeof BLANK;

interface HRInfo { name: string; email: string }
interface CompanyRow {
  id: string; name: string;
  website?: string; contactEmail?: string; contactPhone?: string;
  hr?: HRInfo | null;
}

const InputField = ({ label, type = "text", value, onChange, required, placeholder }: {
  label: string; type?: string; value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean; placeholder?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input type={type} value={value} onChange={onChange} required={required} placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
  </div>
);

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CompanyRow | null>(null);
  const [form, setForm] = useState<FormState>(BLANK);
  const [deleteTarget, setDeleteTarget] = useState<CompanyRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { companies: rows } = (await listCompanies()) as { companies?: CompanyRow[] };
      setCompanies(rows || []);
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Failed to load companies", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = companies.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => {
    setEditing(null);
    setForm(BLANK);
    setModalOpen(true);
  };

  const openEdit = (c: CompanyRow) => {
    setEditing(c);
    setForm({
      name: c.name, website: c.website || "",
      contactEmail: c.contactEmail || "", contactPhone: c.contactPhone || "",
      hrName: c.hr?.name || "", hrEmail: c.hr?.email || "", hrPassword: "",
    });
    setModalOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        website: form.website.trim() || undefined,
        contactEmail: form.contactEmail.trim() || undefined,
        contactPhone: form.contactPhone.trim() || undefined,
      };
      if (form.hrEmail.trim()) {
        body.hrEmail = form.hrEmail.trim();
        body.hrName = form.hrName.trim() || undefined;
        if (form.hrPassword.trim()) body.hrPassword = form.hrPassword.trim();
      }
      if (editing) {
        await updateCompany(editing.id, body);
        addToast("Company updated", "success");
      } else {
        await createCompany(body);
        addToast("Company created", "success");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Save failed", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCompany(deleteTarget.id);
      addToast("Company deleted", "info");
      setDeleteTarget(null);
      load();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = (await importCompaniesCsv(file)) as { imported: number; failed: number };
      addToast(`Imported ${res.imported} companies. ${res.failed} rows failed.`, res.failed ? "warning" : "success");
      load();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Import failed", "error");
    }
    e.target.value = "";
  };

  const f = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-manrope font-bold text-gray-900">Companies</h1>
          <p className="text-gray-500 mt-1">Manage recruiting companies and their HR accounts.</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors whitespace-nowrap">
            <Upload size={18} /> Import CSV
          </button>
          <button type="button" onClick={openAdd} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus size={18} /> Add Company
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search companies..."
          className="w-full pl-9 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
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
                    <a href={c.website.startsWith("http") ? c.website : `https://${c.website}`}
                      className="text-xs text-primary mt-1 inline-block truncate max-w-full" target="_blank" rel="noreferrer">
                      {c.website}
                    </a>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button type="button" onClick={() => openEdit(c)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400" title="Edit">
                    <Pencil size={16} />
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(c)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-auto space-y-2">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-600">
                  {c.contactPhone ? <div>Phone: {c.contactPhone}</div> : <div className="text-gray-400">No phone on file</div>}
                </div>
                <div className={`p-3 rounded-lg border text-sm flex items-center gap-2 ${c.hr ? "bg-green-50 border-green-100 text-green-700" : "bg-gray-50 border-gray-100 text-gray-400"}`}>
                  <UserCheck size={14} />
                  {c.hr ? (
                    <span><span className="font-medium">{c.hr.name}</span> · {c.hr.email}</span>
                  ) : (
                    <span>No HR account linked</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Company" : "Add Company"} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <InputField label="Company Name" value={form.name} onChange={f("name")} required placeholder="e.g. Acme Corp" />
          <InputField label="Website" value={form.website} onChange={f("website")} placeholder="https://example.com" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Contact email" type="email" value={form.contactEmail} onChange={f("contactEmail")} placeholder="hr@company.com" />
            <InputField label="Contact phone" value={form.contactPhone} onChange={f("contactPhone")} placeholder="+91 …" />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <UserCheck size={15} /> HR Account
            </p>
            <div className="space-y-3">
              <InputField label="HR Name" value={form.hrName} onChange={f("hrName")} placeholder="e.g. Priya Sharma" />
              <InputField label="HR Email" type="email" value={form.hrEmail} onChange={f("hrEmail")} placeholder="hr@tcs.com" />
              <InputField
                label={editing?.hr ? "New HR Password (leave blank to keep)" : "HR Password"}
                type="password" value={form.hrPassword} onChange={f("hrPassword")}
                required={!editing?.hr && !!form.hrEmail}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 w-full sm:w-auto">
              Cancel
            </button>
            <button type="submit" className="btn-primary w-full sm:w-auto">
              {editing ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Company"
        message={`Delete "${deleteTarget?.name}"?`}
        subMessage="This will also permanently remove the linked HR account. This cannot be undone."
        confirmLabel="Delete Company"
        danger
        loading={deleting}
      />
    </div>
  );
};

export default CompaniesPage;

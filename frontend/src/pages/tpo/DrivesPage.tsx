import { useState, useEffect, useCallback, type ChangeEvent, type FormEvent } from "react";
import { Plus, CalendarDays, ChevronDown, ChevronUp } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { useToast } from "../../context/ToastContext";
import { listDrives, listCompanies, createDrive, updateDrive, deleteDrive } from "../../services/api";

const BLANK = {
  company: "",
  title: "",
  jobRole: "",
  package: "",
  scheduledAt: "",
  minCgpa: "7",
  maxBacklogs: "0",
  allowedBranches: "",
  status: "open",
};

type FormState = typeof BLANK;
type StatusFilter = "all" | "draft" | "open" | "closed";

interface CompanyOption {
  id: string;
  name: string;
}

interface DriveRow {
  id: string;
  title?: string;
  jobRole?: string;
  package?: string;
  status?: string;
  scheduledAt?: string;
  minCgpa?: number;
  maxBacklogs?: number;
  allowedBranches?: string[];
  company?: { name?: string } | string;
  sectionAssignments?: { department?: string; sections?: string[] }[];
}

function formatDate(d: string | undefined) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "—";
  }
}

const DrivesPage = () => {
  const [allDrives, setAllDrives] = useState<DriveRow[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(BLANK);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const { addToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dRes, cRes] = await Promise.all([listDrives(), listCompanies()]);
      setAllDrives((dRes as { drives?: DriveRow[] }).drives || []);
      setCompanies((cRes as { companies?: CompanyOption[] }).companies || []);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load drives";
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    load();
  }, [load]);

  const drives =
    statusFilter === "all" ? allDrives : allDrives.filter((d) => d.status === statusFilter);

  const openAdd = () => {
    setForm(BLANK);
    setModalOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const branches = form.allowedBranches
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      await createDrive({
        company: form.company,
        title: form.title.trim(),
        jobRole: form.jobRole.trim(),
        package: form.package.trim() || undefined,
        scheduledAt: form.scheduledAt || undefined,
        minCgpa: Number(form.minCgpa) || 0,
        maxBacklogs: Number(form.maxBacklogs) || 0,
        allowedBranches: branches,
        status: form.status,
      });
      addToast("Drive created", "success");
      setModalOpen(false);
      load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create drive";
      addToast(message, "error");
    }
  };

  const setStatus = async (id: string, status: string) => {
    try {
      await updateDrive(id, { status });
      addToast(`Drive ${status}`, "success");
      load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Update failed";
      addToast(message, "error");
    }
  };

  const removeDrive = async (id: string) => {
    if (!window.confirm("Delete this drive?")) return;
    try {
      await deleteDrive(id);
      addToast("Drive deleted", "info");
      load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      addToast(message, "error");
    }
  };

  const f =
    (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const tabCounts: Record<StatusFilter, number> = {
    all: allDrives.length,
    draft: allDrives.filter((d) => d.status === "draft").length,
    open: allDrives.filter((d) => d.status === "open").length,
    closed: allDrives.filter((d) => d.status === "closed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-manrope font-bold text-gray-900">Placement Drives</h1>
          <p className="text-gray-500 mt-1">Create and manage placement drives for companies.</p>
        </div>
        <button type="button" onClick={openAdd} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus size={18} /> Create Drive
        </button>
      </div>

      <div className="flex gap-2 border-b border-gray-200 flex-wrap">
        {(["all", "draft", "open", "closed"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              statusFilter === s ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {s === "all" ? "All" : s}
            <span
              className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                statusFilter === s ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"
              }`}
            >
              {s === "all" ? tabCounts.all : tabCounts[s]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card text-center py-12 text-gray-400">Loading drives…</div>
      ) : drives.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No drives found.</div>
      ) : (
        <div className="space-y-3">
          {drives.map((drive) => {
            const companyName =
              typeof drive.company === "object" && drive.company?.name ? drive.company.name : "Company";
            const initial = companyName[0] || "?";
            return (
              <div key={drive.id} className="card !p-0 overflow-hidden">
                <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {initial}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{companyName}</span>
                        <Badge variant={drive.status || "open"}>{drive.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {drive.title}
                        {drive.jobRole ? ` · ${drive.jobRole}` : ""}
                        {drive.package ? ` · ${drive.package}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <CalendarDays size={13} /> {formatDate(drive.scheduledAt)}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {drive.status === "open" ? (
                        <button
                          type="button"
                          onClick={() => setStatus(drive.id, "closed")}
                          className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                          Close
                        </button>
                      ) : drive.status === "closed" ? (
                        <button
                          type="button"
                          onClick={() => setStatus(drive.id, "open")}
                          className="text-xs px-3 py-1.5 rounded-lg border border-green-300 text-green-600 hover:bg-green-50"
                        >
                          Reopen
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setStatus(drive.id, "open")}
                          className="text-xs px-3 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/5"
                        >
                          Open
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setExpandedId(expandedId === drive.id ? null : drive.id)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center gap-1"
                      >
                        Details {expandedId === drive.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDrive(drive.id)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                {expandedId === drive.id && (
                  <div className="border-t border-gray-100 bg-gray-50 p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 block text-xs font-medium mb-0.5">Min CGPA</span>
                      <span className="font-semibold">≥ {drive.minCgpa}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs font-medium mb-0.5">Max backlogs</span>
                      <span className="font-semibold">≤ {drive.maxBacklogs}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-500 block text-xs font-medium mb-0.5">Allowed branches</span>
                      <span className="font-semibold">{(drive.allowedBranches || []).join(", ") || "Any (empty list)"}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-500 block text-xs font-medium mb-0.5">Section assignments</span>
                      <span className="font-semibold text-xs">
                        {(drive.sectionAssignments || [])
                          .map((a) => `${a.department}: ${(a.sections || []).join(", ")}`)
                          .join(" · ") || "None yet"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Placement Drive" size="xl">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company <span className="text-red-500">*</span>
              </label>
              <select required value={form.company} onChange={f("company")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Select company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial status</label>
              <select value={form.status} onChange={f("status")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="draft">draft</option>
                <option value="open">open</option>
                <option value="closed">closed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Drive title <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.title}
              onChange={f("title")}
              placeholder="e.g. Campus hiring 2026"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job role</label>
              <input
                value={form.jobRole}
                onChange={f("jobRole")}
                placeholder="e.g. Software Engineer"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Package</label>
              <input
                value={form.package}
                onChange={f("package")}
                placeholder="e.g. 12 LPA"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled date</label>
              <input type="date" value={form.scheduledAt} onChange={f("scheduledAt")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min CGPA</label>
              <input type="number" step="0.1" value={form.minCgpa} onChange={f("minCgpa")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max backlogs</label>
              <input type="number" value={form.maxBacklogs} onChange={f("maxBacklogs")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Allowed branches (comma-separated)</label>
            <input
              value={form.allowedBranches}
              onChange={f("allowedBranches")}
              placeholder="CSE, ECE, IT"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Drive
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DrivesPage;

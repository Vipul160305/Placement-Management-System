import { useState, useEffect, useCallback, useRef, type ChangeEvent, type FormEvent } from "react";
import {
  Mail, BookOpen, Hash, GraduationCap, AlertCircle,
  FileCheck, UploadCloud, Loader2, Pencil, Clock, CheckCircle2, XCircle, ExternalLink,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  uploadStudentResume, getResumeUrl,
  submitProfileEditRequest, getMyProfileEditRequest,
} from "../../services/api";

type RequestStatus = "pending" | "approved" | "rejected";

interface EditRequest {
  id?: string;
  _id?: string;
  status: RequestStatus;
  changes: Record<string, unknown>;
  reviewNote?: string;
  createdAt?: string;
}

const FIELD_LABELS: Record<string, string> = {
  name: "Full Name", department: "Department", section: "Section",
  branch: "Branch", cgpa: "CGPA", backlogCount: "Active Backlogs",
};

const StatusBadge = ({ status }: { status: RequestStatus }) => {
  const cfg = {
    pending:  { icon: Clock,        color: "text-amber-600",  bg: "bg-amber-50  border-amber-200",  label: "Pending TPO approval" },
    approved: { icon: CheckCircle2, color: "text-green-600",  bg: "bg-green-50  border-green-200",  label: "Approved" },
    rejected: { icon: XCircle,      color: "text-red-500",    bg: "bg-red-50    border-red-100",     label: "Rejected" },
  }[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
      <Icon size={13} /> {cfg.label}
    </span>
  );
};

const StudentProfile = () => {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [request, setRequest] = useState<EditRequest | null>(null);
  const [requestLoading, setRequestLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "", department: "", section: "", branch: "", cgpa: "", backlogCount: "",
  });

  const loadRequest = useCallback(async () => {
    setRequestLoading(true);
    try {
      const res = (await getMyProfileEditRequest()) as { request?: EditRequest };
      setRequest(res.request || null);
    } catch {
      // non-critical
    } finally {
      setRequestLoading(false);
    }
  }, []);

  useEffect(() => { loadRequest(); }, [loadRequest]);

  // Refresh user data when approved
  useEffect(() => {
    if (request?.status === "approved") refreshUser();
  }, [request?.status, refreshUser]);

  const openEdit = () => {
    setForm({
      name: user?.name || "",
      department: user?.department || "",
      section: user?.section || "",
      branch: user?.branch || "",
      cgpa: user?.cgpa != null ? String(user.cgpa) : "",
      backlogCount: user?.backlogCount != null ? String(user.backlogCount) : "",
    });
    setEditOpen(true);
  };

  const handleSubmitEdit = async (e: FormEvent) => {
    e.preventDefault();
    const changes: Record<string, unknown> = {};
    if (form.name.trim() && form.name.trim() !== user?.name) changes.name = form.name.trim();
    if (form.department.trim() && form.department.trim() !== user?.department) changes.department = form.department.trim();
    if (form.section.trim() && form.section.trim() !== user?.section) changes.section = form.section.trim();
    if (form.branch.trim() && form.branch.trim() !== user?.branch) changes.branch = form.branch.trim();
    if (form.cgpa !== "" && Number(form.cgpa) !== user?.cgpa) changes.cgpa = Number(form.cgpa);
    if (form.backlogCount !== "" && Number(form.backlogCount) !== user?.backlogCount) changes.backlogCount = Number(form.backlogCount);

    if (Object.keys(changes).length === 0) {
      addToast("No changes detected", "info");
      return;
    }
    setSubmitting(true);
    try {
      const res = (await submitProfileEditRequest(changes)) as { request: EditRequest };
      setRequest(res.request);
      setEditOpen(false);
      addToast("Edit request submitted — waiting for TPO approval", "success");
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Submission failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResumeChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { addToast("PDF files only", "error"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("resume", file);
      await uploadStudentResume(fd);
      await refreshUser();
      addToast("Resume uploaded", "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleViewResume = async () => {
    try {
      const url = await getResumeUrl();
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      addToast("Could not load resume", "error");
    }
  };

  const f = (field: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const hasPendingRequest = request?.status === "pending";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-manrope font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Your academic details and placement profile.</p>
        </div>
        <button
          type="button"
          onClick={openEdit}
          disabled={hasPendingRequest}
          title={hasPendingRequest ? "You have a pending edit request" : "Edit profile"}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          <Pencil size={15} /> Edit profile
        </button>
      </div>

      {/* Top row — avatar card + resume card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Avatar + identity */}
        <div className="card flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl shrink-0">
            {user?.name?.[0]?.toUpperCase() || "S"}
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-gray-900 truncate">{user?.name}</p>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Resume card */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Resume</h2>
          <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleResumeChange} disabled={uploading} />
          {user?.hasResume ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200">
              <div className="flex items-center gap-2.5">
                <FileCheck size={18} className="text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-700">Resume uploaded</p>
                  <p className="text-xs text-green-600">PDF · Cloudinary</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleViewResume}
                  className="flex items-center gap-1 text-xs font-medium text-green-700 hover:underline">
                  View <ExternalLink size={11} />
                </button>
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="text-xs px-3 py-1.5 rounded-lg border border-green-300 text-green-700 hover:bg-green-100 transition-colors">
                  {uploading ? "Uploading…" : "Replace"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2.5">
                <AlertCircle size={18} className="text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-700">No resume</p>
                  <p className="text-xs text-amber-600">Required to apply</p>
                </div>
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="btn-primary flex items-center gap-1.5 text-xs px-3 py-2 disabled:opacity-60">
                {uploading ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
                {uploading ? "Uploading…" : "Upload PDF"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Academic details — full width */}
      <div className="card">
        <h2 className="text-base font-bold text-gray-900 mb-4">Academic Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: BookOpen,      label: "Department",     value: user?.department },
            { icon: Hash,          label: "Section",        value: user?.section },
            { icon: GraduationCap, label: "Branch",         value: user?.branch },
            { icon: Mail,          label: "Email",          value: user?.email },
            { icon: AlertCircle,   label: "CGPA",           value: user?.cgpa != null ? String(user.cgpa) : undefined },
            { icon: AlertCircle,   label: "Active Backlogs",value: String(user?.backlogCount ?? 0) },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1.5">
                <item.icon size={13} className="text-gray-400" />
                <span className="text-xs text-gray-400 font-medium">{item.label}</span>
              </div>
              <p className={`text-sm font-bold ${!item.value ? "text-red-400" : "text-gray-900"}`}>
                {item.value || "Not set"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit request status */}
      {!requestLoading && request && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">Profile Edit Request</h2>
            <StatusBadge status={request.status} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
            {Object.entries(request.changes).map(([key, val]) => (
              <div key={key} className="bg-gray-50 rounded-lg px-3 py-2 text-sm border border-gray-100">
                <span className="text-gray-400 text-xs block">{FIELD_LABELS[key] || key}</span>
                <p className="font-semibold text-gray-800 mt-0.5">{String(val)}</p>
              </div>
            ))}
          </div>
          {request.reviewNote && (
            <p className="text-xs text-gray-500 italic">TPO note: {request.reviewNote}</p>
          )}
          {request.status === "pending" && (
            <p className="text-xs text-amber-600 mt-2">Under review — you cannot submit another request until this is resolved.</p>
          )}
        </div>
      )}

      {/* Edit modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setEditOpen(false)} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
              <h3 className="text-lg font-manrope font-bold text-gray-900 mb-1">Edit Profile</h3>
              <p className="text-sm text-gray-500 mb-5">Changes will be sent to your TPO for approval before taking effect.</p>
              <form onSubmit={handleSubmitEdit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { field: "name" as const,         label: "Full Name",       type: "text",   placeholder: "Your full name",        colSpan: true },
                    { field: "department" as const,   label: "Department",      type: "text",   placeholder: "e.g. CSE",              colSpan: false },
                    { field: "section" as const,      label: "Section",         type: "text",   placeholder: "e.g. A",                colSpan: false },
                    { field: "branch" as const,       label: "Branch",          type: "text",   placeholder: "e.g. Computer Science", colSpan: false },
                    { field: "cgpa" as const,         label: "CGPA",            type: "number", placeholder: "e.g. 8.5",              colSpan: false },
                    { field: "backlogCount" as const, label: "Active Backlogs", type: "number", placeholder: "0",                    colSpan: false },
                  ].map((item) => (
                    <div key={item.field} className={item.colSpan ? "col-span-2" : ""}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{item.label}</label>
                      <input
                        type={item.type}
                        step={item.field === "cgpa" ? "0.01" : undefined}
                        min={item.field === "cgpa" ? "0" : item.field === "backlogCount" ? "0" : undefined}
                        max={item.field === "cgpa" ? "10" : undefined}
                        value={form[item.field]}
                        onChange={f(item.field)}
                        placeholder={item.placeholder}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setEditOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60 flex items-center gap-2">
                    {submitting && <Loader2 size={15} className="animate-spin" />}
                    {submitting ? "Submitting…" : "Submit for approval"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;

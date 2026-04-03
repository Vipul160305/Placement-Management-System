import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Loader2, Users, ChevronDown, FileText } from "lucide-react";
import Badge from "../../components/ui/Badge";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { listApplications, updateApplicationStatus, getStudentResumeUrl } from "../../services/api";
import ConfirmModal from "../../components/ui/ConfirmModal";

type AppStatus = "applied" | "shortlisted" | "offered" | "rejected" | "withdrawn";

interface StudentRow {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  department?: string;
  section?: string;
  cgpa?: number;
  hasResume?: boolean;
}

interface DriveRow {
  title?: string;
  company?: { name?: string };
}

interface ApplicationRow {
  id?: string;
  _id?: string;
  status: AppStatus;
  student?: StudentRow;
  drive?: DriveRow;
  updatedAt?: string;
}

function appId(a: ApplicationRow) {
  return (a.id || a._id) as string;
}

function formatDate(d: string | undefined) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString(); } catch { return "—"; }
}

// What statuses each role can transition to
const ROLE_TRANSITIONS: Record<string, AppStatus[]> = {
  tpo:   ["shortlisted", "offered", "rejected"],
  admin: ["shortlisted", "offered", "rejected"],
  hr:    ["shortlisted", "offered", "rejected"],
};

const STATUS_LABEL: Record<AppStatus, string> = {
  applied:     "Applied",
  shortlisted: "Shortlisted",
  offered:     "Offered",
  rejected:    "Rejected",
  withdrawn:   "Withdrawn",
};

const FILTER_TABS: { key: AppStatus | "all"; label: string }[] = [
  { key: "all",         label: "All" },
  { key: "applied",     label: "Applied" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "offered",     label: "Offered" },
  { key: "rejected",    label: "Rejected" },
];

const ApplicationsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppStatus | "all">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ app: ApplicationRow; next: AppStatus } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await listApplications()) as { applications?: ApplicationRow[] };
      setApplications(res.applications || []);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load applications";
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const transitions = ROLE_TRANSITIONS[user?.role || ""] || [];

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      const name = app.student?.name?.toLowerCase() || "";
      const email = app.student?.email?.toLowerCase() || "";
      const dept = app.student?.department?.toLowerCase() || "";
      const company = app.drive?.company?.name?.toLowerCase() || "";
      const title = app.drive?.title?.toLowerCase() || "";
      const q = search.toLowerCase();
      const matchSearch = !q || name.includes(q) || email.includes(q) || dept.includes(q) || company.includes(q) || title.includes(q);
      const matchStatus = statusFilter === "all" || app.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [applications, search, statusFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: applications.length };
    for (const tab of FILTER_TABS) {
      if (tab.key !== "all") c[tab.key] = applications.filter((a) => a.status === tab.key).length;
    }
    return c;
  }, [applications]);

  const handleStatusChange = async (app: ApplicationRow, next: AppStatus) => {
    const id = appId(app);
    if (!id || app.status === next) return;
    // Offer and reject need confirmation — shortlist is reversible so no confirm needed
    if (next === "offered" || next === "rejected") {
      setConfirmAction({ app, next });
      return;
    }
    await doStatusChange(app, next);
  };

  const doStatusChange = async (app: ApplicationRow, next: AppStatus) => {
    const id = appId(app);
    if (!id) return;
    setUpdatingId(id);
    try {
      await updateApplicationStatus(id, next);
      setApplications((prev) =>
        prev.map((a) => (appId(a) === id ? { ...a, status: next } : a))
      );
      addToast(`Status updated to ${STATUS_LABEL[next]}`, "success");
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Update failed", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const isTerminal = (s: AppStatus) => ["offered", "rejected", "withdrawn"].includes(s);

  const handleViewResume = async (studentId: string) => {
    try {
      const url = await getStudentResumeUrl(studentId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      addToast("No resume uploaded by this student", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-manrope font-bold text-gray-900">Applications</h1>
        <p className="text-gray-500 mt-1">Review and update student application statuses.</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 border-b border-gray-200 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              statusFilter === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
              statusFilter === tab.key ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"
            }`}>
              {counts[tab.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student name, email, department or company…"
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {loading ? (
        <div className="card flex items-center justify-center gap-2 py-12 text-gray-500">
          <Loader2 className="animate-spin" size={22} /> Loading applications…
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          No applications found.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => {
            const id = appId(app);
            const companyName = app.drive?.company?.name || "—";
            const driveTitle = app.drive?.title || "—";
            const student = app.student;
            const terminal = isTerminal(app.status);
            const isUpdating = updatingId === id;

            return (
              <div key={id} className="card">
                <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                  {/* Student info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      {student?.name?.[0] || "?"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900">{student?.name || "—"}</span>
                        <Badge variant={app.status}>{STATUS_LABEL[app.status]}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{student?.email || "—"}</p>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                        {student?.department && <span>{student.department}{student.section ? ` · ${student.section}` : ""}</span>}
                        {student?.cgpa !== undefined && <span>CGPA {student.cgpa}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Drive info */}
                  <div className="flex-1 min-w-0 md:text-right">
                    <p className="font-medium text-gray-800 text-sm truncate">{companyName}</p>
                    <p className="text-xs text-gray-500 truncate">{driveTitle}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Updated {formatDate(app.updatedAt)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {/* Resume button */}
                    {(student?.id || student?._id) && (
                      <button
                        type="button"
                        onClick={() => handleViewResume((student.id || student._id) as string)}
                        title="View resume"
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <FileText size={14} /> Resume
                      </button>
                    )}
                    {!terminal && transitions.length > 0 && (
                      <div className="relative group inline-block">
                        <button
                          type="button"
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
                        >
                          {isUpdating ? <Loader2 size={14} className="animate-spin" /> : null}
                          Update status <ChevronDown size={14} />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-10 hidden group-hover:block">
                          {transitions.map((next) => (
                            <button
                              key={next}
                              type="button"
                              disabled={app.status === next || isUpdating}
                              onClick={() => handleStatusChange(app, next)}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl disabled:opacity-40 disabled:cursor-not-allowed capitalize"
                            >
                              {STATUS_LABEL[next]}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={async () => {
          if (!confirmAction) return;
          await doStatusChange(confirmAction.app, confirmAction.next);
          setConfirmAction(null);
        }}
        title={confirmAction?.next === "offered" ? "Confirm Offer" : "Confirm Rejection"}
        message={`Are you sure you want to mark ${confirmAction?.app.student?.name || "this student"} as ${STATUS_LABEL[confirmAction?.next ?? "offered"]}?`}
        subMessage="This is a terminal status and cannot be changed afterwards."
        confirmLabel={confirmAction?.next === "offered" ? "Yes, offer" : "Yes, reject"}
        danger={confirmAction?.next === "rejected"}
        loading={!!updatingId}
      />
    </div>
  );
};

export default ApplicationsPage;

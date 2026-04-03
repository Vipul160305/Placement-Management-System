import { useState, useEffect, useCallback } from "react";
import { Loader2, Users, CheckCircle2, XCircle, Clock } from "lucide-react";
import Badge from "../../components/ui/Badge";
import { useToast } from "../../context/ToastContext";
import { listProfileEditRequests, reviewProfileEditRequest } from "../../services/api";
import ConfirmModal from "../../components/ui/ConfirmModal";

type RequestStatus = "pending" | "approved" | "rejected";

interface StudentRow { name?: string; email?: string; department?: string; section?: string; branch?: string; cgpa?: number; backlogCount?: number }
interface EditRequest {
  id?: string; _id?: string;
  status: RequestStatus;
  changes: Record<string, unknown>;
  student?: StudentRow;
  reviewNote?: string;
  createdAt?: string;
}

const FIELD_LABELS: Record<string, string> = {
  name: "Full Name", department: "Department", section: "Section",
  branch: "Branch", cgpa: "CGPA", backlogCount: "Active Backlogs",
};

function reqId(r: EditRequest) { return (r.id || r._id) as string; }
function formatDate(d?: string) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString(); } catch { return "—"; }
}

const TABS: { key: RequestStatus | "all"; label: string }[] = [
  { key: "pending",  label: "Pending"  },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const ProfileRequests = () => {
  const { addToast } = useToast();
  const [requests, setRequests] = useState<EditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<RequestStatus>("pending");
  const [confirm, setConfirm] = useState<{ req: EditRequest; action: "approve" | "reject" } | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const load = useCallback(async (status: RequestStatus) => {
    setLoading(true);
    try {
      const res = (await listProfileEditRequests(status)) as { requests?: EditRequest[] };
      setRequests(res.requests || []);
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Failed to load requests", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(tab); }, [load, tab]);

  const handleReview = async () => {
    if (!confirm) return;
    setProcessing(true);
    try {
      await reviewProfileEditRequest(reqId(confirm.req), confirm.action, reviewNote || undefined);
      addToast(confirm.action === "approve" ? "Profile updated and approved" : "Request rejected", confirm.action === "approve" ? "success" : "info");
      setConfirm(null);
      setReviewNote("");
      load(tab);
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Action failed", "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-manrope font-bold text-gray-900">Profile Edit Requests</h1>
        <p className="text-gray-500 mt-1">Review and approve student profile change requests.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {TABS.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key as RequestStatus)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card flex items-center justify-center gap-2 py-12 text-gray-500">
          <Loader2 className="animate-spin" size={22} /> Loading…
        </div>
      ) : requests.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          No {tab} requests.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const id = reqId(req);
            const student = req.student;
            return (
              <div key={id} className="card">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Student info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      {student?.name?.[0] || "?"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900">{student?.name || "—"}</span>
                        <Badge variant={req.status}>{req.status}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{student?.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Submitted {formatDate(req.createdAt)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  {req.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <button type="button"
                        onClick={() => { setConfirm({ req, action: "reject" }); setReviewNote(""); }}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                        <XCircle size={14} /> Reject
                      </button>
                      <button type="button"
                        onClick={() => { setConfirm({ req, action: "approve" }); setReviewNote(""); }}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-green-300 text-green-700 hover:bg-green-50 transition-colors">
                        <CheckCircle2 size={14} /> Approve
                      </button>
                    </div>
                  )}
                </div>

                {/* Requested changes */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 font-medium mb-2">Requested changes</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(req.changes).map(([key, val]) => {
                      const currentVal = student?.[key as keyof StudentRow];
                      return (
                        <div key={key} className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
                          <span className="text-gray-400 text-xs block">{FIELD_LABELS[key] || key}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {currentVal !== undefined && (
                              <span className="text-gray-400 line-through text-xs">{String(currentVal)}</span>
                            )}
                            <span className="font-semibold text-gray-800">{String(val)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {req.reviewNote && (
                    <p className="text-xs text-gray-500 mt-2 italic">Note: {req.reviewNote}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm modal with optional note */}
      {confirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setConfirm(null)} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-base font-manrope font-bold text-gray-900 mb-1">
                {confirm.action === "approve" ? "Approve Request" : "Reject Request"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {confirm.action === "approve"
                  ? `This will update ${confirm.req.student?.name}'s profile immediately.`
                  : `The student's profile will remain unchanged.`}
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note to student <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder={confirm.action === "approve" ? "e.g. Verified with records" : "e.g. CGPA mismatch with records"}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setConfirm(null)} disabled={processing}
                  className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50">
                  Cancel
                </button>
                <button type="button" onClick={handleReview} disabled={processing}
                  className={`px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 flex items-center gap-2 ${
                    confirm.action === "approve" ? "bg-green-600 text-white hover:bg-green-700" : "bg-red-600 text-white hover:bg-red-700"
                  }`}>
                  {processing && <Loader2 size={14} className="animate-spin" />}
                  {confirm.action === "approve" ? "Approve" : "Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileRequests;

import { useState, useEffect, useCallback } from "react";
import { Users, CheckCircle2, Trophy, XCircle, Briefcase } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { listApplications, listDrives } from "../../services/api";
import { useNavigate } from "react-router-dom";

interface AppRow { status: string }
interface DriveRow { id: string; title?: string; status?: string; scheduledAt?: string }

const HRDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, shortlisted: 0, offered: 0, rejected: 0 });
  const [drives, setDrives] = useState<DriveRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [appsRes, drivesRes] = await Promise.all([
        listApplications() as Promise<{ applications?: AppRow[] }>,
        listDrives() as Promise<{ drives?: DriveRow[] }>,
      ]);
      const apps = appsRes.applications || [];
      setStats({
        total: apps.length,
        shortlisted: apps.filter((a) => a.status === "shortlisted").length,
        offered: apps.filter((a) => a.status === "offered").length,
        rejected: apps.filter((a) => a.status === "rejected").length,
      });
      setDrives((drivesRes.drives || []).slice(0, 5));
    } catch {
      // silently fail — stats are non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-manrope font-bold text-gray-900">HR Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name}. Here's your hiring overview.</p>
        </div>
        <button onClick={() => navigate("/hr/applications")} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <Users size={18} /> View Applications
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Applications", value: stats.total, icon: Briefcase, color: "text-primary", bg: "bg-primary/10" },
          { label: "Shortlisted", value: stats.shortlisted, icon: CheckCircle2, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Offered", value: stats.offered, icon: Trophy, color: "text-green-600", bg: "bg-green-50" },
          { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className="card !p-4">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div className={`text-2xl font-bold ${loading ? "text-gray-300" : "text-gray-900"}`}>
              {loading ? "—" : s.value}
            </div>
            <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-lg font-bold mb-4">Your Company's Drives</h2>
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading…</div>
        ) : drives.length === 0 ? (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            No drives found for your company yet.
          </div>
        ) : (
          <div className="space-y-3">
            {drives.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{d.title || "Untitled drive"}</p>
                  {d.scheduledAt && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(d.scheduledAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize border ${
                  d.status === "open" ? "bg-green-50 text-green-700 border-green-200" :
                  d.status === "draft" ? "bg-slate-50 text-slate-600 border-slate-200" :
                  "bg-gray-100 text-gray-500 border-gray-200"
                }`}>{d.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HRDashboard;

import { useEffect, useState, useCallback } from "react";
import {
  Briefcase, Users, TrendingUp, BarChart2,
  Building2, UserCheck, FileText, CalendarDays,
  Loader2, Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { getDashboardStats, type DashboardStats } from "../../services/api";

function formatDate(d: string | undefined) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString(); } catch { return "—"; }
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  onClick?: () => void;
  loading?: boolean;
}

const StatCard = ({ label, value, icon: Icon, iconColor, iconBg, onClick, loading }: StatCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left p-4 rounded-xl border border-gray-200 bg-white flex items-center gap-4 transition-all duration-150 ${
      onClick ? "hover:border-primary/40 hover:shadow-sm hover:bg-primary/[0.02] cursor-pointer" : "cursor-default"
    }`}
  >
    <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
      <Icon size={20} className={iconColor} />
    </div>
    <div className="min-w-0">
      <div className="text-2xl font-bold text-gray-900 leading-tight">
        {loading ? <span className="text-gray-300">—</span> : value}
      </div>
      <div className="text-xs text-gray-500 mt-0.5 truncate">{label}</div>
    </div>
  </button>
);

const TPODashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Failed to load stats", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-manrope font-bold text-gray-900">Placement Dashboard</h1>
          <p className="text-gray-500 mt-1">Live overview of drives, students and placements.</p>
        </div>
        <button onClick={() => navigate("/tpo/create")} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus size={18} /> Create Drive
        </button>
      </div>

      {/* Two-column stats panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* LEFT — Placement stats */}
        <div className="card !p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60">
            <p className="text-sm font-semibold text-gray-700">Placement Overview</p>
            <p className="text-xs text-gray-400 mt-0.5">Click a card to navigate</p>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <StatCard
              label="Open Drives"
              value={stats?.openDrives ?? 0}
              icon={Briefcase}
              iconColor="text-primary"
              iconBg="bg-primary/10"
              onClick={() => navigate("/tpo/create")}
              loading={loading}
            />
            <StatCard
              label="Total Students"
              value={stats?.totalStudents ?? 0}
              icon={Users}
              iconColor="text-blue-600"
              iconBg="bg-blue-50"
              onClick={() => navigate("/tpo/users")}
              loading={loading}
            />
            <StatCard
              label="Offers Given"
              value={stats?.offeredCount ?? 0}
              icon={TrendingUp}
              iconColor="text-green-600"
              iconBg="bg-green-50"
              onClick={() => navigate("/tpo/applications")}
              loading={loading}
            />
            <StatCard
              label="Placement Rate"
              value={`${stats?.placementRate ?? 0}%`}
              icon={BarChart2}
              iconColor="text-amber-600"
              iconBg="bg-amber-50"
              onClick={() => navigate("/tpo/stats")}
              loading={loading}
            />
          </div>
        </div>

        {/* RIGHT — System stats */}
        <div className="card !p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60">
            <p className="text-sm font-semibold text-gray-700">System Overview</p>
            <p className="text-xs text-gray-400 mt-0.5">Click a card to navigate</p>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <StatCard
              label="Total Drives"
              value={stats?.totalDrives ?? 0}
              icon={Briefcase}
              iconColor="text-gray-600"
              iconBg="bg-gray-100"
              onClick={() => navigate("/tpo/create")}
              loading={loading}
            />
            <StatCard
              label="Applications"
              value={stats?.totalApplications ?? 0}
              icon={FileText}
              iconColor="text-indigo-600"
              iconBg="bg-indigo-50"
              onClick={() => navigate("/tpo/applications")}
              loading={loading}
            />
            <StatCard
              label="TPO Officers"
              value={stats?.totalTPO ?? 0}
              icon={UserCheck}
              iconColor="text-cyan-600"
              iconBg="bg-cyan-50"
              onClick={() => navigate("/tpo/users")}
              loading={loading}
            />
            <StatCard
              label="Company HRs"
              value={stats?.totalHR ?? 0}
              icon={Building2}
              iconColor="text-violet-600"
              iconBg="bg-violet-50"
              onClick={() => navigate("/tpo/companies")}
              loading={loading}
            />
          </div>
        </div>

      </div>

      {/* Past drives */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Past Drives</h2>
          <button
            type="button"
            onClick={() => navigate("/tpo/create")}
            className="text-xs text-primary font-medium hover:underline"
          >
            View all →
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-gray-400">
            <Loader2 className="animate-spin" size={20} /> Loading…
          </div>
        ) : !stats?.pastDrives?.length ? (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            No closed drives yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left font-semibold rounded-l-lg">Company</th>
                  <th className="px-4 py-3 text-left font-semibold">Drive</th>
                  <th className="px-4 py-3 text-left font-semibold">Role</th>
                  <th className="px-4 py-3 text-left font-semibold">Package</th>
                  <th className="px-4 py-3 text-left font-semibold rounded-r-lg">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.pastDrives.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {typeof d.company === "object" ? d.company?.name : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{d.title || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{d.jobRole || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{d.package || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={12} />
                        {formatDate(d.scheduledAt || d.updatedAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default TPODashboard;

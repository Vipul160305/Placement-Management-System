import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getTPOAnalytics, type TPOAnalyticsResult } from "../../services/api";
import { Loader2, TrendingUp, Users, Target } from "lucide-react";

const Analytics = () => {
  const [data, setData] = useState<TPOAnalyticsResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        const stats = await getTPOAnalytics();
        if (mounted) {
          setData(stats);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load analytics", error);
        setLoading(false);
      }
    };
    fetchStats();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center text-primary">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-medium text-gray-500">Loading placement analytics...</p>
      </div>
    );
  }

  if (!data) return null;

  const totalStudents = data.placementStatus.reduce((acc, curr) => acc + curr.value, 0);
  const placedStudents = data.placementStatus.find((s) => s.name === "Placed")?.value || 0;
  const placementPercentage = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-manrope font-bold text-gray-900">Placement Analytics</h1>
        <p className="text-gray-500 mt-1">Detailed breakdown of campus placement performance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card !p-5 border-l-4 border-l-primary">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Users size={20} />
            </div>
            <h3 className="text-gray-500 font-medium">Total Eligible</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalStudents}</div>
        </div>

        <div className="card !p-5 border-l-4 border-l-green-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <Target size={20} />
            </div>
            <h3 className="text-gray-500 font-medium">Offers Generated</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">{placedStudents}</div>
        </div>

        <div className="card !p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-gray-500 font-medium">Placement Rate</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">{placementPercentage}%</div>
        </div>
      </div>

      {/* Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="card lg:col-span-1">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Overall Status</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.placementStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.placementStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} Students`, "Count"]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Department-wise Breakdown</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.departmentStats} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="dept"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} dx={-10} />
                <Tooltip
                  cursor={{ fill: "#f3f4f6" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: "20px" }} />
                <Bar dataKey="total" name="Total Eligible" fill="#9ca3af" radius={[4, 4, 0, 0]} opacity={0.3} barSize={30} />
                <Bar dataKey="placed" name="Placed Students" fill="#003466" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

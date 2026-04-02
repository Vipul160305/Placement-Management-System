import type { ReactNode } from "react";

const variants: Record<string, string> = {
  applied: "bg-blue-50 text-blue-700 border-blue-200",
  shortlisted: "bg-amber-50 text-amber-700 border-amber-200",
  offered: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  open: "bg-green-50 text-green-700 border-green-200",
  draft: "bg-slate-50 text-slate-600 border-slate-200",
  closed: "bg-gray-100 text-gray-500 border-gray-200",
  withdrawn: "bg-gray-100 text-gray-600 border-gray-200",
  active: "bg-green-50 text-green-700 border-green-200",
  inactive: "bg-red-50 text-red-600 border-red-200",
  eligible: "bg-blue-50 text-blue-700 border-blue-200",
  ineligible: "bg-red-50 text-red-600 border-red-200",
  student: "bg-violet-50 text-violet-700 border-violet-200",
  tpo: "bg-cyan-50 text-cyan-700 border-cyan-200",
  coordinator: "bg-indigo-50 text-indigo-700 border-indigo-200",
  admin: "bg-orange-50 text-orange-700 border-orange-200",
};

const Badge = ({ variant, children }: { variant: string; children: ReactNode }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${variants[variant] || "bg-gray-100 text-gray-600 border-gray-200"}`}
  >
    {children}
  </span>
);

export default Badge;

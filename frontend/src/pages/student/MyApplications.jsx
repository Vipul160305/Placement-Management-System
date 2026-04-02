import { useState } from 'react';
import { CheckCircle2, Circle, Clock, Trophy, XCircle, Briefcase } from 'lucide-react';
import { mockApplications } from '../../data/mockData';
import Badge from '../../components/ui/Badge';

const STATUS_FLOW = ['applied', 'shortlisted', 'offered'];

const STATUS_CONFIG = {
  applied:     { label: 'Applied',     icon: Clock,        color: 'text-blue-500',  bg: 'bg-blue-50',  border: 'border-blue-200' },
  shortlisted: { label: 'Shortlisted', icon: CheckCircle2, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
  offered:     { label: 'Offer Received', icon: Trophy,    color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
  rejected:    { label: 'Rejected',    icon: XCircle,      color: 'text-red-400',   bg: 'bg-red-50',   border: 'border-red-100' },
};

const StepTracker = ({ currentStatus }) => {
  if (currentStatus === 'rejected') {
    return (
      <div className="flex items-center gap-2 mt-4">
        <XCircle size={16} className="text-red-400" />
        <span className="text-sm text-red-500 font-medium">Application Rejected</span>
      </div>
    );
  }

  const currentIdx = STATUS_FLOW.indexOf(currentStatus);

  return (
    <div className="flex items-center gap-2 mt-4 flex-wrap">
      {STATUS_FLOW.map((step, idx) => {
        const cfg = STATUS_CONFIG[step];
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        const Icon = cfg.icon;
        return (
          <div key={step} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${done ? cfg.color : 'text-gray-300'}`}>
              {done ? <Icon size={14} /> : <Circle size={14} />}
              {cfg.label}
            </div>
            {idx < STATUS_FLOW.length - 1 && (
              <div className={`h-px w-6 sm:w-10 ${idx < currentIdx ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const MyApplications = () => {
  const [applications] = useState(mockApplications);

  const counts = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    offered: applications.filter(a => a.status === 'offered').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-manrope font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-500 mt-1">Track the status of all your placement applications.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Applied', value: counts.total, color: 'text-gray-900', bg: 'bg-white' },
          { label: 'Under Review', value: counts.applied, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Shortlisted', value: counts.shortlisted, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Offers', value: counts.offered, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(s => (
          <div key={s.label} className={`card !p-4 ${s.bg} border`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Application Cards */}
      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">
            <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
            You haven't applied to any drives yet.
          </div>
        ) : applications.map(app => {
          const cfg = STATUS_CONFIG[app.status];
          const Icon = cfg?.icon || Clock;
          return (
            <div key={app.id} className={`card border ${cfg?.border || 'border-gray-200'}`}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${cfg?.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={22} className={cfg?.color} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-900 text-base">{app.companyName}</span>
                      <Badge variant={app.status}>{STATUS_CONFIG[app.status]?.label || app.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{app.role} · ₹{app.package} LPA</p>
                    <p className="text-xs text-gray-400 mt-1">Applied on {app.appliedDate}</p>
                  </div>
                </div>
              </div>
              <StepTracker currentStatus={app.status} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyApplications;

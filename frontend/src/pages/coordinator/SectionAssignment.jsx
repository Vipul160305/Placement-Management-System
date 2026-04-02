import { useState } from 'react';
import { Plus, X, Building2, Users, CheckCircle } from 'lucide-react';
import { mockSections, mockCompanies } from '../../data/mockData';
import Badge from '../../components/ui/Badge';

const SectionAssignment = () => {
  const [sections, setSections] = useState(mockSections);
  const [companies] = useState(mockCompanies);

  const getCompany = (id) => companies.find(c => c.id === id);

  const assignCompany = (sectionId, companyId) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId && !s.companies.includes(companyId)
        ? { ...s, companies: [...s.companies, companyId] }
        : s
    ));
  };

  const removeCompany = (sectionId, companyId) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, companies: s.companies.filter(c => c !== companyId) } : s
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-manrope font-bold text-gray-900">Section-wise Company Assignment</h1>
        <p className="text-gray-500 mt-1">Assign recruiting companies to specific student sections.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card !p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{sections.length}</div>
          <div className="text-sm text-gray-500 mt-0.5">Sections</div>
        </div>
        <div className="card !p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{companies.length}</div>
          <div className="text-sm text-gray-500 mt-0.5">Companies</div>
        </div>
        <div className="card !p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{sections.reduce((acc, s) => acc + s.companies.length, 0)}</div>
          <div className="text-sm text-gray-500 mt-0.5">Total Assignments</div>
        </div>
      </div>

      {/* Section cards */}
      <div className="space-y-4">
        {sections.map(section => {
          const unassigned = companies.filter(c => !section.companies.includes(c.id));
          return (
            <div key={section.id} className="card">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {section.id.split('-')[1]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{section.label}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Users size={11} />{section.studentCount} students</span>
                      <span className="text-xs text-gray-400">Coord: {section.coordinator}</span>
                    </div>
                  </div>
                </div>
                <div>
                  {unassigned.length > 0 && (
                    <div className="flex items-center gap-2">
                      <select
                        defaultValue=""
                        onChange={e => { if (e.target.value) { assignCompany(section.id, Number(e.target.value)); e.target.value = ''; }}}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">+ Assign Company</option>
                        {unassigned.map(c => <option key={c.id} value={c.id}>{c.name} (₹{c.package} LPA)</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Assigned Companies */}
              {section.companies.length === 0 ? (
                <div className="text-center py-6 text-sm text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  No companies assigned to this section yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {section.companies.map(cId => {
                    const company = getCompany(cId);
                    if (!company) return null;
                    return (
                      <div key={cId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-primary font-bold text-sm">
                            {company.name[0]}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{company.name}</div>
                            <div className="text-xs text-gray-400">₹{company.package} LPA · Min {company.eligibility.minCGPA} CGPA</div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeCompany(section.id, cId)}
                          className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SectionAssignment;

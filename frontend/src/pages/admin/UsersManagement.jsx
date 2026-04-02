import { useState } from 'react';
import { Search, Plus, Pencil, Trash2, Users } from 'lucide-react';
import { mockUsers } from '../../data/mockData';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';

const BLANK_USER = { name: '', email: '', role: 'student', department: 'CSE', section: 'A', cgpa: '', backlogs: 0, status: 'active' };

const InputField = ({ label, type = 'text', value, onChange, required, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
    <input
      type={type} value={value} onChange={onChange} required={required} placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select value={value} onChange={onChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const UsersManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(BLANK_USER);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openAdd = () => { setEditUser(null); setForm(BLANK_USER); setModalOpen(true); };
  const openEdit = (u) => { setEditUser(u); setForm({ ...u, cgpa: u.cgpa ?? '' }); setModalOpen(true); };

  const handleSave = (e) => {
    e.preventDefault();
    if (editUser) {
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...form, id: u.id, cgpa: form.cgpa === '' ? null : Number(form.cgpa) } : u));
    } else {
      setUsers(prev => [...prev, { ...form, id: Date.now(), cgpa: form.cgpa === '' ? null : Number(form.cgpa), backlogs: Number(form.backlogs) }]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id) => { setUsers(prev => prev.filter(u => u.id !== id)); setDeleteConfirm(null); };

  const f = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-manrope font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage all users — students, TPOs, and coordinators.</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus size={18} /> Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['student', 'tpo', 'coordinator', 'admin'].map(role => (
          <div key={role} className="card !p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === role).length}</div>
            <div className="text-sm text-gray-500 capitalize mt-0.5">{role}s</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card !p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..." 
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="tpo">TPO</option>
          <option value="coordinator">Coordinators</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
          <Users size={18} className="text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">{filtered.length} Users</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Role</th>
                <th className="px-4 py-3 text-left font-semibold">Dept.</th>
                <th className="px-4 py-3 text-left font-semibold">CGPA</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">No users found.</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3"><Badge variant={u.role}>{u.role}</Badge></td>
                  <td className="px-4 py-3 text-gray-500">{u.department}{u.section !== '-' ? `-${u.section}` : ''}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{u.cgpa ?? '—'}</td>
                  <td className="px-4 py-3"><Badge variant={u.status}>{u.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors" title="Edit">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteConfirm(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editUser ? 'Edit User' : 'Add New User'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Full Name" value={form.name} onChange={f('name')} required placeholder="e.g. Arjun Sharma" />
            <InputField label="Email" type="email" value={form.email} onChange={f('email')} required placeholder="user@institute.edu" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Role" value={form.role} onChange={f('role')} options={[
              { value: 'student', label: 'Student' }, { value: 'tpo', label: 'TPO' },
              { value: 'coordinator', label: 'Coordinator' }, { value: 'admin', label: 'Admin' }
            ]} />
            <SelectField label="Status" value={form.status} onChange={f('status')} options={[
              { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }
            ]} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <SelectField label="Department" value={form.department} onChange={f('department')} options={[
              'CSE','ECE','IT','MECH','CIVIL'].map(d => ({ value: d, label: d }))} />
            <SelectField label="Section" value={form.section} onChange={f('section')} options={[
              'A','B','C','-'].map(s => ({ value: s, label: s }))} />
            <InputField label="CGPA" type="number" value={form.cgpa} onChange={f('cgpa')} placeholder="e.g. 8.5" />
          </div>
          <InputField label="Active Backlogs" type="number" value={form.backlogs} onChange={f('backlogs')} placeholder="0" />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="btn-primary">{editUser ? 'Save Changes' : 'Create User'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete User" size="sm">
        <p className="text-gray-600 text-sm mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default UsersManagement;

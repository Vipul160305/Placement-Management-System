import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Plus, Pencil, Trash2, Users, Upload } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { listUsers, createUser, updateUser, deleteUser, importStudentsCsv } from '../../services/api';

const BLANK_USER = {
  name: '',
  email: '',
  password: '',
  role: 'student',
  department: 'CSE',
  section: 'A',
  cgpa: '',
  backlogs: '0',
};

const InputField = ({ label, type = 'text', value, onChange, required, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

function buildPayload(form, editUser) {
  const payload = {
    name: form.name.trim(),
    email: form.email.trim(),
    role: form.role,
  };
  if (form.department && form.department !== '-') payload.department = form.department;
  if (form.section && form.section !== '-') payload.section = form.section;
  const cg = form.cgpa === '' ? undefined : Number(form.cgpa);
  if (cg !== undefined && !Number.isNaN(cg)) payload.cgpa = cg;
  payload.backlogCount = Number(form.backlogs);
  if (Number.isNaN(payload.backlogCount)) payload.backlogCount = 0;
  if (!editUser) {
    payload.password = form.password;
  } else if (form.password?.trim()) {
    payload.password = form.password.trim();
  }
  return payload;
}

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(BLANK_USER);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const loadUsers = useCallback(async () => {
    setListLoading(true);
    try {
      const { users: rows } = await listUsers();
      setUsers(rows || []);
    } catch (e) {
      addToast(e.message || 'Failed to load users', 'error');
    } finally {
      setListLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openAdd = () => {
    setEditUser(null);
    setForm(BLANK_USER);
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({
      ...BLANK_USER,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department || 'CSE',
      section: u.section || 'A',
      cgpa: u.cgpa != null ? String(u.cgpa) : '',
      backlogs: String(u.backlogCount ?? 0),
      password: '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editUser && !form.password?.trim()) {
      addToast('Password is required for new users', 'error');
      return;
    }
    try {
      const payload = buildPayload(form, editUser);
      if (editUser) {
        await updateUser(editUser.id, payload);
        addToast('User updated successfully', 'success');
      } else {
        await createUser(payload);
        addToast('User created successfully', 'success');
      }
      setModalOpen(false);
      loadUsers();
    } catch (err) {
      addToast(err.message || 'Save failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      setDeleteConfirm(null);
      addToast('User deleted', 'info');
      loadUsers();
    } catch (err) {
      addToast(err.message || 'Delete failed', 'error');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await importStudentsCsv(file);
      addToast(`Imported ${res.imported} students. ${res.failed} rows failed.`, res.failed ? 'warning' : 'success');
      if (res.rowErrors?.length) {
        const sample = res.rowErrors.slice(0, 3).map((r) => `Row ${r.row}: ${r.message}`).join('; ');
        addToast(sample, 'info', 6000);
      }
      loadUsers();
    } catch (err) {
      addToast(err.message || 'Import failed', 'error');
    }
    e.target.value = '';
  };

  const f = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-manrope font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage all users — students, TPOs, and coordinators.</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors whitespace-nowrap"
          >
            <Upload size={18} /> Import CSV
          </button>
          <button type="button" onClick={openAdd} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus size={18} /> Add User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {['student', 'tpo', 'coordinator', 'admin'].map((role) => (
          <div key={role} className="card !p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{users.filter((u) => u.role === role).length}</div>
            <div className="text-sm text-gray-500 capitalize mt-0.5">{role}s</div>
          </div>
        ))}
      </div>

      <div className="card !p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="tpo">TPO</option>
          <option value="coordinator">Coordinators</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
          <Users size={18} className="text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">
            {listLoading ? 'Loading…' : `${filtered.length} Users`}
          </span>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Role</th>
                <th className="px-4 py-3 text-left font-semibold">Dept.</th>
                <th className="px-4 py-3 text-left font-semibold">CGPA</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Loading users…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{u.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={u.role}>{u.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {u.department || '—'}
                      {u.section && u.section !== '-' ? `-${u.section}` : ''}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium whitespace-nowrap">{u.cgpa ?? '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(u.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editUser ? 'Edit User' : 'Add New User'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Full Name" value={form.name} onChange={f('name')} required placeholder="e.g. Arjun Sharma" />
            <InputField label="Email" type="email" value={form.email} onChange={f('email')} required placeholder="user@institute.edu" />
          </div>
          <InputField
            label={editUser ? 'New password (optional)' : 'Password'}
            type="password"
            value={form.password}
            onChange={f('password')}
            required={!editUser}
            placeholder="••••••••"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Role"
              value={form.role}
              onChange={f('role')}
              options={[
                { value: 'student', label: 'Student' },
                { value: 'tpo', label: 'TPO' },
                { value: 'coordinator', label: 'Coordinator' },
                { value: 'admin', label: 'Admin' },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SelectField
              label="Department"
              value={form.department}
              onChange={f('department')}
              options={['CSE', 'ECE', 'IT', 'MECH', 'CIVIL', '-'].map((d) => ({ value: d, label: d }))}
            />
            <SelectField
              label="Section"
              value={form.section}
              onChange={f('section')}
              options={['A', 'B', 'C', '-'].map((s) => ({ value: s, label: s }))}
            />
            <InputField label="CGPA" type="number" value={form.cgpa} onChange={f('cgpa')} placeholder="e.g. 8.5" />
          </div>
          <InputField label="Active backlogs" type="number" value={form.backlogs} onChange={f('backlogs')} placeholder="0" />
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 sm:pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 w-full sm:w-auto">
              Cancel
            </button>
            <button type="submit" className="btn-primary w-full sm:w-auto">
              {editUser ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete User" size="sm">
        <p className="text-gray-600 text-sm mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button type="button" onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 w-full sm:w-auto">
            Cancel
          </button>
          <button type="button" onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 w-full sm:w-auto">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default UsersManagement;

import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const DEPT_OPTIONS = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'];
const BATCH_OPTIONS = ['2021-2025', '2022-2026', '2023-2027', '2024-2028'];

const initialForm = { name: '', email: '', password: '', role: 'student', studentId: '', batch: '', department: '', semester: 1, phone: '' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ role: '', search: '' });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.role)   params.role   = filter.role;
      if (filter.search) params.search = filter.search;
      const res = await api.get('/api/users', { params });
      setUsers(res.data.data);
    } catch { toast.error('Failed to load users'); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Fill all required fields');
    if (form.role === 'student' && !form.studentId) return toast.error('Student ID is required');
    setSaving(true);
    try {
      await api.post('/api/users', form);
      toast.success('User created successfully!');
      setModal(false);
      setForm(initialForm);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
    setSaving(false);
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.put(`/api/users/${id}/toggle-status`);
      toast.success(res.data.message);
      fetchUsers();
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/users/${deleteId}`);
      toast.success('User deleted');
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const badgeClass = r => r === 'admin' ? 'badge-admin' : r === 'faculty' ? 'badge-faculty' : 'badge-student';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h4 style={{ fontWeight: 800, margin: 0 }}>User Management</h4>
          <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>Manage all system users</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(initialForm); setModal(true); }}>
          <i className="fas fa-plus"></i> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body-custom" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
            <i className="fas fa-search"></i>
            <input className="form-control" placeholder="Search by name..." value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })} />
          </div>
          <select className="form-select" style={{ width: 180 }} value={filter.role} onChange={e => setFilter({ ...filter, role: e.target.value })}>
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="faculty">Faculty</option>
            <option value="student">Student</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header-custom">
          <h5>Users ({users.length})</h5>
        </div>
        {loading ? <div className="page-loader"><div className="spinner"></div></div> : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No users found</td></tr>
                ) : users.map(u => (
                  <tr key={u._id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td><span className={badgeClass(u.role)}>{u.role}</span></td>
                    <td>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: u.isActive ? '#d1fae5' : '#fee2e2', color: u.isActive ? '#065f46' : '#991b1b' }}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm" style={{ background: u.isActive ? '#fee2e2' : '#d1fae5', color: u.isActive ? '#991b1b' : '#065f46' }} onClick={() => handleToggleStatus(u._id)}>
                          <i className={`fas ${u.isActive ? 'fa-ban' : 'fa-check'}`}></i>
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => setDeleteId(u._id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h5 style={{ margin: 0, fontWeight: 700 }}>Add New User</h5>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Role *</label>
                    <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-control" placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-control" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Password *</label>
                    <input type="password" className="form-control" placeholder="Password (min 6 chars)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                  </div>
                  {form.role === 'student' && (<>
                    <div className="form-group">
                      <label className="form-label">Student ID *</label>
                      <input className="form-control" placeholder="e.g. CS001" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Semester</label>
                      <input type="number" min="1" max="8" className="form-control" value={form.semester} onChange={e => setForm({ ...form, semester: parseInt(e.target.value) })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Batch</label>
                      <select className="form-select" value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })}>
                        <option value="">Select Batch</option>
                        {BATCH_OPTIONS.map(b => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <select className="form-select" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                        <option value="">Select Department</option>
                        {DEPT_OPTIONS.map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input className="form-control" placeholder="Phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    </div>
                  </>)}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : <><i className="fas fa-check"></i> Create User</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 420 }}>
            <div className="modal-body" style={{ textAlign: 'center', padding: 32 }}>
              <i className="fas fa-exclamation-triangle" style={{ fontSize: 48, color: '#ef4444', marginBottom: 16 }}></i>
              <h5 style={{ fontWeight: 700 }}>Delete User?</h5>
              <p style={{ color: '#64748b' }}>This action is permanent and cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}><i className="fas fa-trash"></i> Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

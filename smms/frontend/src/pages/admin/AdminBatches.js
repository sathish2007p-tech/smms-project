import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const DEPT_OPTIONS = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'];
const init = { batchName: '', department: '', startYear: new Date().getFullYear(), endYear: new Date().getFullYear() + 4, currentSemester: 1 };

export default function AdminBatches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(init);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try { const r = await api.get('/api/batches'); setBatches(r.data.data); }
    catch { toast.error('Failed to load batches'); }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) { await api.put(`/api/batches/${editId}`, form); toast.success('Batch updated!'); }
      else { await api.post('/api/batches', form); toast.success('Batch created!'); }
      setModal(false); setEditId(null); setForm(init); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this batch?')) return;
    try { await api.delete(`/api/batches/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h4 style={{ fontWeight: 800, margin: 0 }}>Batch Management</h4>
          <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>Manage academic batches and classes</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(init); setEditId(null); setModal(true); }}>
          <i className="fas fa-plus"></i> Add Batch
        </button>
      </div>

      <div className="card">
        <div className="card-header-custom"><h5>Batches ({batches.length})</h5></div>
        {loading ? <div className="page-loader"><div className="spinner"></div></div> : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>Batch Name</th><th>Department</th><th>Duration</th><th>Current Sem</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {batches.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No batches found</td></tr>
                : batches.map(b => (
                  <tr key={b._id}>
                    <td><strong>{b.batchName}</strong></td>
                    <td>{b.department}</td>
                    <td>{b.startYear} – {b.endYear}</td>
                    <td><span className="badge-faculty">Sem {b.currentSemester}</span></td>
                    <td><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: b.isActive ? '#d1fae5' : '#fee2e2', color: b.isActive ? '#065f46' : '#991b1b' }}>{b.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => { setForm({ batchName: b.batchName, department: b.department, startYear: b.startYear, endYear: b.endYear, currentSemester: b.currentSemester }); setEditId(b._id); setModal(true); }}><i className="fas fa-edit"></i></button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b._id)}><i className="fas fa-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h5 style={{ margin: 0, fontWeight: 700 }}>{editId ? 'Edit' : 'Add'} Batch</h5>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Batch Name *</label>
                    <input className="form-control" placeholder="e.g. 2022-2026" value={form.batchName} onChange={e => setForm({ ...form, batchName: e.target.value })} required />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Department</label>
                    <select className="form-select" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                      <option value="">Select Department</option>
                      {DEPT_OPTIONS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Start Year</label>
                    <input type="number" className="form-control" value={form.startYear} onChange={e => setForm({ ...form, startYear: parseInt(e.target.value) })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Year</label>
                    <input type="number" className="form-control" value={form.endYear} onChange={e => setForm({ ...form, endYear: parseInt(e.target.value) })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Semester</label>
                    <select className="form-select" value={form.currentSemester} onChange={e => setForm({ ...form, currentSemester: parseInt(e.target.value) })}>
                      {[1,2,3,4,5,6,7,8].map(n => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Batch'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const DEPT_OPTIONS = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'];
const init = { subjectCode: '', subjectName: '', department: '', semester: 1, credits: 3, faculty: '' };

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(init);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [subRes, facRes] = await Promise.all([
        api.get('/api/subjects'),
        api.get('/api/users', { params: { role: 'faculty' } })
      ]);
      setSubjects(subRes.data.data);
      setFaculty(facRes.data.data);
    } catch { toast.error('Failed to load data'); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const openEdit = (s) => {
    setForm({ subjectCode: s.subjectCode, subjectName: s.subjectName, department: s.department, semester: s.semester, credits: s.credits, faculty: s.faculty?._id || '' });
    setEditId(s._id);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subjectCode || !form.subjectName || !form.department) return toast.error('Fill required fields');
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/api/subjects/${editId}`, form);
        toast.success('Subject updated!');
      } else {
        await api.post('/api/subjects', form);
        toast.success('Subject created!');
      }
      setModal(false); setEditId(null); setForm(init); fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save subject');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try { await api.delete(`/api/subjects/${id}`); toast.success('Deleted'); fetchAll(); }
    catch { toast.error('Delete failed'); }
  };

  const filtered = subjects.filter(s =>
    s.subjectName.toLowerCase().includes(search.toLowerCase()) ||
    s.subjectCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h4 style={{ fontWeight: 800, margin: 0 }}>Subject Management</h4>
          <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>Create and manage subjects</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(init); setEditId(null); setModal(true); }}>
          <i className="fas fa-plus"></i> Add Subject
        </button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body-custom">
          <div className="search-input-wrap">
            <i className="fas fa-search"></i>
            <input className="form-control" placeholder="Search subjects..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header-custom"><h5>Subjects ({filtered.length})</h5></div>
        {loading ? <div className="page-loader"><div className="spinner"></div></div> : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>Code</th><th>Subject Name</th><th>Department</th><th>Sem</th><th>Credits</th><th>Faculty</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No subjects found</td></tr>
                : filtered.map(s => (
                  <tr key={s._id}>
                    <td><code style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontSize: 13 }}>{s.subjectCode}</code></td>
                    <td><strong>{s.subjectName}</strong></td>
                    <td>{s.department}</td>
                    <td><span className="badge-faculty">{s.semester}</span></td>
                    <td>{s.credits}</td>
                    <td>{s.faculty?.name || <span style={{ color: '#94a3b8' }}>Unassigned</span>}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(s)}><i className="fas fa-edit"></i></button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s._id)}><i className="fas fa-trash"></i></button>
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
              <h5 style={{ margin: 0, fontWeight: 700 }}>{editId ? 'Edit' : 'Add'} Subject</h5>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Subject Code *</label>
                    <input className="form-control" placeholder="e.g. CS501" value={form.subjectCode} onChange={e => setForm({ ...form, subjectCode: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Credits</label>
                    <input type="number" min="1" max="6" className="form-control" value={form.credits} onChange={e => setForm({ ...form, credits: parseInt(e.target.value) })} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Subject Name *</label>
                    <input className="form-control" placeholder="Full subject name" value={form.subjectName} onChange={e => setForm({ ...form, subjectName: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department *</label>
                    <select className="form-select" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                      <option value="">Select</option>
                      {DEPT_OPTIONS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Semester</label>
                    <select className="form-select" value={form.semester} onChange={e => setForm({ ...form, semester: parseInt(e.target.value) })}>
                      {[1,2,3,4,5,6,7,8].map(n => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Assign Faculty</label>
                    <select className="form-select" value={form.faculty} onChange={e => setForm({ ...form, faculty: e.target.value })}>
                      <option value="">Unassigned</option>
                      {faculty.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Subject'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

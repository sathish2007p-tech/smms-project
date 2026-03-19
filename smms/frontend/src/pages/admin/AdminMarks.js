import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminMarks() {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filter, setFilter] = useState({ student: '', subject: '', status: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, sRes, subRes] = await Promise.all([
        api.get('/api/marks', { params: filter }),
        api.get('/api/students'),
        api.get('/api/subjects')
      ]);
      setMarks(mRes.data.data);
      setStudents(sRes.data.data);
      setSubjects(subRes.data.data);
    } catch { toast.error('Failed to load marks'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this mark record?')) return;
    try { await api.delete(`/api/marks/${id}`); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Delete failed'); }
  };

  const gradeClass = g => {
    if (g === 'O' || g === 'A+' || g === 'A') return 'grade-A';
    if (g === 'B+' || g === 'B') return 'grade-B';
    if (g === 'C') return 'grade-C';
    return 'grade-F';
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontWeight: 800, margin: 0 }}>Marks & Reports</h4>
        <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>View and manage all mark records</p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body-custom" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select className="form-select" style={{ flex: 1, minWidth: 180 }} value={filter.student} onChange={e => setFilter({ ...filter, student: e.target.value })}>
            <option value="">All Students</option>
            {students.map(s => <option key={s._id} value={s._id}>{s.studentId} - {s.name}</option>)}
          </select>
          <select className="form-select" style={{ flex: 1, minWidth: 180 }} value={filter.subject} onChange={e => setFilter({ ...filter, subject: e.target.value })}>
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectCode} - {s.subjectName}</option>)}
          </select>
          <select className="form-select" style={{ width: 160 }} value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
            <option value="">All Status</option>
            <option value="Pass">Pass</option>
            <option value="Fail">Fail</option>
            <option value="Absent">Absent</option>
          </select>
          <button className="btn btn-secondary" onClick={() => setFilter({ student: '', subject: '', status: '' })}>
            <i className="fas fa-times"></i> Clear
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header-custom"><h5>Mark Records ({marks.length})</h5></div>
        {loading ? <div className="page-loader"><div className="spinner"></div></div> : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>Student</th><th>Subject</th><th>Int1</th><th>Int2</th><th>Assign</th><th>Sem</th><th>Total</th><th>%</th><th>Grade</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {marks.length === 0 ? <tr><td colSpan={11} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No records found</td></tr>
                : marks.map(m => (
                  <tr key={m._id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{m.student?.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{m.student?.studentId}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{m.subject?.subjectCode}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{m.subject?.subjectName}</div>
                    </td>
                    <td>{m.marks?.internal1}</td>
                    <td>{m.marks?.internal2}</td>
                    <td>{m.marks?.assignment}</td>
                    <td>{m.marks?.semester}</td>
                    <td><strong>{m.totalMarks}</strong></td>
                    <td>{m.percentage}%</td>
                    <td><span className={`grade-badge ${gradeClass(m.grade)}`}>{m.grade}</span></td>
                    <td><span className={m.status === 'Pass' ? 'badge-pass' : m.status === 'Fail' ? 'badge-fail' : 'badge-absent'}>{m.status}</span></td>
                    <td>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(m._id)}><i className="fas fa-trash"></i></button>
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
}

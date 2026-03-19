import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/api/subjects'), api.get('/api/marks')]).then(([sr, mr]) => {
      setSubjects(sr.data.data);
      setMarks(mr.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;

  const passed = marks.filter(m => m.status === 'Pass').length;
  const failed = marks.filter(m => m.status === 'Fail').length;
  const passRate = marks.length > 0 ? ((passed / marks.length) * 100).toFixed(1) : 0;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontWeight: 800, margin: 0 }}>Faculty Dashboard</h4>
        <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>Welcome back, {user?.name}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'My Subjects', value: subjects.length, icon: 'fa-book', bg: '#dbeafe', color: '#1d4ed8' },
          { label: 'Mark Records', value: marks.length, icon: 'fa-star', bg: '#d1fae5', color: '#065f46' },
          { label: 'Passed', value: passed, icon: 'fa-check-circle', bg: '#d1fae5', color: '#065f46' },
          { label: 'Failed', value: failed, icon: 'fa-times-circle', bg: '#fee2e2', color: '#991b1b' },
          { label: 'Pass Rate', value: `${passRate}%`, icon: 'fa-percent', bg: '#fef3c7', color: '#92400e' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <i className={`fas ${s.icon}`} style={{ color: s.color }}></i>
            </div>
            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-header-custom"><h5>My Subjects</h5></div>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Code</th><th>Subject</th><th>Sem</th><th>Credits</th></tr></thead>
              <tbody>
                {subjects.length === 0 ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>No subjects assigned</td></tr>
                : subjects.map(s => (
                  <tr key={s._id}>
                    <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{s.subjectCode}</code></td>
                    <td>{s.subjectName}</td>
                    <td>{s.semester}</td>
                    <td>{s.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header-custom"><h5>Quick Actions</h5></div>
          <div className="card-body-custom">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Enter Marks Manually', icon: 'fa-pencil', to: '/faculty/mark-entry', color: '#1d4ed8' },
                { label: 'Batch Upload (CSV/Excel)', icon: 'fa-upload', to: '/faculty/batch-upload', color: '#065f46' },
                { label: 'View My Subjects', icon: 'fa-book', to: '/faculty/subjects', color: '#5b21b6' },
              ].map((a, i) => (
                <a key={i} href={a.to}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 10, background: a.color + '15', color: a.color, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}
                >
                  <i className={`fas ${a.icon}`}></i>{a.label}
                  <i className="fas fa-arrow-right" style={{ marginLeft: 'auto', fontSize: 12 }}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

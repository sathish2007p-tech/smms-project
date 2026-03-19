import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/marks').then(r => { setMarks(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;

  const passed  = marks.filter(m => m.status === 'Pass').length;
  const failed  = marks.filter(m => m.status === 'Fail').length;
  const avgPct  = marks.length ? (marks.reduce((s, m) => s + m.percentage, 0) / marks.length).toFixed(1) : 0;
  const student = user?.studentProfile;

  const gradeClass = g => {
    if (g === 'O' || g === 'A+' || g === 'A') return 'grade-A';
    if (g === 'B+' || g === 'B') return 'grade-B';
    if (g === 'C') return 'grade-C';
    return 'grade-F';
  };

  return (
    <div>
      {/* Profile Banner */}
      {student && (
        <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: 'white', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, flexShrink: 0 }}>
            {student.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h5 style={{ margin: 0, fontWeight: 800, fontSize: 20 }}>{student.name}</h5>
            <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: 14 }}>{student.studentId} &nbsp;·&nbsp; {student.department} &nbsp;·&nbsp; Semester {student.semester} &nbsp;·&nbsp; {student.batch}</p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Subjects', val: marks.length, icon: 'fa-book', bg: '#dbeafe', color: '#1d4ed8' },
          { label: 'Passed', val: passed, icon: 'fa-check-circle', bg: '#d1fae5', color: '#065f46' },
          { label: 'Failed', val: failed, icon: 'fa-times-circle', bg: '#fee2e2', color: '#991b1b' },
          { label: 'Avg Score', val: `${avgPct}%`, icon: 'fa-chart-line', bg: '#ede9fe', color: '#5b21b6' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><i className={`fas ${s.icon}`} style={{ color: s.color }}></i></div>
            <div><div className="stat-value">{s.val}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {marks.length > 0 && (
        <div className="card">
          <div className="card-header-custom"><h5>Recent Marks</h5><a href="/student/marks" style={{ fontSize: 13, color: '#1d4ed8', textDecoration: 'none' }}>View All →</a></div>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Subject</th><th>Total</th><th>%</th><th>Grade</th><th>Status</th></tr></thead>
              <tbody>
                {marks.slice(0, 5).map(m => (
                  <tr key={m._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{m.subject?.subjectName}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{m.subject?.subjectCode}</div>
                    </td>
                    <td>{m.totalMarks} / {m.maxMarks}</td>
                    <td>{m.percentage}%</td>
                    <td><span className={`grade-badge ${gradeClass(m.grade)}`}>{m.grade}</span></td>
                    <td><span className={m.status === 'Pass' ? 'badge-pass' : 'badge-fail'}>{m.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {marks.length === 0 && (
        <div className="card">
          <div className="empty-state" style={{ padding: '64px 24px' }}>
            <i className="fas fa-graduation-cap"></i>
            <p>No marks available yet. Check back after your faculty enters marks.</p>
          </div>
        </div>
      )}
    </div>
  );
}

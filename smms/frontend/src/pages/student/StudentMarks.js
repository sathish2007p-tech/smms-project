import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function StudentMarks() {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/marks').then(r => { setMarks(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;

  const gradeClass = g => {
    if (g === 'O' || g === 'A+' || g === 'A') return 'grade-A';
    if (g === 'B+' || g === 'B') return 'grade-B';
    if (g === 'C') return 'grade-C';
    return 'grade-F';
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontWeight: 800, margin: 0 }}>My Marks</h4>
        <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>Detailed mark sheet for all subjects</p>
      </div>
      <div className="card">
        <div className="card-header-custom"><h5>Mark Sheet ({marks.length} subjects)</h5></div>
        {marks.length === 0 ? (
          <div className="empty-state"><i className="fas fa-star"></i><p>No marks available yet</p></div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th><th>Int 1 (25)</th><th>Int 2 (25)</th><th>Assign (10)</th><th>Sem (100)</th><th>Total (160)</th><th>%</th><th>Grade</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {marks.map(m => (
                  <tr key={m._id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{m.subject?.subjectName}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{m.subject?.subjectCode} &nbsp;·&nbsp; {m.subject?.credits} credits</div>
                    </td>
                    <td>{m.isAbsent ? '—' : m.marks?.internal1}</td>
                    <td>{m.isAbsent ? '—' : m.marks?.internal2}</td>
                    <td>{m.isAbsent ? '—' : m.marks?.assignment}</td>
                    <td>{m.isAbsent ? '—' : m.marks?.semester}</td>
                    <td><strong>{m.isAbsent ? '—' : m.totalMarks}</strong></td>
                    <td>{m.isAbsent ? '—' : m.percentage + '%'}</td>
                    <td><span className={`grade-badge ${gradeClass(m.grade)}`}>{m.grade}</span></td>
                    <td><span className={m.status === 'Pass' ? 'badge-pass' : m.status === 'Absent' ? 'badge-absent' : 'badge-fail'}>{m.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grade legend */}
      <div className="card" style={{ marginTop: 16, padding: '16px 20px' }}>
        <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 13 }}>Grade Scale</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[['O', '90-100%'], ['A+', '80-89%'], ['A', '70-79%'], ['B+', '60-69%'], ['B', '50-59%'], ['C', '40-49%'], ['F', 'Below 40%']].map(([g, r]) => (
            <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className={`grade-badge ${gradeClass(g)}`}>{g}</span>
              <span style={{ fontSize: 12, color: '#64748b' }}>{r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

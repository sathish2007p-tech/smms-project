import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function FacultySubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/subjects').then(r => { setSubjects(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontWeight: 800, margin: 0 }}>My Subjects</h4>
        <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>Subjects assigned to you</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {subjects.length === 0 ? (
          <div className="empty-state"><i className="fas fa-book"></i><p>No subjects assigned to you</p></div>
        ) : subjects.map(s => (
          <div key={s._id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <code style={{ background: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: 6, fontWeight: 700, fontSize: 13 }}>{s.subjectCode}</code>
              <span className="badge-faculty">Sem {s.semester}</span>
            </div>
            <h6 style={{ fontWeight: 700, marginBottom: 8 }}>{s.subjectName}</h6>
            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b' }}>
              <span><i className="fas fa-building" style={{ marginRight: 4 }}></i>{s.department}</span>
              <span><i className="fas fa-star" style={{ marginRight: 4 }}></i>{s.credits} credits</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

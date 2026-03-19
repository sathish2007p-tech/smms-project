import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function StudentReport() {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const studentId = user?.studentProfile?._id;

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }
    api.get(`/api/reports/student/${studentId}`).then(r => { setReport(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, [studentId]);

  const handleExport = async () => {
    if (!studentId) return;
    try {
      const res = await api.get(`/api/reports/export/student/${studentId}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = url; a.download = `marksheet_${user.studentProfile.studentId}.xlsx`; a.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded!');
    } catch { toast.error('Export failed'); }
  };

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;
  if (!studentId || !report) return (
    <div className="empty-state" style={{ padding: '80px 24px' }}>
      <i className="fas fa-file-alt"></i>
      <p>Report not available. Please contact admin.</p>
    </div>
  );

  const { student, marks, summary } = report;

  const gradeClass = g => {
    if (g === 'O' || g === 'A+' || g === 'A') return 'grade-A';
    if (g === 'B+' || g === 'B') return 'grade-B';
    if (g === 'C') return 'grade-C';
    return 'grade-F';
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h4 style={{ fontWeight: 800, margin: 0 }}>My Academic Report</h4>
          <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>Complete performance summary</p>
        </div>
        <button className="btn btn-success" onClick={handleExport}>
          <i className="fas fa-file-excel"></i> Export Excel
        </button>
      </div>

      {/* Student Info */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #1e40af)', padding: '20px 24px', color: 'white', borderRadius: '12px 12px 0 0' }}>
          <h5 style={{ margin: 0, fontWeight: 800 }}>Student Performance Report</h5>
        </div>
        <div className="card-body-custom">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {[
              ['Student ID', student.studentId],
              ['Name', student.name],
              ['Department', student.department],
              ['Batch', student.batch],
              ['Semester', student.semester],
              ['Email', student.email],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Total Subjects', val: summary.totalSubjects, bg: '#dbeafe', color: '#1d4ed8' },
          { label: 'Passed',  val: summary.passed,  bg: '#d1fae5', color: '#065f46' },
          { label: 'Failed',  val: summary.failed,  bg: '#fee2e2', color: '#991b1b' },
          { label: 'CGPA',    val: summary.cgpa,    bg: '#ede9fe', color: '#5b21b6' },
          { label: 'Credits Earned', val: `${summary.earnedCredits}/${summary.totalCredits}`, bg: '#fef3c7', color: '#92400e' },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: 12, padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 11, color: s.color, opacity: 0.8 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Detailed Marks */}
      <div className="card">
        <div className="card-header-custom"><h5>Detailed Mark Sheet</h5></div>
        {marks.length === 0 ? (
          <div className="empty-state"><i className="fas fa-star"></i><p>No marks recorded yet</p></div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>Subject</th><th>Credits</th><th>Int1</th><th>Int2</th><th>Assign</th><th>Sem</th><th>Total</th><th>%</th><th>Grade</th><th>GP</th><th>Status</th></tr>
              </thead>
              <tbody>
                {marks.map(m => (
                  <tr key={m._id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{m.subject?.subjectName}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{m.subject?.subjectCode}</div>
                    </td>
                    <td>{m.subject?.credits}</td>
                    <td>{m.marks?.internal1}</td>
                    <td>{m.marks?.internal2}</td>
                    <td>{m.marks?.assignment}</td>
                    <td>{m.marks?.semester}</td>
                    <td><strong>{m.totalMarks}</strong></td>
                    <td>{m.percentage}%</td>
                    <td><span className={`grade-badge ${gradeClass(m.grade)}`}>{m.grade}</span></td>
                    <td>{m.gradePoint}</td>
                    <td><span className={m.status === 'Pass' ? 'badge-pass' : 'badge-fail'}>{m.status}</span></td>
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

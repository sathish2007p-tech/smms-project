import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CURRENT_YEAR = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

export default function FacultyMarkEntry() {
  const [subjects, setSubjects]   = useState([]);
  const [students, setStudents]   = useState([]);
  const [saving,   setSaving]     = useState(false);
  const [existing, setExisting]   = useState(null);

  const [form, setForm] = useState({
    subjectId: '', studentId: '', academicYear: CURRENT_YEAR,
    marks: { internal1: '', internal2: '', assignment: '', semester: '' },
    isAbsent: false, remarks: ''
  });

  useEffect(() => {
    api.get('/api/subjects').then(r => setSubjects(r.data.data));
  }, []);

  useEffect(() => {
    if (form.subjectId) {
      const sub = subjects.find(s => s._id === form.subjectId);
      if (sub) {
        api.get('/api/students', { params: { semester: sub.semester } })
          .then(r => setStudents(r.data.data));
      }
    }
  }, [form.subjectId]);

  // Check for existing record when student+subject+year change
  useEffect(() => {
    const { studentId, subjectId, academicYear } = form;
    if (studentId && subjectId && academicYear) {
      api.get('/api/marks', { params: { student: studentId, subject: subjectId, academicYear } })
        .then(r => {
          if (r.data.data.length > 0) {
            const m = r.data.data[0];
            setExisting(m);
            setForm(prev => ({ ...prev, marks: { internal1: m.marks.internal1, internal2: m.marks.internal2, assignment: m.marks.assignment, semester: m.marks.semester }, isAbsent: m.isAbsent, remarks: m.remarks }));
          } else {
            setExisting(null);
          }
        });
    }
  }, [form.studentId, form.subjectId, form.academicYear]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subjectId || !form.studentId) return toast.error('Select subject and student');
    setSaving(true);
    try {
      await api.post('/api/marks', {
        subjectId: form.subjectId,
        studentId: form.studentId,
        academicYear: form.academicYear,
        marks: {
          internal1:  parseFloat(form.marks.internal1  || 0),
          internal2:  parseFloat(form.marks.internal2  || 0),
          assignment: parseFloat(form.marks.assignment || 0),
          semester:   parseFloat(form.marks.semester   || 0),
        },
        isAbsent: form.isAbsent,
        remarks: form.remarks
      });
      toast.success(existing ? 'Marks updated!' : 'Marks saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save marks');
    }
    setSaving(false);
  };

  const markField = (label, key, max) => (
    <div className="form-group">
      <label className="form-label">{label} <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Max: {max})</span></label>
      <input
        type="number" min="0" max={max} step="0.5"
        className="form-control"
        placeholder={`0 - ${max}`}
        value={form.marks[key]}
        onChange={e => setForm({ ...form, marks: { ...form.marks, [key]: e.target.value } })}
        disabled={form.isAbsent}
      />
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontWeight: 800, margin: 0 }}>Enter Marks</h4>
        <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>Manually enter marks for individual students</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header-custom"><h5>Select Student & Subject</h5></div>
          <div className="card-body-custom">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <select className="form-select" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value, studentId: '' })}>
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectCode} – {s.subjectName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Academic Year</label>
                <input className="form-control" value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })} placeholder="e.g. 2024-2025" />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Student *</label>
                <select className="form-select" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} disabled={!form.subjectId}>
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.studentId} – {s.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {form.studentId && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header-custom">
              <h5>Mark Entry</h5>
              {existing && <span className="badge-faculty">Editing existing record</span>}
            </div>
            <div className="card-body-custom">
              {/* Absent toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '12px 16px', background: '#fef3c7', borderRadius: 10 }}>
                <input type="checkbox" id="absent" style={{ width: 18, height: 18 }}
                  checked={form.isAbsent} onChange={e => setForm({ ...form, isAbsent: e.target.checked })} />
                <label htmlFor="absent" style={{ cursor: 'pointer', fontWeight: 600, color: '#92400e', margin: 0 }}>
                  Mark student as Absent
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {markField('Internal Assessment 1', 'internal1', 25)}
                {markField('Internal Assessment 2', 'internal2', 25)}
                {markField('Assignment / CA', 'assignment', 10)}
                {markField('End Semester Exam', 'semester', 100)}
              </div>

              <div className="form-group">
                <label className="form-label">Remarks (Optional)</label>
                <input className="form-control" placeholder="Any additional notes..." value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} />
              </div>

              {/* Preview */}
              {!form.isAbsent && (form.marks.internal1 !== '' || form.marks.semester !== '') && (
                <div style={{ marginTop: 8, padding: '12px 16px', background: '#f0f9ff', borderRadius: 10, border: '1px solid #bae6fd' }}>
                  <p style={{ margin: 0, fontSize: 13, color: '#0369a1', fontWeight: 600 }}>
                    <i className="fas fa-calculator" style={{ marginRight: 8 }}></i>
                    Preview: Total ≈ {(parseFloat(form.marks.internal1 || 0) + parseFloat(form.marks.internal2 || 0) + parseFloat(form.marks.assignment || 0) + parseFloat(form.marks.semester || 0)).toFixed(1)} / 160
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-primary" disabled={saving || !form.studentId}>
            {saving ? 'Saving...' : <><i className="fas fa-save"></i> {existing ? 'Update Marks' : 'Save Marks'}</>}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setForm({ subjectId: '', studentId: '', academicYear: CURRENT_YEAR, marks: { internal1: '', internal2: '', assignment: '', semester: '' }, isAbsent: false, remarks: '' })}>
            <i className="fas fa-times"></i> Reset
          </button>
        </div>
      </form>
    </div>
  );
}

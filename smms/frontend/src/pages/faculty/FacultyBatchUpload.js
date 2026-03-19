import React, { useEffect, useState, useRef } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CURRENT_YEAR = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

export default function FacultyBatchUpload() {
  const [subjects, setSubjects]   = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [academicYear, setAcYear] = useState(CURRENT_YEAR);
  const [file, setFile]           = useState(null);
  const [dragging, setDragging]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult]       = useState(null);
  const fileRef = useRef();

  useEffect(() => { api.get('/api/subjects').then(r => setSubjects(r.data.data)); }, []);

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.name.match(/\.(csv|xlsx|xls)$/))) setFile(dropped);
    else toast.error('Only CSV and Excel files allowed');
  };

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file');
    if (!subjectId) return toast.error('Please select a subject');
    setUploading(true); setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('subjectId', subjectId);
      fd.append('academicYear', academicYear);
      const res = await api.post('/api/marks/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(res.data);
      toast.success(`Upload complete! ${res.data.summary.successful} records added.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
    setUploading(false);
  };

  const downloadTemplate = async () => {
    try {
      const res = await api.get('/api/marks/template', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = url; a.download = 'marks_upload_template.xlsx'; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Template download failed'); }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontWeight: 800, margin: 0 }}>Batch Upload Marks</h4>
        <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>Upload CSV or Excel file with student marks</p>
      </div>

      {/* Step 1: Download template */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header-custom"><h5>Step 1: Download Template</h5></div>
        <div className="card-body-custom">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ margin: 0, color: '#374151', fontSize: 14 }}>Download the Excel template with correct column headers.</p>
              <p style={{ margin: 0, color: '#64748b', fontSize: 13, marginTop: 4 }}>Required columns: <code>studentId, internal1, internal2, assignment, semester</code></p>
            </div>
            <button className="btn btn-secondary" onClick={downloadTemplate}>
              <i className="fas fa-download"></i> Download Template
            </button>
          </div>
          <div className="alert alert-info" style={{ marginTop: 16 }}>
            <i className="fas fa-info-circle"></i>
            <div>
              <strong>Mark Limits:</strong> Internal 1 &amp; 2: max 25 each | Assignment: max 10 | Semester Exam: max 100
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Configure */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header-custom"><h5>Step 2: Select Subject & Year</h5></div>
        <div className="card-body-custom">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Subject *</label>
              <select className="form-select" value={subjectId} onChange={e => setSubjectId(e.target.value)}>
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectCode} – {s.subjectName}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Academic Year *</label>
              <input className="form-control" value={academicYear} onChange={e => setAcYear(e.target.value)} placeholder="e.g. 2024-2025" />
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Upload */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header-custom"><h5>Step 3: Upload File</h5></div>
        <div className="card-body-custom">
          <div
            className={`upload-zone ${dragging ? 'dragover' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current.click()}
          >
            <i className={`fas ${file ? 'fa-file-excel' : 'fa-cloud-upload-alt'}`} style={{ color: file ? '#10b981' : '#94a3b8' }}></i>
            {file ? (
              <>
                <p style={{ fontWeight: 700, color: '#10b981', margin: '8px 0 4px' }}>{file.name}</p>
                <p style={{ color: '#64748b', fontSize: 13 }}>{(file.size / 1024).toFixed(1)} KB</p>
              </>
            ) : (
              <>
                <p style={{ fontWeight: 600, color: '#374151', margin: '8px 0 4px' }}>Drag & drop your file here</p>
                <p style={{ color: '#94a3b8', fontSize: 13 }}>or click to browse — CSV, XLS, XLSX accepted</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }}
            onChange={e => { if (e.target.files[0]) setFile(e.target.files[0]); }} />

          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button className="btn btn-primary" onClick={handleUpload} disabled={uploading || !file || !subjectId}>
              {uploading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span> Uploading...</> : <><i className="fas fa-upload"></i> Upload & Process</>}
            </button>
            {file && <button className="btn btn-secondary" onClick={() => { setFile(null); setResult(null); }}><i className="fas fa-times"></i> Remove File</button>}
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="card">
          <div className="card-header-custom"><h5>Upload Results</h5><span style={{ fontSize: 13, color: '#64748b' }}>Batch ID: {result.batchId}</span></div>
          <div className="card-body-custom">
            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Total Rows', val: result.summary.total, bg: '#f1f5f9', color: '#374151' },
                { label: 'Successful', val: result.summary.successful, bg: '#d1fae5', color: '#065f46' },
                { label: 'Failed', val: result.summary.failed, bg: '#fee2e2', color: '#991b1b' },
                { label: 'Duplicates', val: result.summary.duplicates, bg: '#fef3c7', color: '#92400e' },
              ].map((s, i) => (
                <div key={i} style={{ padding: '16px', borderRadius: 10, background: s.bg, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: s.color, opacity: 0.8 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Success list */}
            {result.details.success.length > 0 && (
              <details style={{ marginBottom: 12 }}>
                <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#065f46', padding: '10px', background: '#d1fae5', borderRadius: 8 }}>
                  <i className="fas fa-check-circle" style={{ marginRight: 8 }}></i>
                  {result.details.success.length} Successful Records
                </summary>
                <div style={{ marginTop: 8, maxHeight: 200, overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead><tr><th>Row</th><th>Student ID</th><th>Name</th></tr></thead>
                    <tbody>
                      {result.details.success.map((r, i) => (
                        <tr key={i}><td>{r.row}</td><td>{r.studentId}</td><td>{r.name}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            )}

            {/* Failed list */}
            {result.details.failed.length > 0 && (
              <details style={{ marginBottom: 12 }}>
                <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#991b1b', padding: '10px', background: '#fee2e2', borderRadius: 8 }}>
                  <i className="fas fa-times-circle" style={{ marginRight: 8 }}></i>
                  {result.details.failed.length} Failed Records
                </summary>
                <div style={{ marginTop: 8, maxHeight: 200, overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead><tr><th>Row</th><th>Student ID</th><th>Reason</th></tr></thead>
                    <tbody>
                      {result.details.failed.map((r, i) => (
                        <tr key={i}><td>{r.row}</td><td>{r.studentId}</td><td style={{ color: '#991b1b' }}>{r.reason}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            )}

            {/* Duplicates */}
            {result.details.duplicates.length > 0 && (
              <details>
                <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#92400e', padding: '10px', background: '#fef3c7', borderRadius: 8 }}>
                  <i className="fas fa-exclamation-circle" style={{ marginRight: 8 }}></i>
                  {result.details.duplicates.length} Duplicate Records (Skipped)
                </summary>
                <div style={{ marginTop: 8 }}>
                  <table className="data-table">
                    <thead><tr><th>Row</th><th>Student ID</th><th>Reason</th></tr></thead>
                    <tbody>
                      {result.details.duplicates.map((r, i) => (
                        <tr key={i}><td>{r.row}</td><td>{r.studentId}</td><td>{r.reason}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

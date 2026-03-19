import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin')   navigate('/admin/dashboard');
      else if (user.role === 'faculty') navigate('/faculty/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoLogins = [
    { label: 'Admin', email: 'admin@smms.com', password: 'admin123', color: '#5b21b6' },
    { label: 'Faculty', email: 'priya@smms.com', password: 'faculty123', color: '#1d4ed8' },
    { label: 'Student', email: 'arjun@smms.com', password: 'student123', color: '#065f46' },
  ];

  return (
    <div className="login-wrapper">
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div className="login-card">
          <div className="login-logo">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <h4 style={{ textAlign: 'center', fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>Welcome to SMMS</h4>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: 14, marginBottom: 32 }}>Student Mark Management System</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-envelope" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: 38 }}
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-lock" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: 38, paddingRight: 40 }}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 8, fontSize: 15 }}
              disabled={loading}
            >
              {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span> Signing in...</> : <><i className="fas fa-sign-in-alt"></i> Sign In</>}
            </button>
          </form>

          <div style={{ marginTop: 28 }}>
            <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginBottom: 12 }}>— DEMO ACCOUNTS —</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {demoLogins.map(d => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => setForm({ email: d.email, password: d.password })}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: 8, border: `1.5px solid ${d.color}`,
                    background: 'transparent', color: d.color, fontSize: 12, fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  <i className="fas fa-user" style={{ marginRight: 4 }}></i>{d.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>Click a role to auto-fill credentials</p>
          </div>
        </div>
      </div>
    </div>
  );
}

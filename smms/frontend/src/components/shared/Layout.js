import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const adminNav = [
  { label: 'MAIN', items: [
    { to: '/admin/dashboard', icon: 'fa-gauge-high', label: 'Dashboard' },
  ]},
  { label: 'MANAGEMENT', items: [
    { to: '/admin/users',    icon: 'fa-users',     label: 'Users' },
    { to: '/admin/subjects', icon: 'fa-book',      label: 'Subjects' },
    { to: '/admin/batches',  icon: 'fa-layer-group', label: 'Batches' },
  ]},
  { label: 'ACADEMICS', items: [
    { to: '/admin/marks',    icon: 'fa-star',      label: 'Marks & Reports' },
  ]},
];

const facultyNav = [
  { label: 'MAIN', items: [
    { to: '/faculty/dashboard',    icon: 'fa-gauge-high', label: 'Dashboard' },
    { to: '/faculty/subjects',     icon: 'fa-book',      label: 'My Subjects' },
  ]},
  { label: 'MARKS', items: [
    { to: '/faculty/mark-entry',   icon: 'fa-pencil',    label: 'Enter Marks' },
    { to: '/faculty/batch-upload', icon: 'fa-upload',    label: 'Batch Upload' },
  ]},
];

const studentNav = [
  { label: 'MAIN', items: [
    { to: '/student/dashboard', icon: 'fa-gauge-high', label: 'Dashboard' },
    { to: '/student/marks',     icon: 'fa-star',      label: 'My Marks' },
    { to: '/student/report',    icon: 'fa-file-alt',  label: 'My Report' },
  ]},
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navConfig = user?.role === 'admin' ? adminNav : user?.role === 'faculty' ? facultyNav : studentNav;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon"><i className="fas fa-graduation-cap"></i></div>
          <div className="sidebar-brand-text">
            <h6>SMMS</h6>
            <small>Mark Management</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navConfig.map((section, si) => (
            <div key={si}>
              <div className="sidebar-section-label">{section.label}</div>
              {section.items.map((item, ii) => (
                <NavLink
                  key={ii}
                  to={item.to}
                  className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <i className={`fas ${item.icon}`}></i>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '16px' }}>
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="topbar">
          <button
            className="btn btn-secondary btn-sm d-md-none"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className="fas fa-bars"></i>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, color: '#64748b' }}>Welcome back,</span>
            <span style={{ fontWeight: 700, color: '#1e293b' }}>{user?.name}</span>
            <span className={`badge-${user?.role}`} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

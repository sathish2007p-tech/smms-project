import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: '#f0f4f8', textAlign: 'center', padding: 24 }}>
      <div style={{ fontSize: 80, fontWeight: 900, color: '#1e40af', lineHeight: 1 }}>404</div>
      <h4 style={{ fontWeight: 800, color: '#1e293b' }}>Page Not Found</h4>
      <p style={{ color: '#64748b' }}>The page you're looking for doesn't exist.</p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>
        <i className="fas fa-home"></i> Go Home
      </button>
    </div>
  );
}

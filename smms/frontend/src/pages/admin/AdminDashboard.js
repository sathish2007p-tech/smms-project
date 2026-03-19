import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

const StatCard = ({ icon, label, value, bg, iconColor }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: bg }}>
      <i className={`fas ${icon}`} style={{ color: iconColor }}></i>
    </div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/reports/dashboard').then(r => {
      setStats(r.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-loader">
      <div className="spinner"></div>
      <p style={{ color: '#64748b' }}>Loading dashboard...</p>
    </div>
  );

  const passFailChart = {
    labels: ['Pass', 'Fail'],
    datasets: [{
      data: [stats?.passCount || 0, stats?.failCount || 0],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 0
    }]
  };

  const summaryChart = {
    labels: ['Students', 'Subjects', 'Mark Records'],
    datasets: [{
      label: 'Count',
      data: [stats?.totalStudents || 0, stats?.totalSubjects || 0, stats?.totalMarkRecords || 0],
      backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b'],
      borderRadius: 8
    }]
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontWeight: 800, color: '#1e293b', margin: 0 }}>Admin Dashboard</h4>
        <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>System overview and statistics</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard icon="fa-users" label="Total Students" value={stats?.totalStudents || 0} bg="#dbeafe" iconColor="#1d4ed8" />
        <StatCard icon="fa-book" label="Total Subjects" value={stats?.totalSubjects || 0} bg="#ede9fe" iconColor="#5b21b6" />
        <StatCard icon="fa-star" label="Mark Records" value={stats?.totalMarkRecords || 0} bg="#d1fae5" iconColor="#065f46" />
        <StatCard icon="fa-percent" label="Pass Rate" value={`${stats?.passPercentage || 0}%`} bg="#fef3c7" iconColor="#92400e" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header-custom"><h5>System Overview</h5></div>
          <div className="card-body-custom">
            <Bar data={summaryChart} options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } } }
            }} />
          </div>
        </div>
        <div className="card">
          <div className="card-header-custom"><h5>Pass / Fail Distribution</h5></div>
          <div className="card-body-custom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {(stats?.passCount || 0) + (stats?.failCount || 0) > 0
              ? <Doughnut data={passFailChart} options={{ cutout: '65%', plugins: { legend: { position: 'bottom' } } }} />
              : <div className="empty-state"><i className="fas fa-chart-pie"></i><p>No mark data yet</p></div>
            }
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <div className="card-header-custom"><h5>Quick Actions</h5></div>
        <div className="card-body-custom">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'Add Student', icon: 'fa-user-plus', to: '/admin/users', color: '#3b82f6' },
              { label: 'Add Subject', icon: 'fa-book-medical', to: '/admin/subjects', color: '#8b5cf6' },
              { label: 'Manage Batches', icon: 'fa-layer-group', to: '/admin/batches', color: '#f59e0b' },
              { label: 'View Marks', icon: 'fa-star', to: '/admin/marks', color: '#10b981' },
            ].map((a, i) => (
              <a key={i} href={a.to}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 10, background: a.color + '15', color: a.color, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}
              >
                <i className={`fas ${a.icon}`}></i>{a.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminBatches from './pages/admin/AdminBatches';
import AdminMarks from './pages/admin/AdminMarks';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyMarkEntry from './pages/faculty/FacultyMarkEntry';
import FacultyBatchUpload from './pages/faculty/FacultyBatchUpload';
import FacultySubjects from './pages/faculty/FacultySubjects';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentMarks from './pages/student/StudentMarks';
import StudentReport from './pages/student/StudentReport';
import Layout from './components/shared/Layout';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="page-loader" style={{ minHeight: '100vh' }}>
      <div className="spinner"></div>
      <p style={{ color: '#64748b' }}>Loading...</p>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin')   return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* ADMIN */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="subjects" element={<AdminSubjects />} />
            <Route path="batches" element={<AdminBatches />} />
            <Route path="marks" element={<AdminMarks />} />
          </Route>

          {/* FACULTY */}
          <Route path="/faculty" element={<ProtectedRoute roles={['faculty']}><Layout /></ProtectedRoute>}>
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="subjects" element={<FacultySubjects />} />
            <Route path="mark-entry" element={<FacultyMarkEntry />} />
            <Route path="batch-upload" element={<FacultyBatchUpload />} />
          </Route>

          {/* STUDENT */}
          <Route path="/student" element={<ProtectedRoute roles={['student']}><Layout /></ProtectedRoute>}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="marks" element={<StudentMarks />} />
            <Route path="report" element={<StudentReport />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

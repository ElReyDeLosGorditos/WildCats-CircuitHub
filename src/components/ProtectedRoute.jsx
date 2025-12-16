import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

// Generic protected route
export const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Verifying access..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin only route
export const AdminRoute = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Verifying admin access..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Teacher route
export const TeacherRoute = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Verifying teacher access..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'teacher' && userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Lab Assistant route
export const LabAssistantRoute = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Verifying lab assistant access..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'lab_assistant' && userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Staff route (Admin, Teacher, or Lab Assistant)
export const StaffRoute = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Verifying staff access..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = ['admin', 'teacher', 'lab_assistant'];
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Admin or Lab Assistant route (for maintenance, etc.)
export const AdminOrLabRoute = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Verifying access..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'admin' && userRole !== 'lab_assistant') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Student route (for student-only pages if needed)
export const StudentRoute = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Verifying student access..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'student') {
    // Redirect staff to their respective dashboards
    if (userRole === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (userRole === 'teacher') return <Navigate to="/t-dashboard" replace />;
    if (userRole === 'lab_assistant') return <Navigate to="/admin-dashboard" replace />;
  }

  return children;
};

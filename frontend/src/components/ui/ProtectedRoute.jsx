import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, getUser } from '../../lib/auth';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const token = getToken();
  const user = getUser();

  // Not logged in → send to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Admin-only route accessed by a regular user → send to dashboard
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

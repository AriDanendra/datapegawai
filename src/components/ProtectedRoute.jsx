import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Jika proses verifikasi token masih berjalan, jangan tampilkan apa-apa.
  // Ini mencegah redirect prematur ke halaman login.
  if (loading) {
    return null; // Anda bisa juga menampilkan loading spinner di sini
  }

  if (!isAuthenticated) {
    // Jika sudah selesai loading dan ternyata tidak terautentikasi,
    // baru arahkan ke halaman login.
    return <Navigate to="/login" />;
  }

  // Jika sudah login, periksa apakah perannya diizinkan
  if (!allowedRoles.includes(user.role)) {
    // Jika tidak diizinkan, arahkan ke halaman login
    return <Navigate to="/login" />;
  }

  // Jika semua kondisi terpenuhi, tampilkan halaman yang diminta
  return children;
};

export default ProtectedRoute;
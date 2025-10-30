import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // State loading untuk verifikasi
  const navigate = useNavigate();

  // Efek ini berjalan sekali saat aplikasi dimuat untuk memeriksa token
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Kirim token ke backend untuk diverifikasi
          const response = await axios.get('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          // Jika berhasil, set data pengguna
          setUser(response.data.user);
        } catch (error) {
          console.error("Verifikasi token gagal:", error);
          localStorage.removeItem('token'); // Hapus token jika tidak valid
        }
      }
      setLoading(false); // Selesai loading, apa pun hasilnya
    };

    verifyUser();
  }, []);

  const login = async (username, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      setUser(data.user);
      localStorage.setItem('token', data.token);

      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      throw new Error(data.message || 'Username atau Password salah!');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  const updateUser = (newUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...newUserData,
    }));
  };

  const value = {
    isAuthenticated: !!user,
    user,
    loading, // Kirim state loading ke komponen lain
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
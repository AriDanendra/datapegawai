import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  // 1. State untuk menyimpan pesan error sebagai string
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Hapus pesan error lama setiap kali mencoba login
    try {
      await login(username, password);
    } catch (error) {
      // 2. Tangkap error dan set pesannya ke dalam state
      setErrorMessage(error.message || 'Terjadi kesalahan saat login.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/assets/logo.png" alt="Logo RS" className="login-logo" />
        <h2>Login</h2>
        <p>Sistem Informasi Manajemen Kepegawaian</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Contoh: pegawai"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Contoh: password"
            />
          </div>

          {/* 3. Tampilkan pesan error di sini jika ada */}
          {errorMessage && (
            <div className="error-message-inline">
              {errorMessage}
            </div>
          )}

          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
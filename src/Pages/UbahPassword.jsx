import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './UbahPassword.css';

const UbahPassword = () => {
  const { user, updateUser } = useAuth();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Semua kolom harus diisi.' });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password baru minimal harus 8 karakter.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi password baru tidak cocok.' });
      return;
    }
    
    // Pengecekan password lama di frontend DIHAPUS karena tidak aman.
    // Validasi akan dilakukan sepenuhnya oleh backend.

    try {
        const response = await axios.post('/api/auth/change-password', {
            userId: user.id,
            oldPassword,
            newPassword,
        });

        // Perbarui konteks pengguna dengan data baru jika diperlukan (opsional)
        // Jika endpoint tidak mengembalikan user baru, Anda bisa refresh atau handle secara manual
        // Untuk saat ini, kita anggap password di context tidak perlu langsung diupdate.
        // updateUser({ ...user, password: newPassword }); // Baris ini bisa di-uncomment jika perlu, tapi kurang aman.

        setMessage({ type: 'success', text: response.data.message });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');

    } catch (error) {
        setMessage({ type: 'error', text: error.response?.data?.message || 'Terjadi kesalahan pada server.' });
    }
  };

  if (!user) {
    return <div className="riwayat-container">Memuat data pengguna...</div>;
  }

  return (
    <div className="riwayat-container">
      {/* Menggunakan style judul yang konsisten */}
      <div className="riwayat-header">
        <div>
          <h3>Ubah Password</h3>
          <p className="subtitle">
            Untuk keamanan akun, mohon untuk tidak memberitahukan password Anda kepada siapapun.
          </p>
        </div>
      </div>

      <div className="ubah-password-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="oldPassword">Password Lama</label>
            <input
              type="password"
              id="oldPassword"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">Password Baru</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Konfirmasi Password Baru</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          <button type="submit" className="submit-btn">
            Simpan Perubahan
          </button>
        </form>
      </div>
    </div>
  );
};

export default UbahPassword;
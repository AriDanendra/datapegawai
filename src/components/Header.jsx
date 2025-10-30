import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Header.css'; // <-- 1. Impor file CSS baru

const Header = ({ toggleSidebar }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <button onClick={toggleSidebar} className="sidebar-toggle-btn">
        ☰
      </button>

      {/* 2. Tambahkan kontainer untuk logo dan judul */}
      <div className="header-title-container">
        <img src="/assets/logo2.png" alt="Logo RS" className="header-logo" />
        <h1>
          Sistem Informasi Manajemen Kepegawaian RS dr. Hasri Ainun Habibie
        </h1>
      </div>

      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </header>
  );
};

export default Header;

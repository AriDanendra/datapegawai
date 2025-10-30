// src/components/Sidebar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaTachometerAlt, 
  FaUserCircle, 
  FaKey, 
  FaThList, 
  FaSignOutAlt 
} from 'react-icons/fa';

const Sidebar = ({ employee, isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  // Tampilan menu Admin (tidak ada perubahan)
  if (user && user.role === 'admin') {
    return (
      <aside className={`sidebar ${isOpen ? '' : 'closed'}`}>
        <div className="user-profile">
          <div className="user-info">
            <h3 className="user-name">{user.name}</h3>
            <p className="user-title">Administrator</p>
          </div>
          <button onClick={toggleSidebar} className="sidebar-close-btn">&times;</button>
        </div>
        <span className="nav-category">Menu Utama</span>
        <ul className="nav-menu">
          <li><NavLink to="/admin" end><FaTachometerAlt /> Dashboard</NavLink></li>
          <li><NavLink to="/admin/daftar-pegawai"><FaThList /> Daftar Pegawai</NavLink></li>
        </ul>
        <span className="nav-category">Lainnya</span>
        <ul className="nav-menu">
          <li><NavLink to="/admin/ubah-password"><FaKey /> Ubah Password</NavLink></li>
          <li><a href="#" onClick={logout}><FaSignOutAlt /> Logout</a></li>
        </ul>
      </aside>
    );
  }

  // Tampilan menu Pegawai
  const displayName = employee ? employee.name.split(',')[0] : 'Pegawai';
  
  // --- MODIFIKASI DIMULAI DI SINI ---
  // Ambil NIP dan format jika perlu
  const displayNIP = employee && employee.nip 
    ? `NIP: ${employee.nip.includes('/') ? employee.nip.split(' / ')[1] : employee.nip}` 
    : 'NIP: -';
  // --- MODIFIKASI SELESAI ---

  return (
    <aside className={`sidebar ${isOpen ? '' : 'closed'}`}>
      <div className="user-profile">
        <div className="user-info">
          <h3 className="user-name">{displayName}</h3>
          {/* Tampilkan NIP yang sudah diformat */}
          <p className="user-title">{displayNIP}</p>
        </div>
        <button onClick={toggleSidebar} className="sidebar-close-btn">&times;</button>
      </div>
      <span className="nav-category">Menu Utama</span>
      <ul className="nav-menu">
        <li><NavLink to="/" end><FaTachometerAlt /> Dashboard</NavLink></li>
        <li><NavLink to="/profile"><FaUserCircle /> Profile</NavLink></li>
      </ul>
      <span className="nav-category">Lainnya</span>
      <ul className="nav-menu">
        <li><NavLink to="/ubah-password"><FaKey /> Ubah Password</NavLink></li>
        <li><a href="#" onClick={logout}><FaSignOutAlt /> Logout</a></li>
      </ul>
    </aside>
  );
};

export default Sidebar;
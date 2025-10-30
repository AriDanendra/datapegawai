import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaBriefcase, FaAward, FaCalendarAlt } from 'react-icons/fa';
import './Dashboard.css'; // Pastikan CSS ini diimpor

const Dashboard = () => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (!user) {
    return <main className="main-content">Memuat data pengguna...</main>;
  }
  
  const profileImageUrl = user.profilePictureUrl && user.profilePictureUrl.startsWith('/public')
    ? `${user.profilePictureUrl}`
    : user.profilePictureUrl || "/assets/profile-pic.jpg";

  return (
    // MODIFIKASI 1: Menggunakan .riwayat-container sebagai pembungkus utama
    <div className="riwayat-container">
      {/* MODIFIKASI 2: Menggunakan struktur .riwayat-header untuk judul */}
      <div className="riwayat-header">
        <div>
          <h3>{getGreeting()}, {user.name.split(',')[0]}!</h3>
          <p className="subtitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCalendarAlt /> {today}
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card orange">
          <div className="stat-icon"><FaBriefcase /></div>
          <div className="stat-info">
            <p>Jabatan Saat Ini</p>
            <h3>{user.jabatan || '-'}</h3>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon"><FaAward /></div>
          <div className="stat-info">
            <p>Golongan/Pangkat</p>
            <h3>{user.golongan || '-'}</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-profile-card">
        <div className="profile-header">
          <img src={profileImageUrl} alt="Foto Profil" className="profile-picture-dashboard" />
          <div className="profile-info">
            <h4>{user.name.toUpperCase()}</h4>
            <p><FaUser /> NIP: {user.nip.includes('/') ? user.nip.split(' / ')[1] : user.nip}</p>
          </div>
        </div>
        <div className="profile-details-grid">
          <div><span>Tempat/Tgl Lahir:</span> {user.ttl}</div>
          <div><span>Agama:</span> {user.agama}</div>
          <div><span>Pendidikan Terakhir:</span> {user.pendidikan}</div>
          <div><span>Instansi:</span> {user.instansi}</div>
          <div><span>Email:</span> {user.email}</div>
          <div><span>No. HP/Telp:</span> {user.nomorHp}</div>
          <div className="alamat"><span>Alamat:</span> {user.alamat}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


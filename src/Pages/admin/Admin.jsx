import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    totalPegawai: 0,
    pegawaiAktif: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployeeStats = async () => {
      try {
        const response = await fetch('/api/employees');
        if (!response.ok) {
          throw new Error('Gagal mengambil data pegawai');
        }
        const allEmployees = await response.json();
        const total = allEmployees.length;
        setStats({
          totalPegawai: total,
          pegawaiAktif: total, // Asumsi semua pegawai yang terdata adalah aktif
        });
      } catch (err) {
        setError(err.message);
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeStats();
  }, []);

  if (!user) {
    return <main className="main-content">Memuat data...</main>;
  }

  return (
    <main className="main-content">
      <div className="welcome-header">
        <h2>Dashboard Administrator</h2>
        <p className="app-subtitle">
          Sistem Informasi Manajemen Kepegawaian Rumah Sakit Regional dr. Hasri Ainun Habibie
        </p>
        <p className="description">
          Selamat datang di panel kontrol. Kelola data dan monitor statistik kepegawaian.
        </p>
      </div>

      <div className="profile-card">
        <img 
          src={user.profilePictureUrl || "/assets/profile-pic.jpg"}
          alt="Foto Profil Admin" 
          className="profile-picture" 
        />
        
        <div className="profile-data">
          <h3 className="employee-name">Selamat Datang, {user.name}</h3>
          
          <table>
            <tbody>
              <tr>
                <td>Status Akun</td>
                <td>: Administrator Sistem</td>
              </tr>
              {isLoading ? (
                <tr><td colSpan="2">Memuat statistik...</td></tr>
              ) : error ? (
                 <tr><td colSpan="2" style={{color: 'red'}}>Gagal memuat statistik.</td></tr>
              ) : (
                <>
                  <tr>
                    <td>Total Pegawai Terdata</td>
                    <td>: {stats.totalPegawai} Orang</td>
                  </tr>
                  <tr>
                    <td>Pegawai Aktif</td>
                    <td>: {stats.pegawaiAktif} Orang</td>
                  </tr>
                </>
              )}
              <tr><td colSpan="2">&nbsp;</td></tr>
              <tr>
                <td colSpan="2">
                  Gunakan menu navigasi di samping untuk mengelola data pegawai, 
                  melihat detail, dan melakukan manajemen data lainnya.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;

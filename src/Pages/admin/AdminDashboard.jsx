import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  FaUsers, FaSitemap, FaCalendarCheck, FaUserEdit, FaExclamationCircle, FaBriefcase
} from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    totalPegawai: 0,
    totalJabatan: 0,
    totalCuti: 0,
    dataBelumLengkap: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('/api/employees');
        if (!response.ok) {
          throw new Error('Gagal mengambil data pegawai');
        }
        const allEmployees = await response.json();
        
        // Menghitung total jabatan unik
        const jabatanUnik = new Set(allEmployees.map(emp => emp.jabatan));
        
        // Menghitung total pengajuan cuti dari semua pegawai
        const totalCuti = allEmployees.reduce((acc, emp) => {
          return acc + (emp.riwayat?.cuti?.length || 0);
        }, 0);
        
        // Menghitung pegawai dengan data belum lengkap (contoh: alamat atau no HP kosong)
        const dataBelumLengkap = allEmployees.filter(emp => !emp.alamat || !emp.nomorHp).length;

        setStats({
          totalPegawai: allEmployees.length,
          totalJabatan: jabatanUnik.size,
          totalCuti: totalCuti,
          dataBelumLengkap: dataBelumLengkap,
        });

      } catch (err) {
        setError(err.message);
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (!user) {
    return <main className="main-content">Memuat data...</main>;
  }

  return (
    <div className="riwayat-container">
      <div className="riwayat-header">
        <div>
          <h3>Dashboard Administrator</h3>
          <p className="subtitle">Selamat datang kembali, {user.name}. Berikut adalah ringkasan data kepegawaian.</p>
        </div>
      </div>

      <div className="stats-grid">
        {/* Total Pegawai */}
        <div className="stat-card blue">
          <div className="stat-icon"><FaUsers /></div>
          <div className="stat-info">
            <p>Total Pegawai</p>
            <h3>{isLoading ? '...' : stats.totalPegawai}</h3>
          </div>
        </div>
        {/* Total Jabatan */}
        <div className="stat-card green">
          <div className="stat-icon"><FaBriefcase /></div>
          <div className="stat-info">
            <p>Total Jabatan</p>
            <h3>{isLoading ? '...' : stats.totalJabatan}</h3>
          </div>
        </div>
        {/* Total Pengajuan Cuti */}
        <div className="stat-card orange">
          <div className="stat-icon"><FaCalendarCheck /></div>
          <div className="stat-info">
            <p>Total Pengajuan Cuti</p>
            <h3>{isLoading ? '...' : stats.totalCuti}</h3>
          </div>
        </div>
        {/* Data Belum Lengkap */}
        <div className="stat-card red">
          <div className="stat-icon"><FaExclamationCircle /></div>
          <div className="stat-info">
            <p>Data Belum Lengkap</p>
            <h3>{isLoading ? '...' : stats.dataBelumLengkap}</h3>
          </div>
        </div>
      </div>

      <div className="additional-info-card">
        <h4>Aktivitas Sistem</h4>
        <p>Gunakan menu navigasi di samping untuk mengelola data master pegawai, melihat detail riwayat, dan melakukan manajemen data lainnya.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
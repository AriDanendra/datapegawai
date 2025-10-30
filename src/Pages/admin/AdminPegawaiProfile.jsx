import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink, Outlet } from 'react-router-dom';
import {
  FaUserTie, FaUsers, FaBriefcase, FaDollarSign, FaGraduationCap,
  FaChalkboardTeacher, FaAward, FaCalendarAlt, FaSitemap, FaCheckSquare,
  FaBalanceScale, FaArrowLeft
} from 'react-icons/fa';

// Komponen-komponen riwayat tidak perlu diubah
import DataKeluarga from '../profile/DataKeluarga';
import DataKGB from '../profile/DataKGB';
import RiwayatCuti from '../profile/RiwayatCuti';
import RiwayatDiklat from '../profile/RiwayatDiklat';
import RiwayatHukuman from '../profile/RIwayatHukuman';
import RiwayatJabatan from '../profile/RiwayatJabatan';
import RiwayatOrganisasi from '../profile/RiwayatOrganisasi';
import RiwayatPendidikan from '../profile/RiwayatPendidikan';
import RiwayatPenghargaan from '../profile/RiwayatPenghargaan';
import RiwayatSKP from '../profile/RiwayatSKP';
import RiwayatSKPPermenpan from '../profile/RiwayatSKPPermenpan';
import StatusKepegawaian from '../profile/StatusKepegawaian';

const AdminPegawaiProfile = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  
  // State untuk menyimpan data pegawai dari backend
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect untuk mengambil data saat komponen dimuat atau employeeId berubah
  useEffect(() => {
    const fetchEmployee = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/employees/${employeeId}`);
        if (!response.ok) {
          throw new Error('Pegawai tidak ditemukan');
        }
        const data = await response.json();
        setEmployee(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeId]);

  // Tampilan saat loading atau error
  if (isLoading) {
    return <div className="main-content">Memuat data pegawai...</div>;
  }

  if (error) {
    return (
      <div className="main-content">
        <h2>{error}</h2>
        <button onClick={() => navigate('/admin/daftar-pegawai')} className="back-button">
          Kembali ke Daftar Pegawai
        </button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => navigate('/admin/daftar-pegawai')} className="back-button">
        <FaArrowLeft /> Kembali ke Daftar Pegawai
      </button>
      <div className="profile-page-container" style={{ marginTop: '1rem' }}>
        <div className="profile-card">
          <img src={employee.profilePictureUrl || '/assets/profile-pic.jpg'} alt={`Foto ${employee.name}`} className="profile-picture" />
          <div className="profile-data">
            <h3 className="employee-name">{employee.name.toUpperCase()}</h3>
            <table>
              <tbody>
                <tr><td>NIP</td><td>: {employee.nip}</td></tr>
                <tr><td>Tempat/Tgl Lahir</td><td>: {employee.ttl}</td></tr>
                <tr><td>Agama</td><td>: {employee.agama}</td></tr>
                <tr><td>Alamat</td><td>: {employee.alamat}</td></tr>
                <tr><td colSpan="2"><hr /></td></tr>
                <tr><td>Pendidikan Terakhir</td><td>: {employee.pendidikan}</td></tr>
                <tr><td>Golongan/Pangkat</td><td>: {employee.golongan}</td></tr>
                <tr><td>Jabatan</td><td>: {employee.jabatan}</td></tr>
                <tr><td colSpan="2"><hr /></td></tr>
                <tr><td>Email</td><td>: {employee.email}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="profile-details-right">
          <div className="profile-menu-card">
             <div className="profile-menu-grid">
              <NavLink to={`/admin/pegawai/detail/${employeeId}/status`} className="menu-item"><FaUserTie size={20} /><span>STATUS KEPEGAWAIAN</span></NavLink>
              <NavLink to={`/admin/pegawai/detail/${employeeId}/keluarga`} className="menu-item"><FaUsers size={20} /><span>DATA KELUARGA</span></NavLink>
              <NavLink to={`/admin/pegawai/detail/${employeeId}/jabatan`} className="menu-item"><FaBriefcase size={20} /><span>RIWAYAT JABATAN</span></NavLink>
              <NavLink to={`/admin/pegawai/detail/${employeeId}/kgb`} className="menu-item"><FaDollarSign size={20} /><span>DATA KGB</span></NavLink>
              <NavLink to={`/admin/pegawai/detail/${employeeId}/pendidikan`} className="menu-item"><FaGraduationCap size={20} /><span>RIWAYAT PENDIDIKAN</span></NavLink>
              <NavLink to={`/admin/pegawai/detail/${employeeId}/diklat`} className="menu-item"><FaChalkboardTeacher size={20} /><span>RIWAYAT DIKLAT</span></NavLink>
              <NavLink to={`/admin/pegawai/detail/${employeeId}/penghargaan`} className="menu-item"><FaAward size={20} /><span>RIWAYAT PENGHARGAAN</span></NavLink>
              <NavLink to={`/admin/pegawai/detail/${employeeId}/cuti`} className="menu-item"><FaCalendarAlt size={20} /><span>RIWAYAT CUTI</span></NavLink>
              <NavLink to={`/admin/pegawai/detail/${employeeId}/organisasi`} className="menu-item"><FaSitemap size={20} /><span>RIWAYAT ORGANISASI</span></NavLink>
              <NavLink to={`/admin/pegawai/detail/${employeeId}/skp`} className="menu-item"><FaCheckSquare size={20} /><span>RIWAYAT SKP</span></NavLink>
              <NavLink to={`/admin/pegawai/detail/${employeeId}/skp-permenpan`} className="menu-item"><FaCheckSquare size={20} /><span>RIWAYAT SKP PERMENPAN</span></NavLink>
              <NavLink to={`/admin/pegawai/detail/${employeeId}/hukuman`} className="menu-item"><FaBalanceScale size={20} /><span>RIWAYAT HUKUMAN</span></NavLink>
            </div>
          </div>
          <div className="profile-content-card">
            <Outlet context={{ riwayat: employee.riwayat }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPegawaiProfile;

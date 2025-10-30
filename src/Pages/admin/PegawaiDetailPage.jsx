import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  FaArrowLeft, FaUserTie, FaUsers, FaBriefcase, FaDollarSign,
  FaGraduationCap, FaChalkboardTeacher, FaAward, FaCalendarAlt,
  FaSitemap, FaCheckSquare, FaBalanceScale, FaPencilAlt, FaFileMedical
} from 'react-icons/fa';
import './DaftarPegawai.css';

import Modal from '../../components/Modal';
import SuccessModal from '../../components/SuccessModal';
import DataKeluarga from '../profile/DataKeluarga';
import DataKGB from '../profile/DataKGB';
import RiwayatCuti from '../profile/RiwayatCuti';
import RiwayatDiklat from '../profile/RiwayatDiklat';
import RiwayatHukuman from '../profile/RiwayatHukuman';
import RiwayatJabatan from '../profile/RiwayatJabatan';
import RiwayatOrganisasi from '../profile/RiwayatOrganisasi';
import RiwayatPendidikan from '../profile/RiwayatPendidikan';
import RiwayatPenghargaan from '../profile/RiwayatPenghargaan';
import RiwayatSKP from '../profile/RiwayatSKP';
import RiwayatSKPPermenpan from '../profile/RiwayatSKPPermenpan';
import StatusKepegawaian from '../profile/StatusKepegawaian';
import RiwayatSipStr from '../profile/RiwayatSipStr'; // Komponen baru diimpor

const menuItems = [
    { key: 'status', label: 'STATUS KEPEGAWAIAN', icon: FaUserTie, component: StatusKepegawaian },
    { key: 'keluarga', label: 'DATA KELUARGA', icon: FaUsers, component: DataKeluarga },
    { key: 'jabatan', label: 'RIWAYAT JABATAN', icon: FaBriefcase, component: RiwayatJabatan },
    { key: 'kgb', label: 'DATA KGB', icon: FaDollarSign, component: DataKGB },
    { key: 'pendidikan', label: 'RIWAYAT PENDIDIKAN', icon: FaGraduationCap, component: RiwayatPendidikan },
    { key: 'diklat', label: 'RIWAYAT DIKLAT', icon: FaChalkboardTeacher, component: RiwayatDiklat },
    { key: 'penghargaan', label: 'RIWAYAT PENGHARGAAN', icon: FaAward, component: RiwayatPenghargaan },
    { key: 'cuti', label: 'RIWAYAT CUTI', icon: FaCalendarAlt, component: RiwayatCuti },
    { key: 'sipstr', label: 'RIWAYAT SIP/STR', icon: FaFileMedical, component: RiwayatSipStr }, // Menu baru ditambahkan
    { key: 'organisasi', label: 'RIWAYAT ORGANISASI', icon: FaSitemap, component: RiwayatOrganisasi },
    { key: 'skp', label: 'RIWAYAT SKP', icon: FaCheckSquare, component: RiwayatSKP },
    { key: 'skp_permenpan', label: 'RIWAYAT SKP PERMENPAN', icon: FaCheckSquare, component: RiwayatSKPPermenpan },
    { key: 'hukuman', label: 'RIWAYAT HUKUMAN', icon: FaBalanceScale, component: RiwayatHukuman },
];

const PegawaiDetailPage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const initialTab = location.hash.replace('#', '') || 'jabatan';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchEmployee = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/employees/${employeeId}`);
      setEmployee(response.data);
    } catch (err) {
      setError('Pegawai tidak ditemukan atau gagal mengambil data.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEmployee();
  }, [employeeId]);
  
  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    navigate(`#${tabKey}`, { replace: true });
  };
  
  const showSuccessModal = (message) => {
    setSuccessMessage(message);
    setIsSuccessModalOpen(true);
  };

  const getProfileImageUrl = (emp) => {
    if (preview) return preview;
    if (!emp || !emp.profilePictureUrl) return '/assets/profile-pic.jpg';
    const baseUrl = emp.profilePictureUrl.startsWith('/public')
      ? `${emp.profilePictureUrl}`
      : emp.profilePictureUrl;
    return `${baseUrl}?t=${new Date().getTime()}`;
  };

  const handleOpenEditModal = () => {
    setFormData(employee);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setFormData(null);
    setSelectedFile(null);
    setPreview(null);
  };

  const handleFormChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/employees/${employeeId}`, formData);
      setEmployee(response.data);
      
      if (selectedFile) {
        await handleUploadPhoto();
      } else {
        showSuccessModal(`Profil ${response.data.name} berhasil diperbarui!`);
        handleCloseEditModal();
      }
    } catch (err) {
      alert('Gagal memperbarui data pegawai.');
      console.error(err);
    }
  };
  
  const handleUploadPhoto = async () => {
    if (!selectedFile) return;
    const uploadData = new FormData();
    uploadData.append('profilePicture', selectedFile);
    try {
      const response = await axios.post(
        `/api/employees/${employeeId}/upload-profile-picture`,
        uploadData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setEmployee(response.data.user);
      showSuccessModal('Perubahan berhasil disimpan (termasuk foto profil).');
      handleCloseEditModal();
    } catch (error) {
      throw new Error("Gagal mengunggah foto.");
    }
  };

  const renderContent = () => {
    const activeComponent = menuItems.find(item => item.key === activeTab);
    if (!activeComponent || !employee || !employee.riwayat) {
      return <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}><p>Pilih menu di atas untuk melihat detail riwayat.</p></div>;
    }
    const ComponentToRender = activeComponent.component;
    const dataKey = {
      'skp_permenpan': 'skpPermenpan',
      'status': 'statusKepegawaian'
    }[activeTab] || activeTab;

    return <ComponentToRender data={employee.riwayat[dataKey]} employeeId={employeeId} />;
  };

  if (isLoading) return <div className="main-content">Memuat data pegawai...</div>;
  if (error) return <div className="main-content">Error: {error}</div>;
  if (!employee) return <div className="main-content">Pegawai tidak ditemukan.</div>;

  return (
    <div className="pegawai-detail-page">
      <header className="page-header-with-back">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft />
          <span>Kembali ke Daftar Pegawai</span>
        </button>
      </header>

      <div className="profile-page-container">
        <div className="profile-card">
          <button className="edit-profile-action-btn" title="Edit Profil Pegawai" onClick={handleOpenEditModal}><FaPencilAlt /></button>
          <img src={getProfileImageUrl(employee)} alt="Foto Profil Pegawai" className="profile-picture" />
          <div className="profile-data">
            <h3 className="employee-name">{employee.name.toUpperCase()}</h3>
            <table>
              <tbody>
                <tr><td>NIP</td><td>: {employee.nip.includes('/') ? employee.nip.split(' / ')[1] : employee.nip}</td></tr>
                <tr><td>Tempat/Tgl Lahir</td><td>: {employee.ttl}</td></tr>
                <tr><td>Agama</td><td>: {employee.agama}</td></tr>
                <tr><td>Alamat</td><td>: {employee.alamat}</td></tr>
                <tr><td colSpan="2"><hr /></td></tr>
                <tr><td>Pendidikan Terakhir</td><td>: {employee.pendidikan}</td></tr>
                <tr><td>Golongan/Pangkat</td><td>: {employee.golongan}</td></tr>
                <tr><td>Jabatan</td><td>: {employee.jabatan}</td></tr>
                <tr><td>Instansi</td><td>: {employee.instansi}</td></tr>
                <tr><td colSpan="2"><hr /></td></tr>
                <tr><td>No. KTP</td><td>: {employee.noKtp}</td></tr>
                <tr><td>No. NPWP</td><td>: {employee.noNpwp}</td></tr>
                <tr><td>No. Karpeg</td><td>: {employee.noKarpeg}</td></tr>
                <tr><td>No. Karis/Karsu</td><td>: {employee.noKaris}</td></tr>
                <tr><td>No. Askes</td><td>: {employee.noAskes}</td></tr>
                <tr><td>No. Taspen</td><td>: {employee.noTaspen}</td></tr>
                <tr><td>No. Rekening Gaji</td><td>: {employee.noRekening}</td></tr>
                <tr><td colSpan="2"><hr /></td></tr>
                <tr><td>No.Hp/Telp</td><td>: {employee.nomorHp}</td></tr>
                <tr><td>Email</td><td>: {employee.email}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="profile-details-right">
          <div className="profile-menu-card">
            <div className="profile-menu-grid">
              {menuItems.map(item => (
                <button
                  key={item.key}
                  className={`menu-item ${activeTab === item.key ? 'active' : ''}`}
                  onClick={() => handleTabClick(item.key)}
                >
                  <item.icon size={20} /> <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="profile-content-card">{renderContent()}</div>
        </div>
      </div>

      <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} title={`Edit Profil: ${employee.name}`}>
        <form onSubmit={handleSaveChanges}>
            <div className="modal-form-group">
                <label>Foto Profil</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={getProfileImageUrl(formData)} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                    <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} style={{ display: 'none' }} />
                    <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current.click()}>Pilih Foto</button>
                </div>
            </div>
          
          <div className="edit-profile-form-grid">
            <div className="modal-form-group"><label htmlFor="name">Nama Lengkap</label><input type="text" id="name" name="name" value={formData?.name || ''} onChange={handleFormChange} /></div>
            <div className="modal-form-group"><label htmlFor="nip">NIP</label><input type="text" id="nip" name="nip" value={formData?.nip || ''} onChange={handleFormChange} /></div>
            <div className="modal-form-group"><label htmlFor="ttl">Tempat/Tgl Lahir</label><input type="text" id="ttl" name="ttl" value={formData?.ttl || ''} onChange={handleFormChange} /></div>
            <div className="modal-form-group"><label htmlFor="agama">Agama</label><input type="text" id="agama" name="agama" value={formData?.agama || ''} onChange={handleFormChange} /></div>
            <div className="modal-form-group"><label htmlFor="alamat">Alamat</label><input type="text" id="alamat" name="alamat" value={formData?.alamat || ''} onChange={handleFormChange} /></div>
            <div className="modal-form-group"><label htmlFor="pendidikan">Pendidikan Terakhir</label><input type="text" id="pendidikan" name="pendidikan" value={formData?.pendidikan || ''} onChange={handleFormChange} /></div>
            <div className="modal-form-group"><label htmlFor="golongan">Golongan/Pangkat</label><input type="text" id="golongan" name="golongan" value={formData?.golongan || ''} onChange={handleFormChange} /></div>
            <div className="modal-form-group"><label htmlFor="jabatan">Jabatan</label><input type="text" id="jabatan" name="jabatan" value={formData?.jabatan || ''} onChange={handleFormChange} /></div>
            <div className="modal-form-group"><label htmlFor="instansi">Instansi</label><input type="text" id="instansi" name="instansi" value={formData?.instansi || ''} onChange={handleFormChange} /></div>
            <div className="modal-form-group"><label htmlFor="noKtp">No. KTP</label><input type="text" id="noKtp" name="noKtp" value={formData?.noKtp || ''} onChange={handleFormChange} /></div>
            <div className="modal-form-group"><label htmlFor="noNpwp">No. NPWP</label><input type="text" id="noNpwp" name="noNpwp" value={formData?.noNpwp || ''} onChange={handleFormChange} /></div>
            <div className="modal-form-group"><label htmlFor="noKarpeg">No. Karpeg</label><input type="text" id="noKarpeg" name="noKarpeg" value={formData?.noKarpeg || ''} onChange={handleFormChange} /></div>
            <div className="modal-form-group"><label htmlFor="noKaris">No. Karis/Karsu</label><input type="text" id="noKaris" name="noKaris" value={formData?.noKaris || ''} onChange={handleFormChange} /></div>
            <div className="modal-form-group"><label htmlFor="noAskes">No. Askes</label><input type="text" id="noAskes" name="noAskes" value={formData?.noAskes || ''} onChange={handleFormChange} /></div>
            <div className="modal-form-group"><label htmlFor="noTaspen">No. Taspen</label><input type="text" id="noTaspen" name="noTaspen" value={formData?.noTaspen || ''} onChange={handleFormChange} /></div>
            <div className="modal-form-group"><label htmlFor="noRekening">No. Rekening Gaji</label><input type="text" id="noRekening" name="noRekening" value={formData?.noRekening || ''} onChange={handleFormChange} /></div>
            <div className="modal-form-group"><label htmlFor="nomorHp">No. HP/Telepon</label><input type="text" id="nomorHp" name="nomorHp" value={formData?.nomorHp || ''} onChange={handleFormChange} /></div>
            <div className="modal-form-group"><label htmlFor="email">Email</label><input type="email" id="email" name="email" value={formData?.email || ''} onChange={handleFormChange} /></div>
          </div>
          <div className="modal-form-actions">
            <button type="button" className="btn btn-secondary" onClick={handleCloseEditModal}>Batal</button>
            <button type="submit" className="btn btn-primary">Simpan Perubahan</button>
          </div>
        </form>
      </Modal>

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successMessage}
      />
    </div>
  );
};

export default PegawaiDetailPage;
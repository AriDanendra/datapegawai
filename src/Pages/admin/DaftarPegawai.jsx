import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaPencilAlt, FaTrash, FaPlus, FaPhone, FaIdCard, FaLock } from 'react-icons/fa';
import axios from 'axios';
import Modal from '../../components/Modal';
import SuccessModal from '../../components/SuccessModal';
import './DaftarPegawai.css';

const DaftarPegawai = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [editFormData, setEditFormData] = useState({});
  const [addFormData, setAddFormData] = useState({ name: '', nip: '', jabatan: '', golongan: '' });

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEmployees = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/employees');
      setEmployees(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);
  
  const filteredEmployees = useMemo(() => {
    if (!searchTerm) {
      return employees;
    }
    return employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.nip.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getProfileImageUrl = (employee) => {
    if (!employee || !employee.profilePictureUrl) return '/assets/profile-pic.jpg';
    const baseUrl = employee.profilePictureUrl.startsWith('/public')
      ? `${employee.profilePictureUrl}`
      : employee.profilePictureUrl;
    return `${baseUrl}?t=${new Date().getTime()}`;
  };

  const handleOpenDetail = (employeeId) => {
    navigate(`/admin/pegawai/detail/${employeeId}`);
  };

  const handleOpenEditModal = (employee) => {
    setSelectedEmployee(employee);
    setEditFormData(employee);
    setPreview(getProfileImageUrl(employee));
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (employee) => {
    setSelectedEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setAddFormData({ name: '', nip: '', jabatan: '', golongan: '' });
    setIsAddModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsAddModalOpen(false);
    setSelectedEmployee(null);
    setSelectedFile(null);
    setPreview(null);
  };

  const showSuccessModal = (message) => {
    setSuccessMessage(message);
    setIsSuccessModalOpen(true);
  };

  const handleDeleteEmployee = async () => {
    try {
      await axios.delete(`/api/employees/${selectedEmployee.id}`);
      showSuccessModal(`Data pegawai "${selectedEmployee.name}" berhasil dihapus.`);
      setEmployees(employees.filter(emp => emp.id !== selectedEmployee.id));
      handleCloseModals();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/employees/${selectedEmployee.id}`, editFormData);

      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('profilePicture', selectedFile);
        await axios.post(
          `/api/employees/${selectedEmployee.id}/upload-profile-picture`,
          uploadData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }
      
      showSuccessModal(`Data pegawai "${response.data.name}" berhasil diperbarui.`);
      await fetchEmployees();
      handleCloseModals();

    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/employees', addFormData);
      showSuccessModal(`Pegawai baru "${addFormData.name}" berhasil ditambahkan.`);
      await fetchEmployees();
      handleCloseModals();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditFormChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleAddFormChange = (e) => {
    setAddFormData({ ...addFormData, [e.target.name]: e.target.value });
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

  if (isLoading) return <div className="riwayat-container">Memuat data pegawai...</div>;
  if (error) return <div className="riwayat-container">Error: {error}</div>;

  return (
    <div className="riwayat-container">
        <div className="riwayat-header">
        <div><h3>Manajemen Daftar Pegawai</h3><p className="subtitle">Kelola data master semua pegawai.</p></div>
        <button className="btn-tambah-pegawai" title="Tambah Pegawai Baru" onClick={handleOpenAddModal}>
          <FaPlus style={{ marginRight: '8px' }} />Tambah Pegawai
        </button>
      </div>

      <div className="table-controls">
        <div className="show-entries">
          <label htmlFor="entries">Show</label>
          <select name="entries" id="entries" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <span>entries</span>
        </div>
        <div className="search-box">
          <label htmlFor="search">Search:</label>
          <input 
            type="search" 
            id="search" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama atau NIP..."
          />
        </div>
      </div>

      {/* === KARTU PEGAWAI YANG SUDAH DIMODIFIKASI === */}
      <div className="pegawai-card-grid">
        {currentItems.map((employee) => (
          <div key={employee.id} className="pegawai-item-card">
            <div className="pegawai-card-header">
              <img src={getProfileImageUrl(employee)} alt={employee.name} className="pegawai-foto-card" />
              <div className="pegawai-details">
                <h4 className="employee-name">{employee.name}</h4>
                <p className="pegawai-jabatan-card">{employee.jabatan}</p>
              </div>
            </div>
            <div className="pegawai-card-body">
              <div className="detail-item">
                <span className="detail-label"><FaIdCard className="icon-detail" /> NIP:</span>
                <span className="detail-value">{employee.nip && (employee.nip.includes('/') ? employee.nip.split(' / ')[1] : employee.nip)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label"><FaPhone className="icon-detail" /> No. HP:</span>
                <span className="detail-value">{employee.nomorHp || '-'}</span>
              </div>
            </div>
            <div className="card-action-buttons">
              <button className="action-btn view" title="Lihat Detail Profil" onClick={() => handleOpenDetail(employee.id)}><FaEye /> Detail</button>
              <button className="action-btn edit" title="Edit Data Pokok & Foto" onClick={() => handleOpenEditModal(employee)}><FaPencilAlt /> Edit</button>
              <button className="action-btn delete" title="Hapus Pegawai" onClick={() => handleOpenDeleteModal(employee)}><FaTrash /> Hapus</button>
            </div>
          </div>
        ))}
      </div>

      <div className="table-footer">
        <span>Showing {indexOfFirstItem + 1} to {indexOfLastItem > filteredEmployees.length ? filteredEmployees.length : indexOfLastItem} of {filteredEmployees.length} entries</span>
        <div className="pagination">
            <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
            <button className="active">{currentPage}</button>
            <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
        </div>
      </div>

      {/* Modal-modal tidak ada perubahan */}
      <Modal isOpen={isAddModalOpen} onClose={handleCloseModals} title="Tambah Pegawai Baru">
        <form onSubmit={handleSaveAdd}>
          <div className="modal-form-group"><label htmlFor="add-name">Nama Lengkap</label><input type="text" id="add-name" name="name" value={addFormData.name} onChange={handleAddFormChange} required /></div>
          <div className="modal-form-group"><label htmlFor="add-nip">NIP</label><input type="text" id="add-nip" name="nip" value={addFormData.nip} onChange={handleAddFormChange} required /></div>
          <div className="modal-form-group"><label htmlFor="add-jabatan">Jabatan</label><input type="text" id="add-jabatan" name="jabatan" value={addFormData.jabatan} onChange={handleAddFormChange} required /></div>
          <div className="modal-form-group"><label htmlFor="add-golongan">Golongan</label><input type="text" id="add-golongan" name="golongan" value={addFormData.golongan} onChange={handleAddFormChange} required /></div>
          <div className="modal-form-actions"><button type="button" className="btn btn-secondary" onClick={handleCloseModals}>Batal</button><button type="submit" className="btn btn-primary">Simpan</button></div>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={handleCloseModals} title={`Edit Data: ${selectedEmployee?.name}`}>
        <form onSubmit={handleSaveEdit}>
            <div className="modal-form-group">
                <label>Foto Profil</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexDirection: 'column' }}>
                    <img
                        src={preview}
                        alt="Preview"
                        style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ddd' }}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                    />
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => fileInputRef.current.click()}
                    >
                        Pilih Foto Baru
                    </button>
                </div>
            </div>
            <div className="modal-form-group"><label htmlFor="nip">NIP</label><input type="text" id="nip" name="nip" value={editFormData.nip || ''} onChange={handleEditFormChange} /></div>
            <div className="modal-form-group"><label htmlFor="nomorHp">No. HP</label><input type="text" id="nomorHp" name="nomorHp" value={editFormData.nomorHp || ''} onChange={handleEditFormChange} /></div>
            <div className="modal-form-actions"><button type="button" className="btn btn-secondary" onClick={handleCloseModals}>Batal</button><button type="submit" className="btn btn-primary">Simpan Perubahan</button></div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseModals} title="Konfirmasi Hapus">
        <div>
          <p>Apakah Anda yakin ingin menghapus data pegawai: <strong>{selectedEmployee?.name}</strong>?</p>
          <div className="modal-form-actions">
            <button type="button" className="btn btn-secondary" onClick={handleCloseModals}>Batal</button>
            <button className="btn btn-danger" onClick={handleDeleteEmployee}>Hapus</button>
          </div>
        </div>
      </Modal>

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successMessage}
      />
    </div>
  );
};

export default DaftarPegawai;
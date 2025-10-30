import React, { useState, useRef, useEffect } from 'react';
import { FaPencilAlt, FaTrash, FaDownload, FaFileAlt } from 'react-icons/fa';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import Modal from '../../components/Modal';
import SuccessModal from '../../components/SuccessModal';
import { useAuth } from '../../context/AuthContext';

const RiwayatDiklat = ({ data: propData, employeeId: propEmployeeId }) => {
  const [diklatData, setDiklatData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedData, setSelectedData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { user } = useAuth();
  const context = useOutletContext();
  const employeeId = propEmployeeId || user.id;

  useEffect(() => {
    const initialData = propData || context?.riwayat?.diklat || [];
    setDiklatData(initialData);
  }, [propData, context]);

  const handleOpenModal = (type, data = null) => {
    setModalType(type);
    setSelectedFile(null);
    if (type === 'edit') {
      setSelectedData(data);
      setFormData(data);
    } else if (type === 'add') {
      setSelectedData(null);
      // Menghilangkan 'jenis' dari form data awal
      setFormData({ namaDiklat: '', tempat: '', pelaksana: '', angkatan: '', tanggal: '' });
    } else { // 'delete'
      setSelectedData(data);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType('');
    setSelectedData(null);
    setFormData(null);
    setSelectedFile(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const showSuccessModal = (message) => {
    setSuccessMessage(message);
    setIsSuccessModalOpen(true);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => {
        dataToSend.append(key, formData[key] || '');
    });
    if (selectedFile) {
        dataToSend.append('berkas', selectedFile);
    }
    
    try {
      let response;
      if (modalType === 'add') {
        response = await axios.post(`/api/employees/${employeeId}/diklat`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setDiklatData([...diklatData, response.data]);
        showSuccessModal(`Data diklat baru berhasil ditambahkan!`);
      } else { // 'edit'
        response = await axios.put(`/api/employees/${employeeId}/diklat/${selectedData.id}`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setDiklatData(diklatData.map(item => (item.id === selectedData.id ? response.data : item)));
        showSuccessModal(`Data diklat berhasil diperbarui!`);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Gagal menyimpan data diklat:", error.response ? error.response.data : error.message);
      alert("Terjadi kesalahan saat menyimpan data.");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/employees/${employeeId}/diklat/${selectedData.id}`);
      setDiklatData(diklatData.filter(item => item.id !== selectedData.id));
      showSuccessModal(`Data diklat telah dihapus!`);
      handleCloseModal();
    } catch (error) {
      console.error("Gagal menghapus data diklat:", error);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };
  
  const getModalTitle = () => {
    if (modalType === 'edit') return 'Edit Riwayat Diklat';
    if (modalType === 'add') return 'Tambah Riwayat Diklat';
    return 'Konfirmasi Hapus Data';
  };
  
  const getFileNameFromUrl = (url) => {
    if (!url) return "Tidak ada file";
    try {
      const urlParts = url.split('/');
      const lastPart = urlParts.pop();
      const nameParts = lastPart.split('-');
      if (nameParts.length > 3) return nameParts.slice(3).join('-');
      return lastPart;
    } catch {
      return "Nama file tidak valid";
    }
  };

  const renderModalContent = () => {
    if ((modalType === 'edit' || modalType === 'add') && formData) {
      const existingFileUrl = formData.berkasUrl && formData.berkasUrl !== '#' ? `${formData.berkasUrl}` : null;
      const existingFileName = existingFileUrl ? getFileNameFromUrl(formData.berkasUrl) : null;

      return (
        <form onSubmit={handleSaveChanges}>
          {/* Field 'Jenis Diklat' telah dihapus dari sini */}
          <div className="modal-form-group"><label>Nama Diklat</label><input type="text" name="namaDiklat" value={formData.namaDiklat || ''} onChange={handleInputChange} required /></div>
          <div className="modal-form-group"><label>Tempat</label><input type="text" name="tempat" value={formData.tempat || ''} onChange={handleInputChange} /></div>
          <div className="modal-form-group"><label>Pelaksana</label><input type="text" name="pelaksana" value={formData.pelaksana || ''} onChange={handleInputChange} /></div>
          <div className="modal-form-group"><label>Angkatan</label><input type="text" name="angkatan" value={formData.angkatan || ''} onChange={handleInputChange} /></div>
          <div className="modal-form-group"><label>Tanggal</label><input type="text" name="tanggal" placeholder="dd-mm-yyyy" value={formData.tanggal || ''} onChange={handleInputChange} /></div>
          
          <div className="modal-form-group">
            <label>Upload Sertifikat (Opsional)</label>
            {modalType === 'edit' && existingFileName && !selectedFile && (
                <div className="current-file-info">
                    <FaFileAlt />
                    <span>{existingFileName}</span>
                    <a href={existingFileUrl} target="_blank" rel="noopener noreferrer" className="download-button-small">
                        <FaDownload /> Unduh
                    </a>
                </div>
            )}
            {selectedFile && (
                <div className="current-file-info">
                    <FaFileAlt /> <span>File baru: {selectedFile.name}</span>
                </div>
            )}
            <input type="file" ref={fileInputRef} accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange}/>
          </div>

          <div className="modal-form-actions"><button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button><button type="submit" className="btn btn-primary">Simpan</button></div>
        </form>
      );
    }

    if (modalType === 'delete' && selectedData) {
      return (
        <div>
          <p>Anda yakin ingin menghapus data diklat:</p>
          <p><strong>{selectedData.namaDiklat}</strong>?</p>
          <div className="modal-form-actions"><button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button><button type="button" className="btn btn-danger" onClick={handleDelete}>Hapus</button></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="riwayat-container">
      <div className="riwayat-header">
        <div>
            <h3>Riwayat Diklat</h3>
            <p className="subtitle">Informasi riwayat diklat yang pernah diikuti.</p>
        </div>
        <button className="add-button-icon" title="Tambah Riwayat Diklat" onClick={() => handleOpenModal('add')}>
            <FaPencilAlt />
        </button>
      </div>
      <div className="table-responsive-wrapper">
          <table className="riwayat-table">
              <thead>
                  <tr>
                    <th>#</th>
                    {/* Kolom 'Jenis Diklat' telah dihapus */}
                    <th>Nama Diklat</th>
                    <th>Tempat</th>
                    <th>Pelaksana</th>
                    <th>Angkatan</th>
                    <th>Tanggal</th>
                    <th>Berkas</th>
                    <th>Opsi</th>
                  </tr>
              </thead>
              <tbody>
                  {diklatData.map((item, index) => (
                      <tr key={item.id}>
                          <td>{index + 1}</td>
                          {/* Sel untuk 'Jenis Diklat' telah dihapus */}
                          <td>{item.namaDiklat}</td>
                          <td>{item.tempat}</td>
                          <td>{item.pelaksana}</td>
                          <td>{item.angkatan}</td>
                          <td>{item.tanggal}</td>
                          <td>
                              {item.berkasUrl && item.berkasUrl !== '#' ? (
                                  <a href={`${item.berkasUrl}`} className="download-button" target="_blank" rel="noopener noreferrer">Download</a>
                              ) : (
                                  <span>-</span>
                              )}
                          </td>
                          <td>
                              <div className="action-buttons">
                                  <button className="action-btn edit" title="Edit" onClick={() => handleOpenModal('edit', item)}><FaPencilAlt /></button>
                                  <button className="action-btn delete" title="Delete" onClick={() => handleOpenModal('delete', item)}><FaTrash /></button>
                              </div>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={getModalTitle()}>{renderModalContent()}</Modal>

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
            setIsSuccessModalOpen(false);
            window.location.reload();
        }}
        message={successMessage}
      />
    </div>
  );
};

export default RiwayatDiklat;
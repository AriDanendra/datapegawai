import React, { useState, useRef, useEffect } from 'react';
import { FaPencilAlt, FaTrash, FaDownload, FaFileAlt } from 'react-icons/fa';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import Modal from '../../components/Modal';
import SuccessModal from '../../components/SuccessModal';
import { useAuth } from '../../context/AuthContext';

const RiwayatCuti = ({ data: propData, employeeId: propEmployeeId }) => {
  const [cutiData, setCutiData] = useState([]);
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
    const initialData = propData || context?.riwayat?.cuti || [];
    setCutiData(initialData);
  }, [propData, context]);

  const handleOpenModal = (type, data = null) => {
    setModalType(type);
    setSelectedFile(null); // Selalu reset file
    if (type === 'edit') {
      setSelectedData(data);
      setFormData(data);
    } else if (type === 'add') {
      setSelectedData(null);
      setFormData({ jenisCuti: '', nomorSurat: '', tanggalSurat: '', tanggalAwal: '', tanggalSelesai: '' });
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
        response = await axios.post(`/api/employees/${employeeId}/cuti`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setCutiData([...cutiData, response.data]);
        showSuccessModal(`Data cuti baru berhasil ditambahkan!`);
      } else { // 'edit'
        response = await axios.put(`/api/employees/${employeeId}/cuti/${selectedData.id}`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setCutiData(cutiData.map(item => (item.id === selectedData.id ? response.data : item)));
        showSuccessModal(`Data cuti berhasil diperbarui!`);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Gagal menyimpan data cuti:", error.response ? error.response.data : error.message);
      alert("Terjadi kesalahan saat menyimpan data.");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/employees/${employeeId}/cuti/${selectedData.id}`);
      setCutiData(cutiData.filter(item => item.id !== selectedData.id));
      showSuccessModal(`Data cuti telah dihapus!`);
      handleCloseModal();
    } catch (error) {
      console.error("Gagal menghapus data cuti:", error);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };

  const getModalTitle = () => {
    if (modalType === 'edit') return 'Edit Riwayat Cuti';
    if (modalType === 'add') return 'Tambah Riwayat Cuti';
    return 'Konfirmasi Hapus';
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
          <div className="modal-form-group"><label htmlFor="jenisCuti">Jenis Cuti</label><input type="text" id="jenisCuti" name="jenisCuti" value={formData.jenisCuti || ''} onChange={handleInputChange} required /></div>
          <div className="modal-form-group"><label htmlFor="nomorSurat">Nomor Surat</label><input type="text" id="nomorSurat" name="nomorSurat" value={formData.nomorSurat || ''} onChange={handleInputChange} /></div>
          <div className="modal-form-group"><label htmlFor="tanggalSurat">Tanggal Surat</label><input type="text" id="tanggalSurat" placeholder="dd-mm-yyyy" name="tanggalSurat" value={formData.tanggalSurat || ''} onChange={handleInputChange} /></div>
          <div className="modal-form-group"><label htmlFor="tanggalAwal">Tanggal Awal</label><input type="text" id="tanggalAwal" placeholder="dd-mm-yyyy" name="tanggalAwal" value={formData.tanggalAwal || ''} onChange={handleInputChange} /></div>
          <div className="modal-form-group"><label htmlFor="tanggalSelesai">Tanggal Selesai</label><input type="text" id="tanggalSelesai" placeholder="dd-mm-yyyy" name="tanggalSelesai" value={formData.tanggalSelesai || ''} onChange={handleInputChange} /></div>
          
          <div className="modal-form-group">
            <label>Upload Surat Izin Cuti (Opsional)</label>
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
            <input type="file" id="berkas" ref={fileInputRef} accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
          </div>

          <div className="modal-form-actions"><button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button><button type="submit" className="btn btn-primary">Simpan</button></div>
        </form>
      );
    }

    if (modalType === 'delete' && selectedData) {
      return (
        <div>
          <p>Anda yakin ingin menghapus data cuti:</p>
          <p><strong>{selectedData.jenisCuti} ({selectedData.nomorSurat})</strong>?</p>
          <div className="modal-form-actions"><button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button><button type="button" className="btn btn-danger" onClick={handleDelete}>Hapus</button></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="riwayat-container">
      <div className="riwayat-header">
        <div><h3>Riwayat Cuti</h3><p className="subtitle">Informasi Cuti.</p></div>
        <button className="add-button-icon" title="Tambah Riwayat Cuti" onClick={() => handleOpenModal('add')}><FaPencilAlt /></button>
      </div>
      <div className="table-controls">
        <div className="search-box"><label>Search:</label> <input type="search" /></div>
      </div>
      <div className="table-responsive-wrapper">
        <table className="riwayat-table">
          <thead>
            <tr><th>No</th><th>Jenis Cuti</th><th>Nomor Surat</th><th>Tanggal Surat</th><th>Tanggal Awal</th><th>Tanggal Selesai</th><th>Berkas</th><th>Opsi</th></tr>
          </thead>
          <tbody>
            {cutiData.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.jenisCuti}</td>
                <td>{item.nomorSurat}</td>
                <td>{item.tanggalSurat}</td>
                <td>{item.tanggalAwal}</td>
                <td>{item.tanggalSelesai}</td>
                <td>
                  {item.berkasUrl && item.berkasUrl !== '#' ? (
                    <a href={`${item.berkasUrl}`} className="download-button" target="_blank" rel="noopener noreferrer">
                      Download
                    </a>
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

export default RiwayatCuti;
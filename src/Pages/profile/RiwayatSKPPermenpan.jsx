import React, { useState, useRef, useEffect } from 'react';
import { FaPencilAlt, FaTrash, FaDownload, FaFileAlt } from 'react-icons/fa';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import Modal from '../../components/Modal';
import SuccessModal from '../../components/SuccessModal';
import { useAuth } from '../../context/AuthContext';

const RiwayatSKPPermenpan = ({ data: propData, employeeId: propEmployeeId }) => {
  const [skpData, setSkpData] = useState([]);
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
    const initialData = propData || context?.riwayat?.skpPermenpan || [];
    setSkpData(initialData);
  }, [propData, context]);

  const handleOpenModal = (type, dataItem = null) => {
    setModalType(type);
    setSelectedFile(null); // Selalu reset file
    if (type === 'edit') {
      setSelectedData(dataItem);
      setFormData(dataItem);
    } else if (type === 'add') {
      setSelectedData(null);
      setFormData({ tahun: '', predikatKinerja: '', hasilEvaluasi: '' });
    } else { // 'delete'
      setSelectedData(dataItem);
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
        response = await axios.post(`/api/employees/${employeeId}/skp-permenpan`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSkpData([...skpData, response.data]);
        showSuccessModal(`Data SKP Permenpan baru berhasil ditambahkan!`);
      } else {
        response = await axios.put(`/api/employees/${employeeId}/skp-permenpan/${selectedData.id}`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSkpData(skpData.map(item => (item.id === selectedData.id ? response.data : item)));
        showSuccessModal(`Data SKP Permenpan berhasil diperbarui!`);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Gagal menyimpan data SKP Permenpan:", error.response ? error.response.data : error.message);
      alert("Terjadi kesalahan saat menyimpan data.");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/employees/${employeeId}/skp-permenpan/${selectedData.id}`);
      setSkpData(skpData.filter(item => item.id !== selectedData.id));
      showSuccessModal(`Data SKP Permenpan telah dihapus!`);
      handleCloseModal();
    } catch (error) {
      console.error("Gagal menghapus data SKP Permenpan:", error);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };

  const getModalTitle = () => {
    if (modalType === 'edit') return 'Edit Riwayat SKP Permenpan';
    if (modalType === 'add') return 'Tambah Riwayat SKP Permenpan';
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
          <div className="modal-form-group"><label htmlFor="tahun">Tahun</label><input type="number" id="tahun" name="tahun" value={formData.tahun || ''} onChange={handleInputChange} required /></div>
          <div className="modal-form-group"><label htmlFor="predikatKinerja">Predikat Kinerja</label><input type="text" id="predikatKinerja" name="predikatKinerja" value={formData.predikatKinerja || ''} onChange={handleInputChange} /></div>
          <div className="modal-form-group"><label htmlFor="hasilEvaluasi">Hasil Evaluasi</label><input type="text" id="hasilEvaluasi" name="hasilEvaluasi" value={formData.hasilEvaluasi || ''} onChange={handleInputChange} /></div>
          
          <div className="modal-form-group">
            <label>Upload Berkas SKP (Opsional)</label>
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
          <p>Anda yakin ingin menghapus data SKP Permenpan untuk tahun:</p>
          <p><strong>{selectedData.tahun}</strong>?</p>
          <div className="modal-form-actions"><button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button><button type="button" className="btn btn-danger" onClick={handleDelete}>Hapus</button></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="riwayat-container">
      <div className="riwayat-header">
        <div><h3>Riwayat SKP Permenpan</h3><p className="subtitle">Informasi riwayat SKP berdasarkan Permenpan.</p></div>
        <button className="add-button-icon" title="Tambah Data" onClick={() => handleOpenModal('add')}><FaPencilAlt /></button>
      </div>
      <div className="table-controls">
        <div className="search-box"><label>Search:</label> <input type="search" /></div>
      </div>
      <div className="table-responsive-wrapper">
        <table className="riwayat-table">
          <thead>
            <tr><th>#</th><th>Tahun</th><th>Predikat Kinerja</th><th>Hasil Evaluasi</th><th>Berkas</th><th>Opsi</th></tr>
          </thead>
          <tbody>
            {skpData.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.tahun}</td>
                <td>{item.predikatKinerja}</td>
                <td>{item.hasilEvaluasi}</td>
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

export default RiwayatSKPPermenpan;
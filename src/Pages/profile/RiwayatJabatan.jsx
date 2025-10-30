import React, { useState, useRef, useEffect } from 'react';
import { FaPencilAlt, FaSync, FaTrash, FaDownload, FaFileAlt } from 'react-icons/fa';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import Modal from '../../components/Modal';
import SuccessModal from '../../components/SuccessModal';
import { useAuth } from '../../context/AuthContext';

const RiwayatJabatan = ({ data: propData, employeeId: propEmployeeId }) => {
  const [jabatanData, setJabatanData] = useState([]);
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
    const initialData = propData || context?.riwayat?.jabatan || [];
    setJabatanData(initialData);
  }, [propData, context]);

  const handleOpenModal = (type, dataItem = null) => {
    setModalType(type);
    setSelectedFile(null); // Reset file input setiap modal dibuka
    if (type === 'edit') {
      setSelectedData(dataItem);
      setFormData(dataItem);
    } else if (type === 'add') {
      setSelectedData(null);
      setFormData({ namaJabatan: '', noSk: '', tglSk: '', tmtJabatan: '' });
    } else {
      setSelectedData(dataItem);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset state saat modal ditutup
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
    // Append semua data dari form state ke FormData
    Object.keys(formData).forEach(key => {
        dataToSend.append(key, formData[key]);
    });

    // Jika ada file yang dipilih, tambahkan ke FormData
    if (selectedFile) {
        dataToSend.append('berkas', selectedFile);
    }

    try {
        let response;
        if (modalType === 'add') {
            response = await axios.post(`/api/employees/${employeeId}/jabatan`, dataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setJabatanData([...jabatanData, response.data]);
            showSuccessModal(`Data jabatan baru berhasil ditambahkan!`);
        } else { // 'edit'
            response = await axios.put(`/api/employees/${employeeId}/jabatan/${selectedData.id}`, dataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setJabatanData(jabatanData.map(item => (item.id === selectedData.id ? response.data : item)));
            showSuccessModal(`Data jabatan berhasil diperbarui!`);
        }
        handleCloseModal();
    } catch (error) {
        console.error("Gagal menyimpan data jabatan:", error.response ? error.response.data : error.message);
        alert("Terjadi kesalahan saat menyimpan data.");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/employees/${employeeId}/jabatan/${selectedData.id}`);
      setJabatanData(jabatanData.filter(item => item.id !== selectedData.id));
      showSuccessModal(`Data jabatan telah dihapus!`);
      handleCloseModal();
    } catch (error) {
      console.error("Gagal menghapus data jabatan:", error);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };

  const getModalTitle = () => {
    if (modalType === 'edit') return 'Edit Riwayat Jabatan';
    if (modalType === 'add') return 'Tambah Riwayat Jabatan';
    return 'Konfirmasi Hapus Data';
  };
  
  // Helper untuk mendapatkan nama file dari URL
  const getFileNameFromUrl = (url) => {
    if (!url) return "Tidak ada file";
    try {
      const urlParts = url.split('/');
      const lastPart = urlParts.pop();
      // Menghapus timestamp dan prefix unik
      const nameParts = lastPart.split('-');
      if (nameParts.length > 3) {
        return nameParts.slice(3).join('-');
      }
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
          <div className="modal-form-group"><label>Nama Jabatan</label><input type="text" name="namaJabatan" value={formData.namaJabatan || ''} onChange={handleInputChange} required /></div>
          <div className="modal-form-group"><label>No. SK</label><input type="text" name="noSk" value={formData.noSk || ''} onChange={handleInputChange} required /></div>
          <div className="modal-form-group"><label>Tgl. SK</label><input type="text" name="tglSk" placeholder="dd-mm-yyyy" value={formData.tglSk || ''} onChange={handleInputChange} required /></div>
          <div className="modal-form-group"><label>TMT. Jabatan</label><input type="text" name="tmtJabatan" placeholder="dd-mm-yyyy" value={formData.tmtJabatan || ''} onChange={handleInputChange} /></div>
          
          <div className="modal-form-group">
            <label>Upload Berkas SK</label>
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
            <input type="file" ref={fileInputRef} accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
          </div>

          <div className="modal-form-actions"><button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button><button type="submit" className="btn btn-primary">Simpan</button></div>
        </form>
      );
    }
    if (modalType === 'delete' && selectedData) {
      return (
        <div>
          <p>Anda yakin ingin menghapus data jabatan:</p>
          <p><strong>{selectedData.namaJabatan}</strong>?</p>
          <div className="modal-form-actions"><button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button><button type="button" className="btn btn-danger" onClick={handleDelete}>Hapus</button></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="riwayat-container">
      <div className="riwayat-header">
        <div><h3>Riwayat Jabatan</h3><p className="subtitle">Informasi riwayat jabatan selama bekerja.</p></div>
        <button className="add-button-icon" title="Tambah Riwayat Jabatan" onClick={() => handleOpenModal('add')}><FaPencilAlt /></button>
      </div>
      <div className="table-controls">
        <div className="search-box"><label htmlFor="search">Search:</label><input type="search" id="search" /></div>
      </div>
      <div className="table-responsive-wrapper">
        <table className="riwayat-table">
          <thead><tr><th>#</th><th>Nama Jabatan</th><th>No. SK</th><th>Tgl. SK</th><th>TMT. Jabatan</th><th>Berkas</th><th>Opsi</th></tr></thead>
          <tbody>
            {jabatanData.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.namaJabatan}</td>
                <td>{item.noSk}</td>
                <td>{item.tglSk}</td>
                <td>{item.tmtJabatan}</td>
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
            // Tetap refresh halaman setelah modal ditutup
            window.location.reload();
        }}
        message={successMessage}
      />
    </div>
  );
};

export default RiwayatJabatan;
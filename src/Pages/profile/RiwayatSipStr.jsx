import React, { useState, useRef, useEffect } from 'react';
import { FaPencilAlt, FaTrash, FaDownload, FaFileAlt } from 'react-icons/fa';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import Modal from '../../components/Modal';
import SuccessModal from '../../components/SuccessModal';
import { useAuth } from '../../context/AuthContext';

// Helper untuk format tanggal
const formatDateForInput = (dateStr) => {
  if (!dateStr || !/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return '';
  const [day, month, year] = dateStr.split('-');
  return `${year}-${month}-${day}`;
};

const formatDateForDisplay = (dateStr) => {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
};

const RiwayatSipStr = ({ data: propData, employeeId: propEmployeeId }) => {
  const [sipStrData, setSipStrData] = useState([]);
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
    const initialData = propData || context?.riwayat?.sipstr || [];
    setSipStrData(initialData);
  }, [propData, context]);

  const handleOpenModal = (type, dataItem = null) => {
    setModalType(type);
    setSelectedFile(null);
    if (type === 'edit') {
      setSelectedData(dataItem);
      const formattedData = {
        ...dataItem,
        tglTerbit: formatDateForInput(dataItem.tglTerbit),
        tglBerlaku: formatDateForInput(dataItem.tglBerlaku),
      };
      setFormData(formattedData);
    } else if (type === 'add') {
      setSelectedData(null);
      setFormData({ jenis: 'STR', nomor: '', tglTerbit: '', tglBerlaku: '' });
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
    
    const dataToSave = {
      ...formData,
      tglTerbit: formatDateForDisplay(formData.tglTerbit),
      tglBerlaku: formatDateForDisplay(formData.tglBerlaku),
    };

    Object.keys(dataToSave).forEach(key => {
        dataToSend.append(key, dataToSave[key] || '');
    });
    if (selectedFile) {
        dataToSend.append('berkas', selectedFile);
    }

    try {
      let response;
      if (modalType === 'add') {
        response = await axios.post(`/api/employees/${employeeId}/sipstr`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSipStrData([...sipStrData, response.data]);
        showSuccessModal(`Data ${formData.jenis} baru berhasil ditambahkan!`);
      } else {
        response = await axios.put(`/api/employees/${employeeId}/sipstr/${selectedData.id}`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSipStrData(sipStrData.map(item => (item.id === selectedData.id ? response.data : item)));
        showSuccessModal(`Data ${formData.jenis} berhasil diperbarui!`);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Gagal menyimpan data:", error.response ? error.response.data : error.message);
      alert("Terjadi kesalahan saat menyimpan data.");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/employees/${employeeId}/sipstr/${selectedData.id}`);
      setSipStrData(sipStrData.filter(item => item.id !== selectedData.id));
      showSuccessModal(`Data ${selectedData.jenis} telah dihapus!`);
      handleCloseModal();
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };

  const getModalTitle = () => {
    if (modalType === 'edit') return `Edit Riwayat ${formData?.jenis}`;
    if (modalType === 'add') return 'Tambah Riwayat SIP/STR';
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
          <div className="modal-form-group">
            <label htmlFor="jenis">Jenis</label>
            <select id="jenis" name="jenis" value={formData.jenis || 'STR'} onChange={handleInputChange} required>
                <option value="STR">STR (Surat Tanda Registrasi)</option>
                <option value="SIP">SIP (Surat Izin Praktik)</option>
            </select>
          </div>
          <div className="modal-form-group"><label htmlFor="nomor">Nomor</label><input type="text" id="nomor" name="nomor" value={formData.nomor || ''} onChange={handleInputChange} required /></div>
          <div className="modal-form-group"><label htmlFor="tglTerbit">Tanggal Terbit</label><input type="date" id="tglTerbit" name="tglTerbit" value={formData.tglTerbit || ''} onChange={handleInputChange} /></div>
          <div className="modal-form-group"><label htmlFor="tglBerlaku">Berlaku Sampai</label><input type="date" id="tglBerlaku" name="tglBerlaku" value={formData.tglBerlaku || ''} onChange={handleInputChange} /></div>
          
          <div className="modal-form-group">
            <label>Upload Berkas (Opsional)</label>
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
          <p>Anda yakin ingin menghapus data {selectedData.jenis}:</p>
          <p><strong>{selectedData.nomor}</strong>?</p>
          <div className="modal-form-actions"><button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button><button type="button" className="btn btn-danger" onClick={handleDelete}>Hapus</button></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="riwayat-container">
      <div className="riwayat-header">
        <div><h3>Riwayat SIP & STR</h3><p className="subtitle">Informasi riwayat Surat Izin Praktik dan Surat Tanda Registrasi.</p></div>
        <button className="add-button-icon" title="Tambah Riwayat SIP/STR" onClick={() => handleOpenModal('add')}><FaPencilAlt /></button>
      </div>
      <div className="table-controls">
        <div className="search-box"><label htmlFor="search">Search:</label><input type="search" id="search" /></div>
      </div>
      <div className="table-responsive-wrapper">
        <table className="riwayat-table">
          <thead><tr><th>#</th><th>Jenis</th><th>Nomor</th><th>Tanggal Terbit</th><th>Berlaku Sampai</th><th>Berkas</th><th>Opsi</th></tr></thead>
          <tbody>
            {sipStrData.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.jenis}</td>
                <td>{item.nomor}</td>
                <td>{item.tglTerbit}</td>
                <td>{item.tglBerlaku}</td>
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

export default RiwayatSipStr;
import React, { useState, useRef, useEffect } from 'react';
import { FaPencilAlt, FaTrash, FaDownload, FaFileAlt } from 'react-icons/fa';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import Modal from '../../components/Modal';
import SuccessModal from '../../components/SuccessModal';
import { useAuth } from '../../context/AuthContext';

const DataKeluarga = ({ data: propData, employeeId: propEmployeeId }) => {
  const [keluargaData, setKeluargaData] = useState([]);
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
    const initialData = propData || context?.riwayat?.keluarga || [];
    setKeluargaData(initialData);
  }, [propData, context]);

  const dataSuamiIstri = keluargaData.filter(d => d.kategori === 'pasangan');
  const dataOrangTua = keluargaData.filter(d => d.kategori === 'orangtua');
  const dataAnak = keluargaData.filter(d => d.kategori === 'anak');

  const handleOpenModal = (type, data = null) => {
    setModalType(type);
    setSelectedFile(null);
    if (type.startsWith('edit')) {
      setSelectedData(data);
      setFormData(data);
    } else if (type.startsWith('add')) {
      setSelectedData(null);
      if (type === 'add-pasangan') setFormData({ kategori: 'pasangan', nama: '', ttl: '', tglKawin: '' });
      if (type === 'add-orangtua') setFormData({ kategori: 'orangtua', nama: '', status: '', ttl: '', alamat: '' });
      if (type === 'add-anak') setFormData({ kategori: 'anak', nama: '', ttl: '', pendidikan: '' });
    } else {
      setSelectedData(data);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType(''); // <-- Perbaikan 1: Reset modalType
    setFormData(null);
    setSelectedData(null); // <-- Perbaikan 2: Reset selectedData
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
        dataToSend.append(key, formData[key] || ''); // Kirim string kosong jika null/undefined
    });
    if (selectedFile) {
        dataToSend.append('berkas', selectedFile);
    }
    
    try {
      let response;
      if (modalType.startsWith('add')) {
        response = await axios.post(`/api/employees/${employeeId}/keluarga`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setKeluargaData([...keluargaData, response.data]);
        showSuccessModal('Data keluarga baru berhasil ditambahkan!');
      } else {
        response = await axios.put(`/api/employees/${employeeId}/keluarga/${selectedData.id}`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setKeluargaData(keluargaData.map(item => (item.id === selectedData.id ? response.data : item)));
        showSuccessModal('Data keluarga berhasil diperbarui!');
      }
      handleCloseModal();
    } catch (error) {
      console.error("Gagal menyimpan data keluarga:", error.response ? error.response.data : error.message);
      alert("Terjadi kesalahan saat menyimpan data.");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/employees/${employeeId}/keluarga/${selectedData.id}`);
      setKeluargaData(keluargaData.filter(item => item.id !== selectedData.id));
      showSuccessModal('Data keluarga berhasil dihapus!');
      handleCloseModal();
    } catch (error) {
      console.error("Gagal menghapus data keluarga:", error);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };

  const getModalTitle = () => {
    if (modalType.startsWith('edit')) return 'Edit Data Keluarga';
    if (modalType.startsWith('add')) return 'Tambah Data Keluarga';
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

  const renderFileInput = (berkasLabel) => {
    const existingFileUrl = formData?.berkasUrl && formData.berkasUrl !== '#' ? `${formData.berkasUrl}` : null;
    const existingFileName = existingFileUrl ? getFileNameFromUrl(formData.berkasUrl) : null;

    return (
        <div className="modal-form-group">
            <label>{berkasLabel}</label>
            {modalType.startsWith('edit') && existingFileName && !selectedFile && (
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
    );
  };

  const renderModalContent = () => {
    // Perbaikan 3: Pindahkan pengecekan ke dalam setiap blok kondisi
    if ((modalType.startsWith('add') || modalType.startsWith('edit')) && formData) {
      if (modalType.includes('pasangan')) {
        return (
          <form onSubmit={handleSaveChanges}>
            <div className="modal-form-group"><label>Nama Suami / Istri</label><input type="text" name="nama" value={formData.nama || ''} onChange={handleInputChange} required /></div>
            <div className="modal-form-group"><label>Tempat, Tgl. Lahir</label><input type="text" name="ttl" value={formData.ttl || ''} onChange={handleInputChange} /></div>
            <div className="modal-form-group"><label>Tgl. Kawin</label><input type="text" name="tglKawin" placeholder="dd-mm-yyyy" value={formData.tglKawin || ''} onChange={handleInputChange} /></div>
            {renderFileInput('Upload Berkas (Buku Nikah)')}
            <div className="modal-form-actions"><button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button><button type="submit" className="btn btn-primary">Simpan</button></div>
          </form>
        );
      }
      if (modalType.includes('orangtua')) {
          return (
            <form onSubmit={handleSaveChanges}>
              <div className="modal-form-group"><label>Status</label><select name="status" value={formData.status || ''} onChange={handleInputChange} required><option value="" disabled>Pilih Status</option><option value="Bapak Kandung">Bapak Kandung</option><option value="Ibu Kandung">Ibu Kandung</option></select></div>
              <div className="modal-form-group"><label>Nama</label><input type="text" name="nama" value={formData.nama || ''} onChange={handleInputChange} required /></div>
              <div className="modal-form-group"><label>Tempat, Tgl. Lahir</label><input type="text" name="ttl" value={formData.ttl || ''} onChange={handleInputChange} /></div>
              <div className="modal-form-group"><label>Alamat</label><input type="text" name="alamat" value={formData.alamat || ''} onChange={handleInputChange} /></div>
              {renderFileInput('Upload Berkas (Kartu Keluarga)')}
              <div className="modal-form-actions"><button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button><button type="submit" className="btn btn-primary">Simpan</button></div>
            </form>
          );
      }
      if (modalType.includes('anak')) {
        return (
          <form onSubmit={handleSaveChanges}>
            <div className="modal-form-group"><label>Nama Anak</label><input type="text" name="nama" value={formData.nama || ''} onChange={handleInputChange} required /></div>
            <div className="modal-form-group"><label>Tempat, Tgl. Lahir</label><input type="text" name="ttl" value={formData.ttl || ''} onChange={handleInputChange} /></div>
            <div className="modal-form-group"><label>Pendidikan</label><input type="text" name="pendidikan" value={formData.pendidikan || ''} onChange={handleInputChange} /></div>
            {renderFileInput('Upload Berkas (Akta Lahir)')}
            <div className="modal-form-actions"><button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button><button type="submit" className="btn btn-primary">Simpan</button></div>
          </form>
        );
      }
    }

    if (modalType.startsWith('delete-') && selectedData) {
      return (
        <div><p>Anda yakin ingin menghapus data: <strong>{selectedData.nama}</strong>?</p><div className="modal-form-actions"><button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button><button type="button" className="btn btn-danger" onClick={handleDelete}>Hapus</button></div></div>
      );
    }
    
    return null; // Jika tidak ada kondisi yang cocok, jangan render apa-apa
  };

  const renderTable = (title, data, type) => {
    const headers = {
      pasangan: ['#', 'Nama', 'TTL', 'Tgl. Kawin', 'Berkas', 'Opsi'],
      orangtua: ['#', 'Nama', 'Status', 'TTL', 'Alamat', 'Berkas', 'Opsi'],
      anak: ['#', 'Nama', 'TTL', 'Pendidikan', 'Berkas', 'Opsi'],
    };

    const renderRow = (item, index) => {
        const cells = {
            pasangan: [index + 1, item.nama, item.ttl, item.tglKawin],
            orangtua: [index + 1, item.nama, item.status, item.ttl, item.alamat],
            anak: [index + 1, item.nama, item.ttl, item.pendidikan],
        };
        return (
            <tr key={item.id}>
                {cells[type].map((cell, i) => <td key={i}>{cell}</td>)}
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
                        <button className="action-btn edit" title="Edit" onClick={() => handleOpenModal(`edit-${type}`, item)}><FaPencilAlt /></button>
                        <button className="action-btn delete" title="Delete" onClick={() => handleOpenModal(`delete-${type}`, item)}><FaTrash /></button>
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className="riwayat-container">
            <div className="riwayat-header">
                <h3>{title}</h3>
                <button className="add-button-icon" title={`Tambah Data ${title}`} onClick={() => handleOpenModal(`add-${type}`)}>
                    <FaPencilAlt />
                </button>
            </div>
            <div className="table-responsive-wrapper">
                <table className="riwayat-table">
                    <thead><tr>{headers[type].map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
                    <tbody>{data.map(renderRow)}</tbody>
                </table>
            </div>
        </div>
    );
  };

  return (
    <div className="data-keluarga-container">
      {renderTable('Suami / Istri', dataSuamiIstri, 'pasangan')}
      {renderTable('Ibu & Bapak Kandung', dataOrangTua, 'orangtua')}
      {renderTable('Anak', dataAnak, 'anak')}
      
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

export default DataKeluarga;
import React from 'react';
import Modal from './Modal';
import './Modal.css';

const SuccessModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    // Jalankan fungsi onConfirm jika ada
    if (onConfirm) {
      onConfirm();
    }
    // Selalu tutup modal setelah konfirmasi
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || "Sukses"}>
      <div className="modal-body">
        <p>{message}</p>
      </div>
      <div className="modal-form-actions">
        <button type="button" className="btn btn-primary" onClick={handleConfirm}>
          OK
        </button>
      </div>
    </Modal>
  );
};

export default SuccessModal;
// src/components/Modal.jsx (Kode Final yang Diperbarui)

import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children, className }) => {
  if (!isOpen) {
    return null;
  }

  return (
    // Lapisan luar yang gelap (overlay)
    <div className="modal-overlay" onClick={onClose}>
      {/* Konten modal, event klik di sini dihentikan agar tidak menutup modal */}
      <div className={`modal-content ${className || ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h4 className="modal-title">{title}</h4>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <div className="modal-body">
          {children} {/* Ini adalah bagian terpenting, tempat konten dinamis akan muncul */}
        </div>
      </div>
    </div>
  );
};

export default Modal;
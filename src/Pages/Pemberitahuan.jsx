import React, { useState } from 'react';
import './Pemberitahuan.css';

// --- Data Notifikasi Contoh yang Disesuaikan dengan Status Kepegawaian ---
const initialNotifications = [
  {
    id: 1,
    type: 'error',
    icon: '×',
    title: 'Pengajuan Cuti Ditolak',
    message: "Maaf, pengajuan cuti Anda untuk tanggal 25-27 Oktober 2025 ditolak karena kebutuhan mendesak di unit kerja Anda.",
    timestamp: 'Baru saja',
    isRead: false,
  },
  {
    id: 2,
    type: 'warning',
    icon: '!',
    title: 'Perubahan Data Pendidikan Menunggu Persetujuan',
    message: "Pengajuan Anda untuk menambahkan riwayat pendidikan 'S.2 - MANAJEMEN PEMBANGUNAN DAERAH' sedang ditinjau oleh Admin.",
    timestamp: '1 jam yang lalu',
    isRead: false,
  },
  {
    id: 3,
    type: 'success',
    icon: '✓',
    title: 'Riwayat Jabatan Berhasil Diperbarui',
    message: "Data riwayat jabatan Anda sebagai 'Kepala Bagian Ketatausahaan' telah berhasil disimpan ke dalam sistem.",
    timestamp: 'Kemarin',
    isRead: true,
  },
  {
    id: 4,
    type: 'success',
    icon: '✓',
    title: 'Data Keluarga Berhasil Ditambahkan',
    message: "Penambahan data anggota keluarga atas nama 'Anisa Putri' sebagai anak telah berhasil diverifikasi dan disimpan.",
    timestamp: '2 hari yang lalu',
    isRead: true,
  },
];


const Pemberitahuan = () => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notif) => ({ ...notif, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  return (
    <div className="pemberitahuan-card">
      <div className="pemberitahuan-header">
        <div>
          <h2>Pemberitahuan</h2>
          <p className="subtitle">
            Anda memiliki {unreadCount} pemberitahuan belum dibaca.
          </p>
        </div>
        <button onClick={markAllAsRead} className="tandai-semua-btn">
            Tandai semua dibaca
        </button>
      </div>

      <div className="notification-list">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notification-item ${notif.isRead ? 'read' : 'unread'}`}
              onClick={() => markAsRead(notif.id)}
            >
              <div className={`notification-icon ${notif.type}`}>
                {notif.icon}
              </div>
              <div className="notification-content">
                <p className="notification-title">{notif.title}</p>
                <p className="notification-message">{notif.message}</p>
              </div>
              <div className="notification-meta">
                <span className="notification-timestamp">{notif.timestamp}</span>
                {!notif.isRead && <div className="unread-dot"></div>}
              </div>
            </div>
          ))
        ) : (
          <div className="no-notification">
            <p>Tidak ada pemberitahuan saat ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pemberitahuan;


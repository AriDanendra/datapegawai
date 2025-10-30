import React from 'react';

// Terima props dari App.js
const MainContent = ({ employee }) => {
  // Objek employee sekarang datang dari props, tidak didefinisikan di sini lagi

  return (
    <main className="main-content">
      <div className="welcome-header">
        <h2>Selamat Datang</h2>

        {/* --- BARIS BARU DITAMBAHKAN DI SINI --- */}
        <p className="app-subtitle">
          Sistem Informasi Manajemen Kepegawaian Rumah Sakit Regional dr. Hasri Ainun Habibie
        </p>
        
        <p className="description">
          Aplikasi ini dirancang untuk mengelola data kepegawaian secara efisien dan terpusat.
        </p>
      </div>

      <div className="profile-card">
        {/* ... sisa kode tidak berubah ... */}
        <img src="/assets/profile-pic.jpg" alt="Foto Profil Pegawai" className="profile-picture" />
        <div className="profile-data">
          <h3 className="employee-name">Selamat Datang, {employee.name.toUpperCase()}</h3>
          
          <table>
            <tbody>
              <tr>
                <td>NIP</td>
                <td>: {employee.nip}</td>
              </tr>
              <tr>
                <td>Tempat/Tgl Lahir</td>
                <td>: {employee.ttl}</td>
              </tr>
              <tr>
                <td>AGAMA</td>
                <td>: {employee.agama}</td>
              </tr>
              <tr>
                <td>SUKU</td>
                <td>: {employee.suku}</td>
              </tr>
              <tr>
                <td>Alamat</td>
                <td>: {employee.alamat}</td>
              </tr>
              <tr>
                <td colSpan="2">&nbsp;</td>
              </tr>
              <tr>
                <td colSpan="2">{employee.pendidikan}</td>
              </tr>
              <tr>
                <td colSpan="2">{employee.golongan}</td>
              </tr>
              <tr>
                <td colSpan="2">&nbsp;</td>
              </tr>
              <tr>
                <td>No.Hp/Telp</td>
                <td>: {employee.nomorHp}</td>
              </tr>
              <tr>
                <td>Email</td>
                <td>: {employee.email}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default MainContent;
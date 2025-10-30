import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import './App.css';

// Context dan Halaman Login
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './Pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

// Komponen Layout Utama
import Header from './components/Header';
import Sidebar from './components/Sidebar';

// Halaman Pegawai
import Dashboard from './Pages/Dashboard';
import ProfilePage from './Pages/ProfilePage';
import RiwayatJabatan from './Pages/profile/RiwayatJabatan';
import DataKeluarga from './Pages/profile/DataKeluarga';
import StatusKepegawaian from './Pages/profile/StatusKepegawaian';
import DataKGB from './Pages/profile/DataKGB';
import RiwayatPendidikan from './Pages/profile/RiwayatPendidikan';
import RiwayatDiklat from './Pages/profile/RiwayatDiklat';
import RiwayatPenghargaan from './Pages/profile/RiwayatPenghargaan';
import RiwayatCuti from './Pages/profile/RiwayatCuti';
import RiwayatOrganisasi from './Pages/profile/RiwayatOrganisasi';
import RiwayatSKP from './Pages/profile/RiwayatSKP';
import RiwayatSKPPermenpan from './Pages/profile/RiwayatSKPPermenpan';
import RiwayatHukuman from './Pages/profile/RiwayatHukuman';
import RiwayatSipStr from './Pages/profile/RiwayatSipStr'; // Diimpor
import UbahPassword from './Pages/UbahPassword';

// Halaman Admin
import AdminDashboard from './Pages/admin/AdminDashboard';
import DaftarPegawai from './Pages/admin/DaftarPegawai';
import PegawaiDetailPage from './Pages/admin/PegawaiDetailPage';

// Layout Utama Aplikasi
const MainLayout = () => {
  const { user } = useAuth(); // Ambil data pengguna dari context
  const [isSidebarOpen, setSidebarOpen] = React.useState(window.innerWidth > 768);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  React.useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app-container">
      <Header toggleSidebar={toggleSidebar} />
      <div className="main-body-container">
        {/* Meneruskan fungsi toggleSidebar ke komponen Sidebar */}
        <Sidebar employee={user} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="content-wrapper">
          <main className="main-content">
            <Outlet />
          </main>
          <footer className="footer">Tahun 2025</footer>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Rute yang Dilindungi */}
          <Route
            path="/*"
            element={
              <ProtectedRoute allowedRoles={['pegawai', 'admin']}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Rute Pegawai */}
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<ProfilePage />}>
              <Route index element={<div style={{textAlign: 'center', padding: '2rem', color: '#6c757d'}}><p>Silakan pilih menu di atas untuk melihat detail riwayat.</p></div>} />
              <Route path="jabatan" element={<RiwayatJabatan />} />
              <Route path="keluarga" element={<DataKeluarga />} />
              <Route path="status" element={<StatusKepegawaian />} />
              <Route path="kgb" element={<DataKGB />} />
              <Route path="pendidikan" element={<RiwayatPendidikan />} />
              <Route path="diklat" element={<RiwayatDiklat />} />
              <Route path="penghargaan" element={<RiwayatPenghargaan />} />
              <Route path="cuti" element={<RiwayatCuti />} />
              <Route path="sipstr" element={<RiwayatSipStr />} /> {/* Ditambahkan */}
              <Route path="organisasi" element={<RiwayatOrganisasi />} />
              <Route path="skp" element={<RiwayatSKP />} />
              <Route path="skp-permenpan" element={<RiwayatSKPPermenpan />} />
              <Route path="hukuman" element={<RiwayatHukuman />} />
            </Route>
            <Route path="ubah-password" element={<UbahPassword />} />
            
            {/* Rute Admin */}
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/daftar-pegawai" element={<DaftarPegawai />} />
            <Route path="admin/pegawai/detail/:employeeId" element={<PegawaiDetailPage />} />
            <Route path="admin/ubah-password" element={<UbahPassword />} />
          </Route>
          
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;


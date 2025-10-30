// src/_mock.jsx (Struktur Baru & Final)

// =================================================================
// ==         PUSAT DATA TIRUAN (MOCK DATABASE)                   ==
// =================================================================

export const allEmployees = [
  {
    id: 1,
    name: 'hj tunru, S.T.',
    nip: '010229725 / 198804011990032010',
    jabatan: 'Kepala Bagian Ketatausahaan, Humas dan Hukum',
    golongan: 'PEMBINA (IVa)',
    profilePictureUrl: '/assets/profile-pic.jpg',
    password: '12345678',
    // -- Data Lengkap untuk Halaman Profil --
    ttl: 'Parepare, 01-04-1988',
    agama: 'ISLAM',
    suku: '-',
    alamat: 'Jl. Mattiro Jompi No. 5, Parepare',
    pendidikan: 'S.2 - MANAJEMEN PEMBANGUNAN DAERAH',
    instansi: 'UPT RUMAH SAKIT DR. HASRI AINUN HABIBIE',
    nomorHp: '08114225580',
    email: 'edwinzhoker@gmail.com',
    noKtp: '7372010104880001',
    noNpwp: '12.345.678.9-012.000',
    noKarpeg: 'J 123456',
    noKaris: 'K 789012',
    noAskes: '0001234567890',
    noTaspen: '9876543210',
    noRekening: '123-456-7890 (Bank Sulselbar)',
    
    // SEMUA RIWAYAT DAN DOKUMEN SEKARANG ADA DI SINI
    riwayat: {
      jabatan: [
        { id: 1, namaJabatan: 'Kepala Bagian Ketatausahaan', noSk: '829 TAHUN 2023', tglSk: '30-10-2023', tmtJabatan: '30-10-2023', berkasUrl: '#' },
        { id: 2, namaJabatan: 'Kepala Sub Bagian Rumah Tangga', noSk: '140 TAHUN 2022', tglSk: '25-03-2022', tmtJabatan: '25-03-2022', berkasUrl: '#' },
      ],
      pendidikan: [
        { id: 1, namaSekolah: 'STIA LAN', jurusan: 'MANAJEMEN PEMBANGUNAN DAERAH', lokasi: 'MAKASSAR', noIjazah: '03.II.32.2.60', lulus: '21-01-2010', berkasUrl: '#' },
        { id: 2, namaSekolah: 'UNIVERSITAS HASANUDDIN', jurusan: 'ILMU HUKUM', lokasi: 'MAKASSAR', noIjazah: 'UH-12345678', lulus: '15-07-2005', berkasUrl: '#' },
      ],
      kgb: [
        { id: 1, noSk: '800.1.11.13/40/Umum&protokol', tglSk: '07-02-2023', tmtKgb: '01-03-2023', gajiPokok: 'Rp. 4.699.300', masaKerja: '28 Tahun', berkasUrl: '#' },
        { id: 2, noSk: 'PD.822.4/288/BKPSDMD', tglSk: '10-02-2021', tmtKgb: '01-03-2021', gajiPokok: 'Rp. 4.555.800', masaKerja: '26 Tahun', berkasUrl: '#' },
      ],
      cuti: [
        { id: 1, jenisCuti: 'Cuti Tahunan', nomorSurat: '800/139/BKPSDMD', tanggalSurat: '22-01-2025', tanggalAwal: '03-02-2025', tanggalSelesai: '18-02-2025', berkasUrl: '#' },
      ],
      statusKepegawaian: [
        { id: 1, status: 'PNS', noSk: 'PN.821.12-76', tglSk: '27-02-1993', tmtJabatan: '01-03-1993', gol: 'IIa', pangkat: 'PENGATUR MUDA', berkasUrl: '#' },
        { id: 2, status: 'CPNS', noSk: 'PD.813.2-49', tglSk: '12-07-1990', tmtJabatan: '01-03-1990', gol: 'IIa', pangkat: 'PENGATUR MUDA', berkasUrl: '#' },
      ],
      keluarga: [
        { id: 1, kategori: 'pasangan', nama: 'Siti Aminah, S.Pd.', ttl: 'Makassar, 12-05-1990', tglKawin: '15-06-2015', berkasUrl: '#' },
        { id: 2, kategori: 'orangtua', nama: 'Budi Santoso', status: 'Bapak Kandung', ttl: 'Parepare, 01-01-1960', alamat: 'Jl. Merdeka No. 10', berkasUrl: '#' },
        { id: 3, kategori: 'orangtua', nama: 'Rani Wulandari', status: 'Ibu Kandung', ttl: 'Barru, 05-08-1962', alamat: 'Jl. Merdeka No. 10', berkasUrl: '#' },
        { id: 4, kategori: 'anak', nama: 'Ahmad Zhoker', ttl: 'Parepare, 20-03-2016', pendidikan: 'SD', berkasUrl: '#' },
        { id: 5, kategori: 'anak', nama: 'Aisyah Zhoker', ttl: 'Parepare, 10-11-2018', pendidikan: 'TK', berkasUrl: '#' },
      ],
      diklat: [
        { id: 1, jenis: 'struktural', namaDiklat: 'Diklat PIM IV', tempat: 'Makassar', pelaksana: 'BPSDM Prov. Sulsel', angkatan: 'X', tanggal: '10-05-2022', berkasUrl: '#'},
        { id: 2, jenis: 'teknis', namaDiklat: 'Pelatihan Sistem Informasi Kepegawaian', tempat: 'Parepare', pelaksana: 'BKPSDMD', angkatan: 'II', tanggal: '15-09-2023', berkasUrl: '#'},
      ],
      penghargaan: [
        { id: 1, nama: 'Satyalancana Karya Satya XX Tahun', oleh: 'Presiden Republik Indonesia', noSk: '123/KEP/2023', tglSk: '10-08-2023', tahun: '2023', berkasUrl: '#' },
      ],
      organisasi: [
        { id: 1, nama: 'Persatuan Perawat Nasional Indonesia (PPNI)', jenis: 'Profesi', jabatan: 'Anggota', tempat: 'Parepare', berkasUrl: '#' },
      ],
      skp: [
        { id: 1, tahun: 2021, nilaiSKP: 123, nilaiPerilaku: 91.9, nilaiPrestasi: 87.2, berkasUrl: '#' },
        { id: 2, tahun: 2022, nilaiSKP: 125, nilaiPerilaku: 93.5, nilaiPrestasi: 88.0, berkasUrl: '#' },
      ],
      skpPermenpan: [
        { id: 'skp-p-1', tahun: 2024, predikatKinerja: 'Sangat Baik', hasilEvaluasi: 'Melebihi Ekspektasi', berkasUrl: '#'},
        { id: 'skp-p-2', tahun: 2023, predikatKinerja: 'Baik', hasilEvaluasi: 'Sesuai Ekspektasi', berkasUrl: '#'},
      ],
      hukuman: [], // Kosong untuk pegawai ini
    },
  },
  {
    id: 2,
    name: 'Dr. amin ',
    nip: '010229726 / 199005152015032001',
    jabatan: 'Dokter Spesialis Anak',
    golongan: 'PENATA (IIIc)',
    profilePictureUrl: '/assets/profile-pic.jpg',
    password: '11111111',
    riwayat: {
      jabatan: [{ id: 3, namaJabatan: 'Dokter Spesialis Anak', noSk: '123 TAHUN 2020', tglSk: '15-01-2020', tmtJabatan: '15-01-2020', berkasUrl: '#' }],
      pendidikan: [{ id: 3, namaSekolah: 'SMAN 1 PAREPARE', jurusan: 'IPA', lokasi: 'PAREPARE', noIjazah: 'SMA-987654', lulus: '10-06-2001', berkasUrl: '#' }],
      kgb: [{ id: 3, noSk: 'XYZ/01/2022', tglSk: '15-03-2022', tmtKgb: '01-04-2022', gajiPokok: 'Rp. 3.500.000', masaKerja: '5 Tahun', berkasUrl: '#' }],
      cuti: [{ id: 2, jenisCuti: 'Cuti Sakit', nomorSurat: '800/145/RS-HAH', tanggalSurat: '10-03-2024', tanggalAwal: '11-03-2024', tanggalSelesai: '13-03-2024', berkasUrl: '#' }],
      statusKepegawaian: [{ id: 3, status: 'PNS', noSk: 'PN.ABC.123', tglSk: '01-12-2016', tmtJabatan: '01-01-2017', gol: 'IIIa', pangkat: 'PENATA MUDA', berkasUrl: '#' }],
      keluarga: [{ id: 6, kategori: 'anak', nama: 'Aisyah Zhoker', ttl: 'Parepare, 10-11-2018', pendidikan: 'TK', berkasUrl: '#' },],
      diklat: [{ id: 3, jenis: 'fungsional', namaDiklat: 'Pelatihan Dokter Spesialis Anak', tempat: 'Jakarta', pelaksana: 'Kementerian Kesehatan', angkatan: 'V', tanggal: '20-02-2021', berkasUrl: '#' }],
      penghargaan: [],
      organisasi: [{ id: 2, nama: 'Ikatan Dokter Indonesia (IDI)', jenis: 'Profesi', jabatan: 'Anggota', tempat: 'Makassar', berkasUrl: '#' }],
      skp: [],
      skpPermenpan: [],
      hukuman: [],
    },
  },
  {
    id: 3,
    name: 'Andi kanse binti naskun, A.Md.Kom',
    nip: '010229727 / 199502202018011003',
    jabatan: 'Staf IT',
    golongan: 'PENGATUR (IIc)',
    profilePictureUrl: '/assets/profile-pic.jpg',
    password: '87654321',
    riwayat: {
      jabatan: [{ id: 4, namaJabatan: 'Staf IT', noSk: '456 TAHUN 2019', tglSk: '01-02-2019', tmtJabatan: '01-02-2019', berkasUrl: '#' }],
      pendidikan: [],
      kgb: [],
      cuti: [],
      statusKepegawaian: [],
      keluarga: [],
      diklat: [],
      penghargaan: [],
      organisasi: [],
      skp: [],
      skpPermenpan: [],
      hukuman: [{ id: 1, nama: 'Teguran Lisan', noSk: '862/01/PEG', tglSk: '15-01-2024', tmt: '15-01-2024', berkasUrl: '#' }],
    },
  },
  { id: 4, name: 'Budi Hartono, S.Kep., Ns.', nip: '010229728 / 199208172017031004', jabatan: 'Perawat Pelaksana', golongan: 'PENATA MUDA (IIIa)', profilePictureUrl: '/assets/profile-pic.jpg', password: 'password4', riwayat: {} },
  { id: 5, name: 'Citra Lestari, A.Md.Farm.', nip: '010229729 / 199611202019022005', jabatan: 'Asisten Apoteker', golongan: 'PENGATUR (IIc)', profilePictureUrl: '/assets/profile-pic.jpg', password: 'password5', riwayat: {} },
  { id: 6, name: 'Dewi Sartika, S.Gz.', nip: '010229730 / 199304252018032006', jabatan: 'Ahli Gizi', golongan: 'PENATA MUDA (IIIa)', profilePictureUrl: '/assets/profile-pic.jpg', password: 'password6', riwayat: {} },
  { id: 7, name: 'Eko Prasetyo, A.Md.Rad.', nip: '010229731 / 199401102019031007', jabatan: 'Radiografer', golongan: 'PENGATUR (IIc)', profilePictureUrl: '/assets/profile-pic.jpg', password: 'password7', riwayat: {} },
  { id: 8, name: 'Fitriani, S.E.', nip: '010229732 / 199107072016032008', jabatan: 'Staf Keuangan', golongan: 'PENATA MUDA (IIIa)', profilePictureUrl: '/assets/profile-pic.jpg', password: 'password8', riwayat: {} },
  { id: 9, name: 'Gunawan, A.Md.Kes.Ling.', nip: '010229733 / 199509152020011009', jabatan: 'Sanitarian', golongan: 'PENGATUR (IIc)', profilePictureUrl: '/assets/profile-pic.jpg', password: 'password9', riwayat: {} },
  { id: 10, name: 'Hasan Basri, S.Kom.', nip: '010229734 / 199003122015031010', jabatan: 'Analis Sistem Informasi', golongan: 'PENATA MUDA (IIIa)', profilePictureUrl: '/assets/profile-pic.jpg', password: 'password10', riwayat: {} },
  { id: 11, name: 'Indah Permatasari, A.Md.Keb.', nip: '010229735 / 199705222020022011', jabatan: 'Bidan Pelaksana', golongan: 'PENGATUR (IIc)', profilePictureUrl: '/assets/profile-pic.jpg', password: 'password11', riwayat: {} },
  { id: 12, name: 'Joko Susilo, S.H.', nip: '010229736 / 198912302014031012', jabatan: 'Staf Hukum dan Humas', golongan: 'PENATA (IIIc)', profilePictureUrl: '/assets/profile-pic.jpg', password: 'password12', riwayat: {} },
  { id: 13, name: 'Kartika, A.Md.AK.', nip: '010229737 / 199802142021032013', jabatan: 'Analis Laboratorium', golongan: 'PENGATUR (IIc)', profilePictureUrl: '/assets/profile-pic.jpg', password: 'password13', riwayat: {} },
  { id: 14, name: 'Lia Anggraini, S.Psi.', nip: '010229738 / 199410182019032014', jabatan: 'Psikolog Klinis', golongan: 'PENATA MUDA (IIIa)', profilePictureUrl: '/assets/profile-pic.jpg', password: 'password14', riwayat: {} },
  { id: 15, name: 'Muhammad Rizky, S.T.', nip: '010229739 / 199206052017031015', jabatan: 'Teknisi Elektromedis', golongan: 'PENATA MUDA (IIIa)', profilePictureUrl: '/assets/profile-pic.jpg', password: 'password15', riwayat: {} },
  { id: 16, name: 'Nurul Hidayah, A.Md.Fis.', nip: '010229740 / 199712012020022016', jabatan: 'Fisioterapis', golongan: 'PENGATUR (IIc)', profilePictureUrl: '/assets/profile-pic.jpg', password: 'password16', riwayat: {} },
  { id: 17, name: 'Putu Wijaya, dr.', nip: '010229741 / 199101012016031017', jabatan: 'Dokter Umum', golongan: 'PENATA (IIIc)', profilePictureUrl: '/assets/profile-pic.jpg', password: 'password17', riwayat: {} },
  { id: 18, name: 'Rina Marlina, S.Sos.', nip: '010229742 / 199308202018032018', jabatan: 'Pekerja Sosial', golongan: 'PENATA MUDA (IIIa)', profilePictureUrl: '/assets/profile-pic.jpg', password: 'password18', riwayat: {} },
  { id: 19, name: 'Siti Aisyah, A.Md.Kom.', nip: '010229743 / 199904102022032019', jabatan: 'Pranata Komputer', golongan: 'PENGATUR (IIc)', profilePictureUrl: '/assets/profile-pic.jpg', password: 'password19', riwayat: {} },
  { id: 20, name: 'Teguh Santoso, S.I.P.', nip: '010229744 / 199011112015031020', jabatan: 'Arsiparis', golongan: 'PENATA MUDA (IIIa)', profilePictureUrl: '/assets/profile-pic.jpg', password: 'password20', riwayat: {} },
  { id: 21, name: 'Wulan Sari, S.Ak.', nip: '010229745 / 199502282019032021', jabatan: 'Akuntan', golongan: 'PENATA MUDA (IIIa)', profilePictureUrl: '/assets/profile-pic.jpg', password: 'password21', riwayat: {} },
  { id: 22, name: 'Yoga Pratama, drg.', nip: '010229746 / 199209092017031022', jabatan: 'Dokter Gigi', golongan: 'PENATA (IIIc)', profilePictureUrl: '/assets/profile-pic.jpg', password: 'password22', riwayat: {} },
  { id: 23, name: 'Zainal Abidin, S.Ag.', nip: '010229747 / 198807142014031023', jabatan: 'Rohaniawan', golongan: 'PENATA (IIIc)', profilePictureUrl: '/assets/profile-pic.jpg', password: 'password23', riwayat: {} }
];

export const adminUser = {
  id: 'admin01',
  username: 'admin',
  password: 'password',
  name: 'Administrator',
  role: 'admin',
  profilePictureUrl: '/assets/profile-pic.jpg',
};
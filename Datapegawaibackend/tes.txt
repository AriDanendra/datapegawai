import { Router } from 'express';
import { allEmployees } from '../data.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Konfigurasi Multer untuk menyimpan file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Perbaikan: Gunakan path.join untuk path yang absolut dan benar
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


// Endpoint baru untuk upload foto profil
router.post('/:id/upload-profile-picture', upload.single('profilePicture'), (req, res) => {
  const employeeId = parseInt(req.params.id);
  const employeeIndex = allEmployees.findIndex(emp => emp.id === employeeId);

  if (employeeIndex !== -1) {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diunggah.' });
    }
    
    // Path file yang bisa diakses dari frontend
    const fileUrl = `/public/uploads/${req.file.filename}`;
    
    // Update data di 'database'
    allEmployees[employeeIndex].profilePictureUrl = fileUrl;

    res.json({
      message: 'Foto profil berhasil diperbarui',
      filePath: fileUrl,
      user: allEmployees[employeeIndex] // Kirim data user yang sudah diupdate
    });
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});


// GET: Mengambil semua data pegawai (READ)
router.get('/', (req, res) => {
  res.json(allEmployees);
});

// GET: Mengambil data satu pegawai berdasarkan ID (READ)
router.get('/:id', (req, res) => {
  const employee = allEmployees.find(emp => emp.id === parseInt(req.params.id));
  if (employee) {
    res.json(employee);
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// POST: Menambahkan pegawai baru (CREATE)
router.post('/', (req, res) => {
  const { name, nip, jabatan, golongan } = req.body;
  
  if (!name || !nip || !jabatan || !golongan) {
    return res.status(400).json({ message: 'Nama, NIP, Jabatan, dan Golongan harus diisi' });
  }

  const newEmployee = {
    id: Date.now(),
    name,
    nip: `${nip}`,
    jabatan,
    golongan,
    password: 'password123',
    profilePictureUrl: '/assets/profile-pic.jpg',
    riwayat: {},
    ttl: '', agama: '', alamat: '', pendidikan: '', instansi: '',
    nomorHp: '', email: '', noKtp: '', noNpwp: '', noKarpeg: '', noKaris: '',
    noAskes: '', noTaspen: '', noRekening: '',
  };

  allEmployees.unshift(newEmployee);
  res.status(201).json(newEmployee);
});

// PUT: Memperbarui data pegawai berdasarkan ID (UPDATE)
router.put('/:id', (req, res) => {
  const employeeId = parseInt(req.params.id);
  const employeeIndex = allEmployees.findIndex(emp => emp.id === employeeId);

  if (employeeIndex !== -1) {
    const updatedEmployee = { ...allEmployees[employeeIndex], ...req.body };
    allEmployees[employeeIndex] = updatedEmployee;
    res.json(updatedEmployee);
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// DELETE: Menghapus pegawai berdasarkan ID (DELETE)
router.delete('/:id', (req, res) => {
  const employeeId = parseInt(req.params.id);
  const initialLength = allEmployees.length;
  const newEmployeeList = allEmployees.filter(emp => emp.id !== employeeId);

  if (newEmployeeList.length < initialLength) {
    allEmployees.length = 0;
    allEmployees.push(...newEmployeeList);
    res.status(200).json({ message: 'Pegawai berhasil dihapus' });
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// GET: Mendapatkan semua data KGB seorang pegawai
router.get('/:id/kgb', (req, res) => {
  const employee = allEmployees.find(emp => emp.id === parseInt(req.params.id));
  if (employee) {
    res.json(employee.riwayat.kgb || []);
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// POST: Menambahkan data KGB baru untuk seorang pegawai
router.post('/:id/kgb', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const newKgb = {
      id: Date.now(), // ID unik untuk data KGB
      ...req.body,
      berkasUrl: '#' // Default value
    };
    if (!allEmployees[employeeIndex].riwayat.kgb) {
      allEmployees[employeeIndex].riwayat.kgb = [];
    }
    allEmployees[employeeIndex].riwayat.kgb.push(newKgb);
    res.status(201).json(newKgb);
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// PUT: Memperbarui data KGB spesifik
router.put('/:id/kgb/:kgbId', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const kgbIndex = allEmployees[employeeIndex].riwayat.kgb.findIndex(k => k.id === parseInt(req.params.kgbId));
    if (kgbIndex !== -1) {
      // Update data KGB
      allEmployees[employeeIndex].riwayat.kgb[kgbIndex] = {
        ...allEmployees[employeeIndex].riwayat.kgb[kgbIndex],
        ...req.body
      };
      res.json(allEmployees[employeeIndex].riwayat.kgb[kgbIndex]);
    } else {
      res.status(404).json({ message: 'Data KGB tidak ditemukan' });
    }
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// DELETE: Menghapus data KGB spesifik
router.delete('/:id/kgb/:kgbId', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const initialLength = allEmployees[employeeIndex].riwayat.kgb.length;
    allEmployees[employeeIndex].riwayat.kgb = allEmployees[employeeIndex].riwayat.kgb.filter(
      k => k.id !== parseInt(req.params.kgbId)
    );
    if (allEmployees[employeeIndex].riwayat.kgb.length < initialLength) {
      res.status(200).json({ message: 'Data KGB berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Data KGB tidak ditemukan' });
    }
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// ===================================================
// ==  ENDPOINT BARU UNTUK RIWAYAT KELUARGA         ==
// ===================================================

// POST: Menambahkan data keluarga baru
router.post('/:id/keluarga', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const newFamilyMember = {
      id: Date.now(),
      ...req.body,
      berkasUrl: '#'
    };
    if (!allEmployees[employeeIndex].riwayat.keluarga) {
      allEmployees[employeeIndex].riwayat.keluarga = [];
    }
    allEmployees[employeeIndex].riwayat.keluarga.push(newFamilyMember);
    res.status(201).json(newFamilyMember);
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// PUT: Memperbarui data keluarga
router.put('/:id/keluarga/:keluargaId', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const familyIndex = allEmployees[employeeIndex].riwayat.keluarga.findIndex(f => f.id === parseInt(req.params.keluargaId));
    if (familyIndex !== -1) {
      allEmployees[employeeIndex].riwayat.keluarga[familyIndex] = {
        ...allEmployees[employeeIndex].riwayat.keluarga[familyIndex],
        ...req.body
      };
      res.json(allEmployees[employeeIndex].riwayat.keluarga[familyIndex]);
    } else {
      res.status(404).json({ message: 'Data keluarga tidak ditemukan' });
    }
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// DELETE: Menghapus data keluarga
router.delete('/:id/keluarga/:keluargaId', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const initialLength = allEmployees[employeeIndex].riwayat.keluarga.length;
    allEmployees[employeeIndex].riwayat.keluarga = allEmployees[employeeIndex].riwayat.keluarga.filter(
      f => f.id !== parseInt(req.params.keluargaId)
    );
    if (allEmployees[employeeIndex].riwayat.keluarga.length < initialLength) {
      res.status(200).json({ message: 'Data keluarga berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Data keluarga tidak ditemukan' });
    }
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// ===================================================
// ==  ENDPOINT BARU UNTUK RIWAYAT CUTI             ==
// ===================================================

// POST: Menambahkan data cuti baru
router.post('/:id/cuti', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const newCuti = {
      id: Date.now(),
      ...req.body,
      berkasUrl: '#'
    };
    if (!allEmployees[employeeIndex].riwayat.cuti) {
      allEmployees[employeeIndex].riwayat.cuti = [];
    }
    allEmployees[employeeIndex].riwayat.cuti.push(newCuti);
    res.status(201).json(newCuti);
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// PUT: Memperbarui data cuti
router.put('/:id/cuti/:cutiId', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const cutiIndex = allEmployees[employeeIndex].riwayat.cuti.findIndex(c => c.id === parseInt(req.params.cutiId));
    if (cutiIndex !== -1) {
      allEmployees[employeeIndex].riwayat.cuti[cutiIndex] = {
        ...allEmployees[employeeIndex].riwayat.cuti[cutiIndex],
        ...req.body
      };
      res.json(allEmployees[employeeIndex].riwayat.cuti[cutiIndex]);
    } else {
      res.status(404).json({ message: 'Data cuti tidak ditemukan' });
    }
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// DELETE: Menghapus data cuti
router.delete('/:id/cuti/:cutiId', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const initialLength = allEmployees[employeeIndex].riwayat.cuti.length;
    allEmployees[employeeIndex].riwayat.cuti = allEmployees[employeeIndex].riwayat.cuti.filter(
      c => c.id !== parseInt(req.params.cutiId)
    );
    if (allEmployees[employeeIndex].riwayat.cuti.length < initialLength) {
      res.status(200).json({ message: 'Data cuti berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Data cuti tidak ditemukan' });
    }
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// ===================================================
// ==  ENDPOINT BARU UNTUK RIWAYAT DIKLAT           ==
// ===================================================

// POST: Menambahkan data diklat baru
router.post('/:id/diklat', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const newDiklat = {
      id: Date.now(),
      ...req.body,
      berkasUrl: '#'
    };
    if (!allEmployees[employeeIndex].riwayat.diklat) {
      allEmployees[employeeIndex].riwayat.diklat = [];
    }
    allEmployees[employeeIndex].riwayat.diklat.push(newDiklat);
    res.status(201).json(newDiklat);
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// PUT: Memperbarui data diklat
router.put('/:id/diklat/:diklatId', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const diklatIndex = allEmployees[employeeIndex].riwayat.diklat.findIndex(d => d.id === parseInt(req.params.diklatId));
    if (diklatIndex !== -1) {
      allEmployees[employeeIndex].riwayat.diklat[diklatIndex] = {
        ...allEmployees[employeeIndex].riwayat.diklat[diklatIndex],
        ...req.body
      };
      res.json(allEmployees[employeeIndex].riwayat.diklat[diklatIndex]);
    } else {
      res.status(404).json({ message: 'Data diklat tidak ditemukan' });
    }
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// DELETE: Menghapus data diklat
router.delete('/:id/diklat/:diklatId', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const initialLength = allEmployees[employeeIndex].riwayat.diklat.length;
    allEmployees[employeeIndex].riwayat.diklat = allEmployees[employeeIndex].riwayat.diklat.filter(
      d => d.id !== parseInt(req.params.diklatId)
    );
    if (allEmployees[employeeIndex].riwayat.diklat.length < initialLength) {
      res.status(200).json({ message: 'Data diklat berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Data diklat tidak ditemukan' });
    }
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});


// ===================================================
// ==  ENDPOINT BARU UNTUK RIWAYAT HUKUMAN          ==
// ===================================================

// POST: Menambahkan data hukuman baru
router.post('/:id/hukuman', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const newHukuman = {
      id: Date.now(),
      ...req.body,
      berkasUrl: '#'
    };
    if (!allEmployees[employeeIndex].riwayat.hukuman) {
      allEmployees[employeeIndex].riwayat.hukuman = [];
    }
    allEmployees[employeeIndex].riwayat.hukuman.push(newHukuman);
    res.status(201).json(newHukuman);
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// PUT: Memperbarui data hukuman
router.put('/:id/hukuman/:hukumanId', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const hukumanIndex = allEmployees[employeeIndex].riwayat.hukuman.findIndex(h => h.id === parseInt(req.params.hukumanId));
    if (hukumanIndex !== -1) {
      allEmployees[employeeIndex].riwayat.hukuman[hukumanIndex] = {
        ...allEmployees[employeeIndex].riwayat.hukuman[hukumanIndex],
        ...req.body
      };
      res.json(allEmployees[employeeIndex].riwayat.hukuman[hukumanIndex]);
    } else {
      res.status(404).json({ message: 'Data hukuman tidak ditemukan' });
    }
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// DELETE: Menghapus data hukuman
router.delete('/:id/hukuman/:hukumanId', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const initialLength = allEmployees[employeeIndex].riwayat.hukuman.length;
    allEmployees[employeeIndex].riwayat.hukuman = allEmployees[employeeIndex].riwayat.hukuman.filter(
      h => h.id !== parseInt(req.params.hukumanId)
    );
    if (allEmployees[employeeIndex].riwayat.hukuman.length < initialLength) {
      res.status(200).json({ message: 'Data hukuman berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Data hukuman tidak ditemukan' });
    }
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// ===================================================
// ==  ENDPOINT BARU UNTUK RIWAYAT JABATAN          ==
// ===================================================

// POST: Menambahkan data jabatan baru
router.post('/:id/jabatan', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const newJabatan = {
      id: Date.now(),
      ...req.body,
      berkasUrl: '#'
    };
    if (!allEmployees[employeeIndex].riwayat.jabatan) {
      allEmployees[employeeIndex].riwayat.jabatan = [];
    }
    allEmployees[employeeIndex].riwayat.jabatan.push(newJabatan);
    res.status(201).json(newJabatan);
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// PUT: Memperbarui data jabatan
router.put('/:id/jabatan/:jabatanId', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const jabatanIndex = allEmployees[employeeIndex].riwayat.jabatan.findIndex(j => j.id === parseInt(req.params.jabatanId));
    if (jabatanIndex !== -1) {
      allEmployees[employeeIndex].riwayat.jabatan[jabatanIndex] = {
        ...allEmployees[employeeIndex].riwayat.jabatan[jabatanIndex],
        ...req.body
      };
      res.json(allEmployees[employeeIndex].riwayat.jabatan[jabatanIndex]);
    } else {
      res.status(404).json({ message: 'Data jabatan tidak ditemukan' });
    }
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// DELETE: Menghapus data jabatan
router.delete('/:id/jabatan/:jabatanId', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const initialLength = allEmployees[employeeIndex].riwayat.jabatan.length;
    allEmployees[employeeIndex].riwayat.jabatan = allEmployees[employeeIndex].riwayat.jabatan.filter(
      j => j.id !== parseInt(req.params.jabatanId)
    );
    if (allEmployees[employeeIndex].riwayat.jabatan.length < initialLength) {
      res.status(200).json({ message: 'Data jabatan berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Data jabatan tidak ditemukan' });
    }
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// ===================================================
// ==  ENDPOINT BARU UNTUK RIWAYAT ORGANISASI       ==
// ===================================================

// POST: Menambahkan data organisasi baru
router.post('/:id/organisasi', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const newOrganisasi = {
      id: Date.now(),
      ...req.body,
      berkasUrl: '#'
    };
    if (!allEmployees[employeeIndex].riwayat.organisasi) {
      allEmployees[employeeIndex].riwayat.organisasi = [];
    }
    allEmployees[employeeIndex].riwayat.organisasi.push(newOrganisasi);
    res.status(201).json(newOrganisasi);
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// PUT: Memperbarui data organisasi
router.put('/:id/organisasi/:organisasiId', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const organisasiIndex = allEmployees[employeeIndex].riwayat.organisasi.findIndex(o => o.id === parseInt(req.params.organisasiId));
    if (organisasiIndex !== -1) {
      allEmployees[employeeIndex].riwayat.organisasi[organisasiIndex] = {
        ...allEmployees[employeeIndex].riwayat.organisasi[organisasiIndex],
        ...req.body
      };
      res.json(allEmployees[employeeIndex].riwayat.organisasi[organisasiIndex]);
    } else {
      res.status(404).json({ message: 'Data organisasi tidak ditemukan' });
    }
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// DELETE: Menghapus data organisasi
router.delete('/:id/organisasi/:organisasiId', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const initialLength = allEmployees[employeeIndex].riwayat.organisasi.length;
    allEmployees[employeeIndex].riwayat.organisasi = allEmployees[employeeIndex].riwayat.organisasi.filter(
      o => o.id !== parseInt(req.params.organisasiId)
    );
    if (allEmployees[employeeIndex].riwayat.organisasi.length < initialLength) {
      res.status(200).json({ message: 'Data organisasi berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Data organisasi tidak ditemukan' });
    }
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// ===================================================
// ==  ENDPOINT BARU UNTUK RIWAYAT PENDIDIKAN       ==
// ===================================================

// POST: Menambahkan data pendidikan baru
router.post('/:id/pendidikan', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const newPendidikan = {
      id: Date.now(),
      ...req.body,
      berkasUrl: '#'
    };
    if (!allEmployees[employeeIndex].riwayat.pendidikan) {
      allEmployees[employeeIndex].riwayat.pendidikan = [];
    }
    allEmployees[employeeIndex].riwayat.pendidikan.push(newPendidikan);
    res.status(201).json(newPendidikan);
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// PUT: Memperbarui data pendidikan
router.put('/:id/pendidikan/:pendidikanId', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const pendidikanIndex = allEmployees[employeeIndex].riwayat.pendidikan.findIndex(p => p.id === parseInt(req.params.pendidikanId));
    if (pendidikanIndex !== -1) {
      allEmployees[employeeIndex].riwayat.pendidikan[pendidikanIndex] = {
        ...allEmployees[employeeIndex].riwayat.pendidikan[pendidikanIndex],
        ...req.body
      };
      res.json(allEmployees[employeeIndex].riwayat.pendidikan[pendidikanIndex]);
    } else {
      res.status(404).json({ message: 'Data pendidikan tidak ditemukan' });
    }
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// DELETE: Menghapus data pendidikan
router.delete('/:id/pendidikan/:pendidikanId', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const initialLength = allEmployees[employeeIndex].riwayat.pendidikan.length;
    allEmployees[employeeIndex].riwayat.pendidikan = allEmployees[employeeIndex].riwayat.pendidikan.filter(
      p => p.id !== parseInt(req.params.pendidikanId)
    );
    if (allEmployees[employeeIndex].riwayat.pendidikan.length < initialLength) {
      res.status(200).json({ message: 'Data pendidikan berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Data pendidikan tidak ditemukan' });
    }
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// ===================================================
// ==  ENDPOINT BARU UNTUK RIWAYAT PENGHARGAAN      ==
// ===================================================

// POST: Menambahkan data penghargaan baru
router.post('/:id/penghargaan', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const newPenghargaan = {
      id: Date.now(),
      ...req.body,
      berkasUrl: '#'
    };
    if (!allEmployees[employeeIndex].riwayat.penghargaan) {
      allEmployees[employeeIndex].riwayat.penghargaan = [];
    }
    allEmployees[employeeIndex].riwayat.penghargaan.push(newPenghargaan);
    res.status(201).json(newPenghargaan);
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// PUT: Memperbarui data penghargaan
router.put('/:id/penghargaan/:penghargaanId', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const penghargaanIndex = allEmployees[employeeIndex].riwayat.penghargaan.findIndex(p => p.id === parseInt(req.params.penghargaanId));
    if (penghargaanIndex !== -1) {
      allEmployees[employeeIndex].riwayat.penghargaan[penghargaanIndex] = {
        ...allEmployees[employeeIndex].riwayat.penghargaan[penghargaanIndex],
        ...req.body
      };
      res.json(allEmployees[employeeIndex].riwayat.penghargaan[penghargaanIndex]);
    } else {
      res.status(404).json({ message: 'Data penghargaan tidak ditemukan' });
    }
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// DELETE: Menghapus data penghargaan
router.delete('/:id/penghargaan/:penghargaanId', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const initialLength = allEmployees[employeeIndex].riwayat.penghargaan.length;
    allEmployees[employeeIndex].riwayat.penghargaan = allEmployees[employeeIndex].riwayat.penghargaan.filter(
      p => p.id !== parseInt(req.params.penghargaanId)
    );
    if (allEmployees[employeeIndex].riwayat.penghargaan.length < initialLength) {
      res.status(200).json({ message: 'Data penghargaan berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Data penghargaan tidak ditemukan' });
    }
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// ===================================================
// ==  ENDPOINT BARU UNTUK RIWAYAT SKP              ==
// ===================================================

// POST: Menambahkan data SKP baru
router.post('/:id/skp', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const newSkp = {
      id: Date.now(),
      ...req.body,
      berkasUrl: '#'
    };
    if (!allEmployees[employeeIndex].riwayat.skp) {
      allEmployees[employeeIndex].riwayat.skp = [];
    }
    allEmployees[employeeIndex].riwayat.skp.push(newSkp);
    res.status(201).json(newSkp);
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// PUT: Memperbarui data SKP
router.put('/:id/skp/:skpId', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const skpIndex = allEmployees[employeeIndex].riwayat.skp.findIndex(s => s.id === parseInt(req.params.skpId));
    if (skpIndex !== -1) {
      allEmployees[employeeIndex].riwayat.skp[skpIndex] = {
        ...allEmployees[employeeIndex].riwayat.skp[skpIndex],
        ...req.body
      };
      res.json(allEmployees[employeeIndex].riwayat.skp[skpIndex]);
    } else {
      res.status(404).json({ message: 'Data SKP tidak ditemukan' });
    }
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// DELETE: Menghapus data SKP
router.delete('/:id/skp/:skpId', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const initialLength = allEmployees[employeeIndex].riwayat.skp.length;
    allEmployees[employeeIndex].riwayat.skp = allEmployees[employeeIndex].riwayat.skp.filter(
      s => s.id !== parseInt(req.params.skpId)
    );
    if (allEmployees[employeeIndex].riwayat.skp.length < initialLength) {
      res.status(200).json({ message: 'Data SKP berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Data SKP tidak ditemukan' });
    }
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// ===================================================
// ==  ENDPOINT BARU UNTUK RIWAYAT SKP PERMENPAN    ==
// ===================================================

// POST: Menambahkan data SKP Permenpan baru
router.post('/:id/skp-permenpan', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const newSkpPermenpan = {
      id: `skp-p-${Date.now()}`, // ID unik
      ...req.body,
      berkasUrl: '#'
    };
    if (!allEmployees[employeeIndex].riwayat.skpPermenpan) {
      allEmployees[employeeIndex].riwayat.skpPermenpan = [];
    }
    allEmployees[employeeIndex].riwayat.skpPermenpan.push(newSkpPermenpan);
    res.status(201).json(newSkpPermenpan);
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// PUT: Memperbarui data SKP Permenpan
router.put('/:id/skp-permenpan/:skpId', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    // Note: ID for skpPermenpan might be a string, so we don't parseInt
    const skpIndex = allEmployees[employeeIndex].riwayat.skpPermenpan.findIndex(s => s.id === req.params.skpId);
    if (skpIndex !== -1) {
      allEmployees[employeeIndex].riwayat.skpPermenpan[skpIndex] = {
        ...allEmployees[employeeIndex].riwayat.skpPermenpan[skpIndex],
        ...req.body
      };
      res.json(allEmployees[employeeIndex].riwayat.skpPermenpan[skpIndex]);
    } else {
      res.status(404).json({ message: 'Data SKP Permenpan tidak ditemukan' });
    }
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// DELETE: Menghapus data SKP Permenpan
router.delete('/:id/skp-permenpan/:skpId', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const initialLength = allEmployees[employeeIndex].riwayat.skpPermenpan.length;
    allEmployees[employeeIndex].riwayat.skpPermenpan = allEmployees[employeeIndex].riwayat.skpPermenpan.filter(
      s => s.id !== req.params.skpId
    );
    if (allEmployees[employeeIndex].riwayat.skpPermenpan.length < initialLength) {
      res.status(200).json({ message: 'Data SKP Permenpan berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Data SKP Permenpan tidak ditemukan' });
    }
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// ===================================================
// == ENDPOINT BARU UNTUK STATUS KEPEGAWAIAN        ==
// ===================================================

// POST: Menambahkan data status kepegawaian baru
router.post('/:id/status', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const newStatus = {
      id: Date.now(),
      ...req.body,
      berkasUrl: '#'
    };
    if (!allEmployees[employeeIndex].riwayat.statusKepegawaian) {
      allEmployees[employeeIndex].riwayat.statusKepegawaian = [];
    }
    allEmployees[employeeIndex].riwayat.statusKepegawaian.push(newStatus);
    res.status(201).json(newStatus);
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// PUT: Memperbarui data status kepegawaian
router.put('/:id/status/:statusId', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const statusIndex = allEmployees[employeeIndex].riwayat.statusKepegawaian.findIndex(s => s.id === parseInt(req.params.statusId));
    if (statusIndex !== -1) {
      allEmployees[employeeIndex].riwayat.statusKepegawaian[statusIndex] = {
        ...allEmployees[employeeIndex].riwayat.statusKepegawaian[statusIndex],
        ...req.body
      };
      res.json(allEmployees[employeeIndex].riwayat.statusKepegawaian[statusIndex]);
    } else {
      res.status(404).json({ message: 'Data status kepegawaian tidak ditemukan' });
    }
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

// DELETE: Menghapus data status kepegawaian
router.delete('/:id/status/:statusId', (req, res) => {
  const employeeIndex = allEmployees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex !== -1) {
    const initialLength = allEmployees[employeeIndex].riwayat.statusKepegawaian.length;
    allEmployees[employeeIndex].riwayat.statusKepegawaian = allEmployees[employeeIndex].riwayat.statusKepegawaian.filter(
      s => s.id !== parseInt(req.params.statusId)
    );
    if (allEmployees[employeeIndex].riwayat.statusKepegawaian.length < initialLength) {
      res.status(200).json({ message: 'Data status kepegawaian berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Data status kepegawaian tidak ditemukan' });
    }
  } else {
    res.status(404).json({ message: 'Pegawai tidak ditemukan' });
  }
});

export default router;
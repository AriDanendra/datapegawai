import { Router } from 'express';
import multer from 'multer';
import bcrypt from 'bcrypt';
import pool, { fetchAllRiwayat } from '../db.js';
import path from 'path'; // Diperlukan untuk storage lokal
import { fileURLToPath } from 'url'; // Diperlukan untuk storage lokal
import fs from 'fs'; // Diperlukan untuk menghapus file lokal

const router = Router();
const SALT_ROUNDS = 10;

// --- Konfigurasi Multer untuk Storage Lokal ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Konfigurasi Multer untuk menyimpan file di 'public/uploads'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Tentukan path destinasi
    const uploadDir = path.join(__dirname, '../public/uploads');
    
    // Buat direktori jika belum ada
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Ganti nama field 'berkas' atau 'profilePicture'
    const fieldname = file.fieldname || 'file'; 
    cb(null, fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Helper function untuk menghapus file lokal
const deleteLocalFile = (fileUrl) => {
    if (!fileUrl || !fileUrl.startsWith('/public/uploads/')) {
        console.log("URL tidak valid atau bukan file lokal, penghapusan dilewati.");
        return;
    }
    try {
        // Dapatkan path file absolut dari URL relatif
        const filePath = path.join(__dirname, '..', fileUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`File berhasil dihapus: ${filePath}`);
        }
    } catch (error) {
        console.error(`Gagal menghapus file lokal: ${fileUrl}`, error);
    }
};

// === ROUTES PEGAWAI (USERS) ===

// GET: Semua pegawai (Tidak berubah)
router.get('/', async (req, res) => {
    try {
        const [employees] = await pool.query("SELECT * FROM users WHERE role = 'pegawai' ORDER BY id DESC");
        employees.forEach(emp => delete emp.password);
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET: Satu pegawai by ID (Tidak berubah)
router.get('/:id', async (req, res) => {
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (users.length > 0) {
            const user = users[0];
            delete user.password;
            user.riwayat = await fetchAllRiwayat(user.id);
            res.json(user);
        } else {
            res.status(404).json({ message: 'Pegawai tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST: Tambah pegawai baru (Tidak berubah)
router.post('/', async (req, res) => {
    const { name, nip, jabatan, golongan } = req.body;
    try {
        const hashedPassword = await bcrypt.hash('password123', SALT_ROUNDS);
        const [result] = await pool.query(
            'INSERT INTO users (name, nip, jabatan, golongan, password, role) VALUES (?, ?, ?, ?, ?, ?)',
            [name, nip, jabatan, golongan, hashedPassword, 'pegawai']
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT: Update data pegawai (Tidak berubah)
router.put('/:id', async (req, res) => {
    try {
        const updateData = { ...req.body };
        delete updateData.riwayat;
        delete updateData.password;

        const [result] = await pool.query('UPDATE users SET ? WHERE id = ?', [updateData, req.params.id]);
        if (result.affectedRows > 0) {
            const [updatedUsers] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
            const user = updatedUsers[0];
            delete user.password;
            res.json(user);
        } else {
            res.status(404).json({ message: 'Pegawai tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE: Hapus pegawai
router.delete('/:id', async (req, res) => {
    try {
        const [users] = await pool.query('SELECT profilePictureUrl FROM users WHERE id = ?', [req.params.id]);
        if (users.length > 0) {
            // Hapus file foto profil lokal
            await deleteLocalFile(users[0].profilePictureUrl);
        }

        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Pegawai berhasil dihapus' });
        } else {
            res.status(404).json({ message: 'Pegawai tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST: Upload foto profil (Diubah ke lokal)
router.post('/:id/upload-profile-picture', upload.single('profilePicture'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Tidak ada file yang diunggah.' });
  }

  const employeeId = req.params.id;
  // Buat URL relatif yang bisa diakses frontend
  const fileUrl = `/public/uploads/${req.file.filename}`;

  try {
    // 1. Hapus foto lama
    const [users] = await pool.query('SELECT profilePictureUrl FROM users WHERE id = ?', [employeeId]);
    if (users.length > 0 && users[0].profilePictureUrl) {
      await deleteLocalFile(users[0].profilePictureUrl);
    }
    
    // 2. Update URL di database dengan URL lokal
    await pool.query('UPDATE users SET profilePictureUrl = ? WHERE id = ?', [fileUrl, employeeId]);
    
    // 3. Ambil data user terbaru
    const [updatedUsers] = await pool.query('SELECT * FROM users WHERE id = ?', [employeeId]);
    const user = updatedUsers[0];
    delete user.password;
    user.riwayat = await fetchAllRiwayat(user.id);

    res.json({ message: 'Foto profil berhasil diperbarui', user });

  } catch (error) {
    console.error("Local Upload Error:", error);
    res.status(500).json({ message: error.message });
  }
});


// === GENERIC ROUTES UNTUK SEMUA RIWAYAT ===
const riwayatTables = {
    jabatan: 'riwayat_jabatan',
    pendidikan: 'riwayat_pendidikan',
    kgb: 'riwayat_kgb',
    cuti: 'riwayat_cuti',
    status: 'riwayat_status_kepegawaian',
    keluarga: 'riwayat_keluarga',
    diklat: 'riwayat_diklat',
    penghargaan: 'riwayat_penghargaan',
    organisasi: 'riwayat_organisasi',
    skp: 'riwayat_skp',
    hukuman: 'riwayat_hukuman',
    sipstr: 'riwayat_sip_str',
};

Object.keys(riwayatTables).forEach(key => {
    const tableName = riwayatTables[key];

    // POST: Tambah riwayat baru (Diubah ke lokal)
    router.post(`/:id/${key}`, upload.single('berkas'), async (req, res) => {
        const data = { ...req.body, user_id: req.params.id };
        if (req.file) {
            // Buat URL relatif
            data.berkasUrl = `/public/uploads/${req.file.filename}`;
        }
        try {
            const [result] = await pool.query(`INSERT INTO ${tableName} SET ?`, data);
            res.status(201).json({ id: result.insertId, ...data });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // PUT: Update riwayat (Diubah ke lokal)
    router.put(`/:id/${key}/:itemId`, upload.single('berkas'), async (req, res) => {
        const data = { ...req.body };
        try {
            if (req.file) {
                // Hapus file lama jika ada file baru
                const [oldData] = await pool.query(`SELECT berkasUrl FROM ${tableName} WHERE id = ?`, [req.params.itemId]);
                if (oldData.length > 0 && oldData[0].berkasUrl) {
                    await deleteLocalFile(oldData[0].berkasUrl);
                }
                // Set URL file baru
                data.berkasUrl = `/public/uploads/${req.file.filename}`;
            }

            const [result] = await pool.query(`UPDATE ${tableName} SET ? WHERE id = ? AND user_id = ?`, [data, req.params.itemId, req.params.id]);
            if (result.affectedRows > 0) {
                 const [updated] = await pool.query(`SELECT * FROM ${tableName} WHERE id = ?`, [req.params.itemId]);
                 res.json(updated[0]);
            } else {
                res.status(404).json({ message: 'Data tidak ditemukan' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // DELETE: Hapus riwayat (Diubah ke lokal)
    router.delete(`/:id/${key}/:itemId`, async (req, res) => {
        try {
            // Hapus file terkait sebelum menghapus data DB
            const [oldData] = await pool.query(`SELECT berkasUrl FROM ${tableName} WHERE id = ?`, [req.params.itemId]);
            if (oldData.length > 0 && oldData[0].berkasUrl) {
                await deleteLocalFile(oldData[0].berkasUrl);
            }

            const [result] = await pool.query(`DELETE FROM ${tableName} WHERE id = ? AND user_id = ?`, [req.params.itemId, req.params.id]);
            if (result.affectedRows > 0) {
                res.status(200).json({ message: 'Data berhasil dihapus' });
            } else {
                res.status(404).json({ message: 'Data tidak ditemukan' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
});

export default router;
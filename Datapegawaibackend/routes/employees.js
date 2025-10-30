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

// Konfigurasi Multer untuk menyimpan file di 'public/assets'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Tentukan path destinasi ke public/assets
    const uploadDir = path.join(__dirname, '../public/assets'); // <-- Diubah ke assets

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
    // Format nama file: fieldname-timestamp-random.extension
    cb(null, fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Helper function untuk menghapus file lokal
const deleteLocalFile = (fileUrl) => {
    // Cek apakah URL dimulai dengan /public/assets/
    if (!fileUrl || !fileUrl.startsWith('/public/assets/')) { // <-- Diubah ke assets
        console.log("URL tidak valid atau bukan file lokal (/public/assets/), penghapusan dilewati:", fileUrl);
        return;
    }
    try {
        // Dapatkan path file absolut dari URL relatif
        const filePath = path.join(__dirname, '..', fileUrl); // Path relatif dari __dirname backend
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`File lokal berhasil dihapus: ${filePath}`);
        } else {
             console.log(`File lokal tidak ditemukan untuk dihapus: ${filePath}`);
        }
    } catch (error) {
        console.error(`Gagal menghapus file lokal: ${fileUrl}`, error);
    }
};


// === ROUTES PEGAWAI (USERS) ===

// GET: Semua pegawai
router.get('/', async (req, res) => {
    try {
        const [employees] = await pool.query("SELECT * FROM users WHERE role = 'pegawai' ORDER BY id DESC");
        employees.forEach(emp => delete emp.password);
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data pegawai: " + error.message });
    }
});

// GET: Satu pegawai by ID
router.get('/:id', async (req, res) => {
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (users.length > 0) {
            const user = users[0];
            delete user.password;
            user.riwayat = await fetchAllRiwayat(user.id); // Ambil semua riwayat terkait
            res.json(user);
        } else {
            res.status(404).json({ message: 'Pegawai tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data pegawai: " + error.message });
    }
});

// POST: Tambah pegawai baru
router.post('/', async (req, res) => {
    const { name, nip, jabatan, golongan } = req.body;
    if (!name || !nip || !jabatan || !golongan) {
        return res.status(400).json({ message: 'Nama, NIP, Jabatan, dan Golongan wajib diisi.' });
    }
    try {
        // Hash password default 'password123'
        const hashedPassword = await bcrypt.hash('password123', SALT_ROUNDS);
        const defaultProfilePic = '/public/assets/profile-pic.jpg'; // Path default jika ada di assets

        const [result] = await pool.query(
            'INSERT INTO users (name, nip, jabatan, golongan, password, role, profilePictureUrl) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, nip, jabatan, golongan, hashedPassword, 'pegawai', defaultProfilePic]
        );
        // Ambil data user yang baru dibuat untuk response
        const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
        delete newUser[0].password; // Hapus password dari response
        res.status(201).json(newUser[0]);
    } catch (error) {
        res.status(500).json({ message: "Gagal menambahkan pegawai baru: " + error.message });
    }
});

// PUT: Update data pegawai
router.put('/:id', async (req, res) => {
    try {
        const employeeId = req.params.id;
        const updateData = { ...req.body };
        // Hapus field yang tidak seharusnya diupdate langsung di tabel users
        delete updateData.riwayat;
        delete updateData.password; // Password diupdate via endpoint lain
        delete updateData.profilePictureUrl; // Foto diupdate via endpoint lain
        delete updateData.id; // Jangan update ID

        const [result] = await pool.query('UPDATE users SET ? WHERE id = ?', [updateData, employeeId]);

        if (result.affectedRows > 0) {
            // Ambil data user yang sudah diupdate
            const [updatedUsers] = await pool.query('SELECT * FROM users WHERE id = ?', [employeeId]);
            const user = updatedUsers[0];
            delete user.password;
            user.riwayat = await fetchAllRiwayat(user.id); // Sertakan riwayat terbaru
            res.json(user);
        } else {
            res.status(404).json({ message: 'Pegawai tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ message: "Gagal memperbarui data pegawai: " + error.message });
    }
});

// DELETE: Hapus pegawai
router.delete('/:id', async (req, res) => {
    try {
        const employeeId = req.params.id;
        // 1. Ambil URL foto profil sebelum menghapus user
        const [users] = await pool.query('SELECT profilePictureUrl FROM users WHERE id = ?', [employeeId]);
        let profilePicUrlToDelete = null;
        if (users.length > 0) {
             profilePicUrlToDelete = users[0].profilePictureUrl;
        }

        // 2. Hapus user dari database (akan menghapus riwayat via CASCADE)
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [employeeId]);

        if (result.affectedRows > 0) {
            // 3. Jika user berhasil dihapus, hapus file foto profilnya
            if (profilePicUrlToDelete) {
                deleteLocalFile(profilePicUrlToDelete);
            }
             // TODO: Hapus juga file-file riwayat terkait jika diperlukan (lebih kompleks)
            res.status(200).json({ message: 'Pegawai berhasil dihapus' });
        } else {
            res.status(404).json({ message: 'Pegawai tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ message: "Gagal menghapus pegawai: " + error.message });
    }
});

// POST: Upload foto profil (ke lokal /public/assets)
router.post('/:id/upload-profile-picture', upload.single('profilePicture'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Tidak ada file yang diunggah.' });
  }

  const employeeId = req.params.id;
  // Buat URL relatif yang bisa diakses frontend (menggunakan /public/assets/)
  const fileUrl = `/public/assets/${req.file.filename}`; // <-- Diubah ke assets

  try {
    // 1. Ambil URL foto lama untuk dihapus
    const [users] = await pool.query('SELECT profilePictureUrl FROM users WHERE id = ?', [employeeId]);
    if (users.length > 0 && users[0].profilePictureUrl) {
       deleteLocalFile(users[0].profilePictureUrl); // <-- Menggunakan helper
    }

    // 2. Update URL di database dengan URL lokal baru
    await pool.query('UPDATE users SET profilePictureUrl = ? WHERE id = ?', [fileUrl, employeeId]);

    // 3. Ambil data user terbaru
    const [updatedUsers] = await pool.query('SELECT * FROM users WHERE id = ?', [employeeId]);
    if (updatedUsers.length === 0) {
        // Jika user tidak ditemukan setelah update (seharusnya tidak terjadi)
        deleteLocalFile(fileUrl); // Hapus file yang baru diupload
        return res.status(404).json({ message: 'Pegawai tidak ditemukan setelah update foto.' });
    }
    const user = updatedUsers[0];
    delete user.password;
    user.riwayat = await fetchAllRiwayat(user.id); // Ambil riwayat jika perlu

    res.json({ message: 'Foto profil berhasil diperbarui', user });

  } catch (error) {
    console.error("Local Upload Error:", error);
    // Jika error, hapus file yang baru saja diupload
    deleteLocalFile(fileUrl);
    res.status(500).json({ message: "Gagal memperbarui foto profil: " + error.message });
  }
});


// === GENERIC ROUTES UNTUK SEMUA RIWAYAT ===
const riwayatTables = {
    jabatan: 'riwayat_jabatan',
    pendidikan: 'riwayat_pendidikan',
    kgb: 'riwayat_kgb',
    cuti: 'riwayat_cuti',
    status: 'riwayat_status_kepegawaian', // 'status' adalah key di frontend
    keluarga: 'riwayat_keluarga',
    diklat: 'riwayat_diklat',
    penghargaan: 'riwayat_penghargaan',
    organisasi: 'riwayat_organisasi',
    skp: 'riwayat_skp',
    hukuman: 'riwayat_hukuman',
    sipstr: 'riwayat_sip_str',
    // Tambahkan 'skp-permenpan' jika ada tabelnya, sesuaikan nama tabel
    'skp-permenpan': 'riwayat_skp_permenpan', // Contoh, pastikan nama tabel benar
};

Object.keys(riwayatTables).forEach(key => {
    const tableName = riwayatTables[key];
    // Periksa apakah nama tabel valid (misalnya, jika 'skp-permenpan' belum dibuat tabelnya)
    if (!tableName) {
        console.warn(`Tabel untuk kunci riwayat '${key}' tidak ditemukan/didefinisikan.`);
        return; // Lewati pembuatan route untuk key ini
    }

    // --- POST: Tambah riwayat baru (ke lokal /public/assets) ---
    router.post(`/:id/${key}`, upload.single('berkas'), async (req, res) => {
        const employeeId = req.params.id;
        const data = { ...req.body, user_id: employeeId };
        let uploadedFileUrl = null;

        if (req.file) {
            // Buat URL relatif ke /public/assets/
            uploadedFileUrl = `/public/assets/${req.file.filename}`; // <-- Diubah ke assets
            data.berkasUrl = uploadedFileUrl;
        } else {
            data.berkasUrl = null; // Atau biarkan default database jika ada
        }

        try {
            // Pastikan user_id ada sebelum insert
             const [userCheck] = await pool.query('SELECT id FROM users WHERE id = ?', [employeeId]);
             if (userCheck.length === 0) {
                 if (uploadedFileUrl) deleteLocalFile(uploadedFileUrl); // Hapus file jika user tidak ada
                 return res.status(404).json({ message: 'Pegawai tidak ditemukan.' });
             }

            const [result] = await pool.query(`INSERT INTO ${tableName} SET ?`, data);
            // Ambil data yang baru saja dimasukkan untuk response
            const [insertedData] = await pool.query(`SELECT * FROM ${tableName} WHERE id = ?`, [result.insertId]);
            res.status(201).json(insertedData[0]);
        } catch (error) {
            // Jika error saat insert dan ada file terupload, hapus file tersebut
            if (uploadedFileUrl) {
                deleteLocalFile(uploadedFileUrl);
            }
            console.error(`Error POST /${key}:`, error);
            res.status(500).json({ message: `Gagal menambahkan data ${key}: ${error.message}` });
        }
    });

    // --- PUT: Update riwayat (ke lokal /public/assets) ---
    router.put(`/:id/${key}/:itemId`, upload.single('berkas'), async (req, res) => {
        const employeeId = req.params.id;
        const itemId = req.params.itemId;
        const data = { ...req.body };
        let oldFileUrl = null;
        let newFileUrl = null;

        try {
            // 1. Ambil URL file lama sebelum update
            const [oldDataResult] = await pool.query(`SELECT berkasUrl FROM ${tableName} WHERE id = ? AND user_id = ?`, [itemId, employeeId]);
            if (oldDataResult.length === 0) {
                 // Jika data tidak ditemukan, hapus file baru jika ada
                 if (req.file) deleteLocalFile(`/public/assets/${req.file.filename}`);
                 return res.status(404).json({ message: 'Data tidak ditemukan' });
            }
            oldFileUrl = oldDataResult[0].berkasUrl;

            // 2. Jika ada file baru diupload
            if (req.file) {
                newFileUrl = `/public/assets/${req.file.filename}`; // <-- Diubah ke assets
                data.berkasUrl = newFileUrl;
            } else {
                 // Jika tidak ada file baru diupload, jangan ubah kolom berkasUrl
                 delete data.berkasUrl;
            }

            // 3. Lakukan update ke database
            const [result] = await pool.query(`UPDATE ${tableName} SET ? WHERE id = ? AND user_id = ?`, [data, itemId, employeeId]);

            if (result.affectedRows > 0) {
                 // 4. Hapus file lama JIKA ada file baru yang diupload DAN file lama ada
                 if (newFileUrl && oldFileUrl) {
                     deleteLocalFile(oldFileUrl);
                 }
                 // 5. Ambil data terbaru setelah update
                 const [updated] = await pool.query(`SELECT * FROM ${tableName} WHERE id = ?`, [itemId]);
                 res.json(updated[0]);
            } else {
                 // Jika update gagal (0 rows affected) dan ada file baru terupload, hapus file baru
                 if (newFileUrl) {
                     deleteLocalFile(newFileUrl);
                 }
                // Seharusnya sudah ditangani oleh cek di awal, tapi sebagai fallback
                res.status(404).json({ message: 'Data tidak ditemukan atau tidak ada perubahan' });
            }
        } catch (error) {
             // Jika error saat proses update dan ada file baru terupload, hapus file baru
             if (newFileUrl) {
                 deleteLocalFile(newFileUrl);
             }
             console.error(`Error PUT /${key}/${itemId}:`, error);
            res.status(500).json({ message: `Gagal memperbarui data ${key}: ${error.message}` });
        }
    });

    // --- DELETE: Hapus riwayat (dari lokal /public/assets) ---
    router.delete(`/:id/${key}/:itemId`, async (req, res) => {
        const employeeId = req.params.id;
        const itemId = req.params.itemId;
        let fileUrlToDelete = null;

        try {
            // 1. Ambil URL file terkait sebelum menghapus data DB
            const [oldDataResult] = await pool.query(`SELECT berkasUrl FROM ${tableName} WHERE id = ? AND user_id = ?`, [itemId, employeeId]);
             if (oldDataResult.length > 0) {
                 fileUrlToDelete = oldDataResult[0].berkasUrl;
             } else {
                  return res.status(404).json({ message: 'Data tidak ditemukan' });
             }

            // 2. Hapus data dari database
            const [result] = await pool.query(`DELETE FROM ${tableName} WHERE id = ? AND user_id = ?`, [itemId, employeeId]);

            if (result.affectedRows > 0) {
                 // 3. Hapus file lokal SETELAH data DB berhasil dihapus
                 if (fileUrlToDelete) {
                     deleteLocalFile(fileUrlToDelete);
                 }
                res.status(200).json({ message: 'Data berhasil dihapus' });
            } else {
                // Seharusnya sudah ditangani oleh cek di awal
                res.status(404).json({ message: 'Data tidak ditemukan saat mencoba menghapus' });
            }
        } catch (error) {
            console.error(`Error DELETE /${key}/${itemId}:`, error);
            res.status(500).json({ message: `Gagal menghapus data ${key}: ${error.message}` });
        }
    });
});

export default router;
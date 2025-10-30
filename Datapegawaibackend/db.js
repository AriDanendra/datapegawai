// Datapegawaibackend/db.js

import mysql from 'mysql2/promise';
import dotenv from 'dotenv'; // Tambahkan impor dotenv

dotenv.config();

// Buat koneksi pool ke database lokal
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Fungsi untuk mengambil semua riwayat data untuk seorang pegawai (tidak ada perubahan)
export const fetchAllRiwayat = async (userId) => {
    const riwayat = {};
    const tables = {
        jabatan: 'riwayat_jabatan',
        pendidikan: 'riwayat_pendidikan',
        kgb: 'riwayat_kgb',
        cuti: 'riwayat_cuti',
        statusKepegawaian: 'riwayat_status_kepegawaian',
        keluarga: 'riwayat_keluarga',
        diklat: 'riwayat_diklat',
        penghargaan: 'riwayat_penghargaan',
        organisasi: 'riwayat_organisasi',
        skp: 'riwayat_skp',
        hukuman: 'riwayat_hukuman',
        sipstr: 'riwayat_sip_str',
    };

    try {
        for (const key in tables) {
            const [rows] = await pool.query(`SELECT * FROM ${tables[key]} WHERE user_id = ? ORDER BY id DESC`, [userId]);
            riwayat[key] = rows;
        }
    } catch (error) {
        console.error("Gagal mengambil riwayat:", error.message);
    }
    return riwayat;
};

export default pool;
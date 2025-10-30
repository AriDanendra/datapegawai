--
-- Database: `db_kepegawaian`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `nip` varchar(255) DEFAULT NULL,
  `jabatan` varchar(255) DEFAULT NULL,
  `golongan` varchar(255) DEFAULT NULL,
  `profilePictureUrl` varchar(255) DEFAULT '/assets/profile-pic.jpg',
  `password` varchar(255) NOT NULL,
  `role` enum('pegawai','admin') NOT NULL DEFAULT 'pegawai',
  `ttl` varchar(255) DEFAULT NULL,
  `agama` varchar(255) DEFAULT NULL,
  `suku` varchar(255) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `pendidikan` varchar(255) DEFAULT NULL,
  `instansi` varchar(255) DEFAULT NULL,
  `nomorHp` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `noKtp` varchar(255) DEFAULT NULL,
  `noNpwp` varchar(255) DEFAULT NULL,
  `noKarpeg` varchar(255) DEFAULT NULL,
  `noKaris` varchar(255) DEFAULT NULL,
  `noAskes` varchar(255) DEFAULT NULL,
  `noTaspen` varchar(255) DEFAULT NULL,
  `noRekening` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `name`, `nip`, `jabatan`, `golongan`, `profilePictureUrl`, `password`, `role`, `ttl`, `agama`, `suku`, `alamat`, `pendidikan`, `instansi`, `nomorHp`, `email`, `noKtp`, `noNpwp`, `noKarpeg`, `noKaris`, `noAskes`, `noTaspen`, `noRekening`) VALUES
(1, 'Administrator', 'admin', NULL, NULL, '/assets/profile-pic.jpg', '$2b$10$f6.L.Lw.3.3j.j/A.j.j.j.j.j.j.j.j.j.j.j.j.j.j.j.j.j.j.j.j', 'admin', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'hj tunru, S.T.', '198804011990032010', 'Kepala Bagian Ketatausahaan, Humas dan Hukum', 'PEMBINA (IVa)', '/assets/profile-pic.jpg', '$2b$10$f6.L.Lw.3.3j.j/A.j.j.j.j.j.j.j.j.j.j.j.j.j.j.j.j.j.j.j.j', 'pegawai', 'Parepare, 01-04-1988', 'ISLAM', '-', 'Jl. Mattiro Jompi No. 5, Parepare', 'S.2 - MANAJEMEN PEMBANGUNAN DAERAH', 'UPT RUMAH SAKIT DR. HASRI AINUN HABIBIE', '08114225580', 'edwinzhoker@gmail.com', '7372010104880001', '12.345.678.9-012.000', 'J 123456', 'K 789012', '0001234567890', '9876543210', '123-456-7890 (Bank Sulselbar)');

-- --------------------------------------------------------

--
-- Struktur dari tabel `riwayat_cuti`
--

CREATE TABLE `riwayat_cuti` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `jenisCuti` varchar(255) DEFAULT NULL,
  `nomorSurat` varchar(255) DEFAULT NULL,
  `tanggalSurat` varchar(255) DEFAULT NULL,
  `tanggalAwal` varchar(255) DEFAULT NULL,
  `tanggalSelesai` varchar(255) DEFAULT NULL,
  `berkasUrl` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `riwayat_cuti_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Riwayat Jabatan
CREATE TABLE `riwayat_jabatan` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `namaJabatan` VARCHAR(255),
  `noSk` VARCHAR(255),
  `tglSk` VARCHAR(255),
  `tmtJabatan` VARCHAR(255),
  `berkasUrl` VARCHAR(255),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Riwayat Pendidikan
CREATE TABLE `riwayat_pendidikan` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `namaSekolah` VARCHAR(255),
  `jurusan` VARCHAR(255),
  `lokasi` VARCHAR(255),
  `noIjazah` VARCHAR(255),
  `lulus` VARCHAR(255),
  `berkasUrl` VARCHAR(255),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `riwayat_kgb` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `noSk` VARCHAR(255),
    `tglSk` VARCHAR(255),
    `tmtKgb` VARCHAR(255),
    `gajiPokok` VARCHAR(255),
    `masaKerja` VARCHAR(255),
    `berkasUrl` VARCHAR(255),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `riwayat_status_kepegawaian` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `status` VARCHAR(255),
    `noSk` VARCHAR(255),
    `tglSk` VARCHAR(255),
    `tmtJabatan` VARCHAR(255),
    `gol` VARCHAR(255),
    `pangkat` VARCHAR(255),
    `berkasUrl` VARCHAR(255),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `riwayat_keluarga` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `kategori` VARCHAR(255),
    `nama` VARCHAR(255),
    `ttl` VARCHAR(255),
    `tglKawin` VARCHAR(255),
    `status` VARCHAR(255),
    `alamat` VARCHAR(255),
    `pendidikan` VARCHAR(255),
    `berkasUrl` VARCHAR(255),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `riwayat_diklat` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `namaDiklat` VARCHAR(255),
    `tempat` VARCHAR(255),
    `pelaksana` VARCHAR(255),
    `angkatan` VARCHAR(255),
    `tanggal` VARCHAR(255),
    `berkasUrl` VARCHAR(255),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `riwayat_penghargaan` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `nama` VARCHAR(255),
    `oleh` VARCHAR(255),
    `noSk` VARCHAR(255),
    `tglSk` VARCHAR(255),
    `tahun` VARCHAR(255),
    `berkasUrl` VARCHAR(255),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `riwayat_organisasi` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `nama` VARCHAR(255),
    `jenis` VARCHAR(255),
    `jabatan` VARCHAR(255),
    `tempat` VARCHAR(255),
    `berkasUrl` VARCHAR(255),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `riwayat_skp` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `tahun` VARCHAR(255),
    `nilaiSKP` VARCHAR(255),
    `nilaiPerilaku` VARCHAR(255),
    `nilaiPrestasi` VARCHAR(255),
    `berkasUrl` VARCHAR(255),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `riwayat_hukuman` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `nama` VARCHAR(255),
    `noSk` VARCHAR(255),
    `tglSk` VARCHAR(255),
    `tmt` VARCHAR(255),
    `berkasUrl` VARCHAR(255),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ditambahkan: Tabel Riwayat SIP & STR
CREATE TABLE `riwayat_sip_str` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `jenis` ENUM('SIP', 'STR') NOT NULL,
    `nomor` VARCHAR(255),
    `tglTerbit` VARCHAR(255),
    `tglBerlaku` VARCHAR(255),
    `berkasUrl` VARCHAR(255),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
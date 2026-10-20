-- ============================================================
--  DATABASE: parkir_app
--  Tabel: users (untuk login sistem)
--  Jalankan di phpMyAdmin → database parkir_app
-- ============================================================

USE `parkir_app`;

-- Buat tabel users jika belum ada
CREATE TABLE IF NOT EXISTS `users` (
    `id`         INT          NOT NULL AUTO_INCREMENT,
    `nama`       VARCHAR(100) NOT NULL DEFAULT '',
    `username`   VARCHAR(50)  NOT NULL UNIQUE,
    `password`   VARCHAR(255) NOT NULL,
    `role`       ENUM('admin','operator','petugas') NOT NULL DEFAULT 'petugas',
    `status`     ENUM('aktif','nonaktif') NOT NULL DEFAULT 'aktif',
    `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tambah kolom jika tabel sudah ada tapi belum punya kolom baru
-- (aman dijalankan berkali-kali)
ALTER TABLE `users`
    ADD COLUMN IF NOT EXISTS `nama`   VARCHAR(100) NOT NULL DEFAULT '' AFTER `id`,
    ADD COLUMN IF NOT EXISTS `role`   ENUM('admin','operator','petugas') NOT NULL DEFAULT 'petugas' AFTER `password`,
    ADD COLUMN IF NOT EXISTS `status` ENUM('aktif','nonaktif') NOT NULL DEFAULT 'aktif' AFTER `role`;

-- ============================================================
--  SEED: akun default
--  Semua password = admin123
--  Hash dibuat dengan: password_hash('admin123', PASSWORD_DEFAULT)
-- ============================================================
INSERT INTO `users` (`nama`, `username`, `password`, `role`, `status`) VALUES
('Administrator',  'admin',    '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UqVC', 'admin',    'aktif'),
('Operator Satu',  'operator', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UqVC', 'operator', 'aktif'),
('Petugas Parkir', 'petugas',  '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UqVC', 'petugas',  'aktif')
ON DUPLICATE KEY UPDATE
    `nama`     = VALUES(`nama`),
    `password` = VALUES(`password`),
    `role`     = VALUES(`role`),
    `status`   = VALUES(`status`);

-- ============================================================
--  Cek hasil
-- ============================================================
SELECT id, nama, username, role, status, created_at FROM `users`;

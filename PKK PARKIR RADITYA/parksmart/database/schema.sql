-- ParkSmart Database Schema
-- Run this file to set up the database

CREATE DATABASE IF NOT EXISTS parksmart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE parksmart;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'operator', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  plate_number VARCHAR(20) UNIQUE NOT NULL,
  vehicle_type ENUM('motor', 'mobil', 'truk') NOT NULL,
  brand VARCHAR(50),
  color VARCHAR(30),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Parking slots table
CREATE TABLE IF NOT EXISTS parking_slots (
  id INT PRIMARY KEY AUTO_INCREMENT,
  slot_code VARCHAR(10) UNIQUE NOT NULL,
  slot_type ENUM('motor', 'mobil', 'truk') NOT NULL,
  floor VARCHAR(10) NOT NULL,
  status ENUM('available', 'occupied', 'reserved', 'maintenance') DEFAULT 'available'
);

-- Parking transactions table
CREATE TABLE IF NOT EXISTS parking_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id INT,
  slot_id INT,
  user_id INT,
  check_in DATETIME NOT NULL,
  check_out DATETIME,
  duration_minutes INT,
  fee DECIMAL(10,2),
  payment_status ENUM('unpaid', 'paid', 'cancelled') DEFAULT 'unpaid',
  payment_method ENUM('cash', 'qris', 'transfer'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
  FOREIGN KEY (slot_id) REFERENCES parking_slots(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tariffs table
CREATE TABLE IF NOT EXISTS tariffs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vehicle_type ENUM('motor', 'mobil', 'truk') UNIQUE NOT NULL,
  first_hour_rate DECIMAL(10,2) NOT NULL,
  next_hour_rate DECIMAL(10,2) NOT NULL,
  daily_max DECIMAL(10,2) NOT NULL
);

-- =============================================
-- SEED DATA
-- =============================================

-- Default admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin ParkSmart', 'admin@parksmart.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Operator Satu', 'operator@parksmart.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'operator'),
('User Demo', 'user@parksmart.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user')
ON DUPLICATE KEY UPDATE id=id;

-- Default tariffs
INSERT INTO tariffs (vehicle_type, first_hour_rate, next_hour_rate, daily_max) VALUES
('motor', 3000, 2000, 15000),
('mobil', 5000, 3000, 30000),
('truk', 10000, 7000, 60000)
ON DUPLICATE KEY UPDATE id=id;

-- Parking slots - Floor A (Motor)
INSERT INTO parking_slots (slot_code, slot_type, floor, status) VALUES
('A-01', 'motor', 'A', 'available'), ('A-02', 'motor', 'A', 'available'),
('A-03', 'motor', 'A', 'available'), ('A-04', 'motor', 'A', 'available'),
('A-05', 'motor', 'A', 'available'), ('A-06', 'motor', 'A', 'available'),
('A-07', 'motor', 'A', 'available'), ('A-08', 'motor', 'A', 'available'),
('A-09', 'motor', 'A', 'available'), ('A-10', 'motor', 'A', 'available'),
('A-11', 'motor', 'A', 'available'), ('A-12', 'motor', 'A', 'available'),
-- Floor B (Mobil)
('B-01', 'mobil', 'B', 'available'), ('B-02', 'mobil', 'B', 'available'),
('B-03', 'mobil', 'B', 'available'), ('B-04', 'mobil', 'B', 'available'),
('B-05', 'mobil', 'B', 'available'), ('B-06', 'mobil', 'B', 'available'),
('B-07', 'mobil', 'B', 'available'), ('B-08', 'mobil', 'B', 'available'),
-- Floor C (Truk)
('C-01', 'truk', 'C', 'available'), ('C-02', 'truk', 'C', 'available'),
('C-03', 'truk', 'C', 'available'), ('C-04', 'truk', 'C', 'available')
ON DUPLICATE KEY UPDATE id=id;

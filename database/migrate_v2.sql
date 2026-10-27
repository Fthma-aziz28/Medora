-- ============================================================
-- MEDORA COMPREHENSIVE PRODUCTION DATABASE MIGRATION (V2)
-- Safe, idempotent script for live medora_db.
-- Compatible with MySQL 8.0+ / MariaDB
-- ============================================================

USE medora_db;

-- 1. Ensure appointments has necessary tracking columns
ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS is_emergency_replacement TINYINT(1) NOT NULL DEFAULT 0;

ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS patient_user_id BIGINT NULL;

-- 2. Ensure patients table exists for hospital identity mapping
CREATE TABLE IF NOT EXISTS patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    hospital_patient_ref VARCHAR(50),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Patient Documents & Diagnostic Reports Table
-- Supports real file storage, mime types, and patient isolation
CREATE TABLE IF NOT EXISTS patient_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_email VARCHAR(255) NOT NULL,
    patient_user_id BIGINT NULL,
    document_type VARCHAR(50) NOT NULL, -- 'TEST_RESULT', 'PRESCRIPTION', 'BILL', 'CLINICAL_NOTE'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url VARCHAR(500),
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    file_size BIGINT DEFAULT 0,
    content_type VARCHAR(100),
    uploaded_by_user_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_doc_patient_email (patient_email),
    INDEX idx_doc_patient_user (patient_user_id)
);

ALTER TABLE patient_documents
    ADD COLUMN IF NOT EXISTS patient_user_id BIGINT NULL,
    ADD COLUMN IF NOT EXISTS file_path VARCHAR(500) NULL,
    ADD COLUMN IF NOT EXISTS file_name VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS file_size BIGINT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS content_type VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS uploaded_by_user_id BIGINT NULL;

-- 4. Bulk Doctor Ingestion History Table
CREATE TABLE IF NOT EXISTS import_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    imported_by VARCHAR(255) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_records INT DEFAULT 0,
    imported INT DEFAULT 0,
    updated INT DEFAULT 0,
    skipped INT DEFAULT 0,
    failed INT DEFAULT 0,
    status VARCHAR(50) NOT NULL
);

-- 5. Emergency Allocations Ledger Table
CREATE TABLE IF NOT EXISTS emergency_allocations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    leave_request_id BIGINT NOT NULL,
    original_doctor_id BIGINT NOT NULL,
    replacement_doctor_id BIGINT NOT NULL,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    fairness_score INT NOT NULL,
    reason VARCHAR(500),
    override_flag TINYINT(1) DEFAULT 0,
    admin_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ea_leave (leave_request_id),
    INDEX idx_ea_replacement (replacement_doctor_id)
);

-- 6. Seed Baseline Data if not already present
-- Password for all seed accounts is: password
-- BCrypt: $2a$10$D/x3.h8ZpG9E6.Q.yW8x.O2H88jI5gQk.37J/K1O005b8i.2J2H5a
INSERT IGNORE INTO users (name, email, password_hash, role, status) VALUES
    ('Admin User',       'admin@medora.com', '$2a$10$D/x3.h8ZpG9E6.Q.yW8x.O2H88jI5gQk.37J/K1O005b8i.2J2H5a', 'ADMIN',   'ACTIVE'),
    ('Dr. Aisha Rahman', 'aisha@medora.com', '$2a$10$D/x3.h8ZpG9E6.Q.yW8x.O2H88jI5gQk.37J/K1O005b8i.2J2H5a', 'DOCTOR',  'ACTIVE'),
    ('Emily Chen',       'emily@medora.com', '$2a$10$D/x3.h8ZpG9E6.Q.yW8x.O2H88jI5gQk.37J/K1O005b8i.2J2H5a', 'PATIENT', 'ACTIVE');

INSERT IGNORE INTO departments (name) VALUES
    ('Cardiology'), ('Neurology'), ('Orthopedics'),
    ('Pediatrics'), ('Dermatology'), ('ENT'),
    ('General Medicine'), ('Gynecology'), ('Emergency');

-- Link Emily Chen user as a patient record
INSERT IGNORE INTO patients (user_id, hospital_patient_ref)
    SELECT id, 'PAT-2026-001' FROM users WHERE email = 'emily@medora.com';

-- Ensure Dr. Aisha Rahman is in doctors table
INSERT IGNORE INTO doctors (user_id, department_id, specialty, working_days, start_time, end_time, slot_mins)
    SELECT u.id, d.id, 'Cardiology', 'Mon,Wed,Fri', '09:00:00', '13:00:00', 20
    FROM users u
    JOIN departments d ON d.name = 'Cardiology'
    WHERE u.email = 'aisha@medora.com'
    AND NOT EXISTS (SELECT 1 FROM doctors WHERE user_id = u.id);

-- Update existing appointments to link to Emily Chen if patient_name matches
UPDATE appointments 
SET patient_user_id = (SELECT id FROM users WHERE email = 'emily@medora.com')
WHERE patient_name LIKE '%Emily Chen%' AND (patient_user_id IS NULL OR patient_user_id = 0);

SELECT 'Migration V2 complete.' AS status;

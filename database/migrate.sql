-- ============================================================
-- MEDORA SAFE DATABASE MIGRATION
-- Run this ONCE on your live medora_db.
-- All statements are safe to run even if partially applied.
-- ============================================================

USE medora_db;

-- 1. Add is_emergency_replacement to appointments
--    (Referenced in AppointmentDao.java but missing from original schema)
ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS is_emergency_replacement TINYINT(1) NOT NULL DEFAULT 0;

-- 2. Add patient_user_id to appointments
--    (Links patient accounts to their appointments for the patient portal)
ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS patient_user_id BIGINT NULL,
    ADD CONSTRAINT fk_appt_patient_user
        FOREIGN KEY IF NOT EXISTS (patient_user_id) REFERENCES users(id)
        ON DELETE SET NULL;

-- 3. Create patients table (hospital patient metadata)
CREATE TABLE IF NOT EXISTS patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    hospital_patient_ref VARCHAR(50),    -- optional hospital-issued ID
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Seed admin + demo doctor users if not already present
--    Password for all demo accounts is: password
--    BCrypt hash: $2a$10$D/x3.h8ZpG9E6.Q.yW8x.O2H88jI5gQk.37J/K1O005b8i.2J2H5a
INSERT IGNORE INTO users (name, email, password_hash, role, status) VALUES
    ('Admin User',       'admin@medora.com', '$2a$10$D/x3.h8ZpG9E6.Q.yW8x.O2H88jI5gQk.37J/K1O005b8i.2J2H5a', 'ADMIN',   'ACTIVE'),
    ('Dr. Aisha Rahman', 'aisha@medora.com', '$2a$10$D/x3.h8ZpG9E6.Q.yW8x.O2H88jI5gQk.37J/K1O005b8i.2J2H5a', 'DOCTOR',  'ACTIVE'),
    ('Emily Chen',       'emily@medora.com', '$2a$10$D/x3.h8ZpG9E6.Q.yW8x.O2H88jI5gQk.37J/K1O005b8i.2J2H5a', 'PATIENT', 'ACTIVE');

-- 5. Seed departments if not already present
INSERT IGNORE INTO departments (name) VALUES
    ('Cardiology'), ('Neurology'), ('Orthopedics'),
    ('Pediatrics'), ('Dermatology'), ('ENT'),
    ('General Medicine'), ('Gynecology');

-- 6. Link Emily Chen user as a patient record
INSERT IGNORE INTO patients (user_id)
    SELECT id FROM users WHERE email = 'emily@medora.com';

-- Done.
SELECT 'Migration complete.' AS status;

USE medora_db;

-- Note: All passwords are 'password' hashed with BCrypt
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin User', 'admin@medora.com', '$2a$10$D/x3.h8ZpG9E6.Q.yW8x.O2H88jI5gQk.37J/K1O005b8i.2J2H5a', 'ADMIN'),
('Dr. Aisha Rahman', 'aisha@medora.com', '$2a$10$D/x3.h8ZpG9E6.Q.yW8x.O2H88jI5gQk.37J/K1O005b8i.2J2H5a', 'DOCTOR');

INSERT INTO departments (name) VALUES ('Cardiology'), ('Neurology');

INSERT INTO doctors (user_id, department_id, working_days, start_time, end_time, slot_mins) VALUES 
(2, 1, '1,3,5', '09:00:00', '13:00:00', 20);

INSERT INTO appointments (doctor_id, patient_name, appointment_date, start_time, end_time, status) VALUES 
(1, 'Emily Chen', '2026-10-04', '09:00:00', '09:20:00', 'Confirmed');

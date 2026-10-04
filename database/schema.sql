CREATE DATABASE IF NOT EXISTS medora_db;
USE medora_db;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE doctors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    department_id BIGINT,
    specialty VARCHAR(255),
    working_days VARCHAR(50),
    start_time TIME,
    end_time TIME,
    slot_mins INT DEFAULT 20,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(50) NOT NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

CREATE TABLE leave_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

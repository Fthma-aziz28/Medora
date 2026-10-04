INSERT INTO department (id, name) VALUES (1, 'Cardiology');
INSERT INTO department (id, name) VALUES (2, 'Neurology');
INSERT INTO department (id, name) VALUES (3, 'Orthopedics');
INSERT INTO department (id, name) VALUES (4, 'Pediatrics');
INSERT INTO department (id, name) VALUES (5, 'Dermatology');
INSERT INTO department (id, name) VALUES (6, 'ENT');
INSERT INTO department (id, name) VALUES (7, 'General Medicine');
INSERT INTO department (id, name) VALUES (8, 'Gynecology');

INSERT INTO doctor (id, name, department_id, working_days, start_time, end_time, slot_mins) VALUES 
(1, 'Dr. Aisha Rahman', 1, '1,3,5', '09:00', '13:00', 20),
(2, 'Dr. Sara Lin', 1, '1,2,3,4,5', '14:00', '18:00', 20),
(3, 'Dr. Ahmed Khan', 2, '2,4', '10:00', '14:00', 30);

INSERT INTO appointment (doctor_id, patient_id, patient_name, date, time, end_time, status) VALUES 
(1, 'p1', 'Emily Chen', '2026-10-04', '09:00', '09:20', 'Confirmed'),
(1, 'p2', 'Michael Rossi', '2026-10-04', '09:20', '09:40', 'Confirmed'),
(1, 'p3', 'Sarah Jenkins', '2026-10-04', '10:00', '10:20', 'Confirmed');

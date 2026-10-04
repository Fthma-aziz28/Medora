export const DEMO_DEPARTMENTS = [
    { id: 1, name: 'Cardiology' },
    { id: 2, name: 'Neurology' },
    { id: 3, name: 'Pediatrics' },
    { id: 4, name: 'General Surgery' },
    { id: 5, name: 'Emergency Medicine' },
    { id: 6, name: 'Orthopedics' }
];

export const DEMO_DOCTORS = [
    { 
        id: 1, 
        name: 'Dr. Aisha Rahman', 
        email: 'aisha@medora.com', 
        departmentId: 1, 
        departmentName: 'Cardiology', 
        specialty: 'Interventional Cardiology', 
        workingDays: 'Mon,Wed,Fri', 
        startTime: '09:00', 
        endTime: '13:00', 
        status: 'ACTIVE' 
    },
    { 
        id: 2, 
        name: 'Dr. Sara Lin', 
        email: 'sara.lin@medora.com', 
        departmentId: 1, 
        departmentName: 'Cardiology', 
        specialty: 'Electrophysiology', 
        workingDays: 'Mon-Fri', 
        startTime: '14:00', 
        endTime: '18:00', 
        status: 'ACTIVE' 
    },
    { 
        id: 3, 
        name: 'Dr. Ahmed Khan', 
        email: 'ahmed.khan@medora.com', 
        departmentId: 2, 
        departmentName: 'Neurology', 
        specialty: 'Stroke & Vascular Neurology', 
        workingDays: 'Tue,Thu,Sat', 
        startTime: '10:00', 
        endTime: '14:00', 
        status: 'ACTIVE' 
    },
    { 
        id: 4, 
        name: 'Dr. Marcus Vance', 
        email: 'marcus.vance@medora.com', 
        departmentId: 3, 
        departmentName: 'Pediatrics', 
        specialty: 'Neonatal Critical Care', 
        workingDays: 'Mon-Fri', 
        startTime: '08:00', 
        endTime: '16:00', 
        status: 'ACTIVE' 
    },
    { 
        id: 5, 
        name: 'Dr. Elena Rostova', 
        email: 'elena.rostova@medora.com', 
        departmentId: 4, 
        departmentName: 'General Surgery', 
        specialty: 'Trauma & Acute Care', 
        workingDays: 'Mon,Tue,Wed,Thu,Fri', 
        startTime: '07:30', 
        endTime: '15:30', 
        status: 'ACTIVE' 
    },
    { 
        id: 6, 
        name: 'Dr. Tariq Al-Mansoor', 
        email: 'tariq.mansoor@medora.com', 
        departmentId: 2, 
        departmentName: 'Neurology', 
        specialty: 'Clinical Neurophysiology', 
        workingDays: 'Mon,Wed,Fri', 
        startTime: '09:00', 
        endTime: '17:00', 
        status: 'PENDING_VERIFICATION' 
    }
];

export const DEMO_LEAVES = [
    { 
        id: 1, 
        doctorId: 1, 
        doctorName: 'Dr. Aisha Rahman', 
        doctorSpecialty: 'Cardiology', 
        startDate: '2026-10-06', 
        endDate: '2026-10-08', 
        reason: 'International Cardiology Symposium Keynote', 
        status: 'PENDING' 
    },
    { 
        id: 2, 
        doctorId: 3, 
        doctorName: 'Dr. Ahmed Khan', 
        doctorSpecialty: 'Neurology', 
        startDate: '2026-10-12', 
        endDate: '2026-10-14', 
        reason: 'Family Emergency Leave', 
        status: 'APPROVED' 
    },
    { 
        id: 3, 
        doctorId: 2, 
        doctorName: 'Dr. Sara Lin', 
        doctorSpecialty: 'Cardiology', 
        startDate: '2026-10-18', 
        endDate: '2026-10-20', 
        reason: 'Annual Research Recertification', 
        status: 'APPROVED' 
    },
    { 
        id: 4, 
        doctorId: 5, 
        doctorName: 'Dr. Elena Rostova', 
        doctorSpecialty: 'General Surgery', 
        startDate: '2026-10-25', 
        endDate: '2026-10-26', 
        reason: 'Personal Leave Request', 
        status: 'REJECTED' 
    }
];

export const DEMO_APPOINTMENTS = [
    { id: 1, doctorId: 1, patientName: 'Emily Chen', appointmentDate: '2026-10-05', startTime: '09:00:00', endTime: '09:20:00', status: 'Confirmed' },
    { id: 2, doctorId: 1, patientName: 'Michael Rossi', appointmentDate: '2026-10-05', startTime: '09:20:00', endTime: '09:40:00', status: 'Confirmed' },
    { id: 3, doctorId: 2, patientName: 'Sarah Jenkins', appointmentDate: '2026-10-05', startTime: '14:00:00', endTime: '14:30:00', status: 'Confirmed' },
    { id: 4, doctorId: 3, patientName: 'David Miller', appointmentDate: '2026-10-06', startTime: '10:30:00', endTime: '11:00:00', status: 'Pending' },
    { id: 5, doctorId: 4, patientName: 'Olivia Taylor', appointmentDate: '2026-10-06', startTime: '11:00:00', endTime: '11:30:00', status: 'Confirmed' }
];

export const DEMO_IMPORT_HISTORY = [
    {
        id: 1,
        filename: 'Cardiology_Staff_Q4.xlsx',
        importedBy: 'Admin User',
        importTimestamp: '2026-10-04 15:30:00',
        totalRows: 12,
        successfulRows: 12,
        updatedRows: 0,
        skippedRows: 0,
        failedRows: 0,
        status: 'SUCCESS'
    },
    {
        id: 2,
        filename: 'Neurology_Fellows_Import.csv',
        importedBy: 'Admin User',
        importTimestamp: '2026-10-03 11:20:00',
        totalRows: 8,
        successfulRows: 7,
        updatedRows: 0,
        skippedRows: 1,
        failedRows: 0,
        status: 'SUCCESS'
    }
];

export const DEMO_FAIRNESS_HISTORY = [
    {
        id: 1,
        slotDate: '2026-10-04',
        slotTime: '09:00 - 13:00',
        originalDoctorId: 1,
        originalDoctorName: 'Dr. Aisha Rahman',
        replacementDoctorId: 2,
        replacementDoctorName: 'Dr. Sara Lin',
        fairnessScore: 92.5,
        reason: 'Optimal workload equity and satisfied 14h mandatory rest window',
        overrideReason: null
    },
    {
        id: 2,
        slotDate: '2026-09-28',
        slotTime: '10:00 - 14:00',
        originalDoctorId: 3,
        originalDoctorName: 'Dr. Ahmed Khan',
        replacementDoctorId: 6,
        replacementDoctorName: 'Dr. Tariq Al-Mansoor',
        fairnessScore: 88.0,
        reason: 'Lowest cumulative overtime hours in Neurology department',
        overrideReason: null
    }
];

export const DEMO_ANALYSIS = [
    {
        vacantSlot: {
            appointmentDate: '2026-10-06',
            startTime: '09:00',
            endTime: '13:00'
        },
        originalDoctor: {
            id: 1,
            name: 'Dr. Aisha Rahman',
            specialty: 'Cardiology'
        },
        candidates: [
            {
                doctorId: 2,
                doctorName: 'Dr. Sara Lin',
                fairnessScore: 94.2,
                weeklyDutyHours: 24,
                restHoursBeforeSlot: 16.5,
                consecutiveDutyDays: 2,
                qualificationMatch: true,
                justification: 'Lowest weekly duty accumulation (24h) and exceeded minimum rest window requirement (16.5h).'
            },
            {
                doctorId: 3,
                doctorName: 'Dr. Ahmed Khan',
                fairnessScore: 78.6,
                weeklyDutyHours: 32,
                restHoursBeforeSlot: 12.0,
                consecutiveDutyDays: 3,
                qualificationMatch: true,
                justification: 'Eligible cross-department replacement with acceptable rest window.'
            }
        ]
    }
];

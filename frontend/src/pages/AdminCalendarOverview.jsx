import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './AdminCalendarOverview.css';

const localizer = momentLocalizer(moment);

export default function AdminCalendarOverview() {
    const [events] = useState([
        {
            title: 'Dr. Sarah Jenkins - Emergency Ward Shift 🏥',
            start: moment().startOf('week').add(1, 'days').set({hour: 8, minute: 0}).toDate(),
            end: moment().startOf('week').add(1, 'days').set({hour: 16, minute: 0}).toDate(),
            type: 'emergency'
        },
        {
            title: 'Dr. Marcus Vance - Cardiology Consults 🫀',
            start: moment().startOf('week').add(1, 'days').set({hour: 9, minute: 0}).toDate(),
            end: moment().startOf('week').add(1, 'days').set({hour: 13, minute: 0}).toDate(),
            type: 'cardiology'
        },
        {
            title: 'Dr. Elena Rostova - Outpatient Surgery 🩺',
            start: moment().startOf('week').add(2, 'days').set({hour: 8, minute: 30}).toDate(),
            end: moment().startOf('week').add(2, 'days').set({hour: 14, minute: 0}).toDate(),
            type: 'surgery'
        },
        {
            title: 'Patient Consult - Emily Watson (General Checkup)',
            start: moment().startOf('week').add(2, 'days').set({hour: 14, minute: 30}).toDate(),
            end: moment().startOf('week').add(2, 'days').set({hour: 16, minute: 0}).toDate(),
            type: 'consult'
        },
        {
            title: 'Dr. Robert Chen - Pediatrics Clinic 👶',
            start: moment().startOf('week').add(3, 'days').set({hour: 9, minute: 0}).toDate(),
            end: moment().startOf('week').add(3, 'days').set({hour: 13, minute: 0}).toDate(),
            type: 'pediatrics'
        },
        {
            title: 'Dr. Ayesha Khan - Neurology Outpatient 🧠',
            start: moment().startOf('week').add(3, 'days').set({hour: 13, minute: 30}).toDate(),
            end: moment().startOf('week').add(3, 'days').set({hour: 17, minute: 30}).toDate(),
            type: 'neurology'
        },
        {
            title: 'Dr. David Miller - ICU Supervision ⚡',
            start: moment().startOf('week').add(4, 'days').set({hour: 8, minute: 0}).toDate(),
            end: moment().startOf('week').add(4, 'days').set({hour: 16, minute: 0}).toDate(),
            type: 'icu'
        },
        {
            title: 'Hospital Staff Sync & Shift Handover 📋',
            start: moment().startOf('week').add(4, 'days').set({hour: 16, minute: 0}).toDate(),
            end: moment().startOf('week').add(4, 'days').set({hour: 17, minute: 30}).toDate(),
            type: 'sync'
        },
        {
            title: 'Dr. Sarah Jenkins - Emergency Ward 🚑',
            start: moment().startOf('week').add(5, 'days').set({hour: 8, minute: 0}).toDate(),
            end: moment().startOf('week').add(5, 'days').set({hour: 16, minute: 0}).toDate(),
            type: 'emergency'
        },
        {
            title: 'Dr. Marcus Vance - Cardiac Procedures 🫀',
            start: moment().startOf('week').add(5, 'days').set({hour: 10, minute: 0}).toDate(),
            end: moment().startOf('week').add(5, 'days').set({hour: 15, minute: 0}).toDate(),
            type: 'cardiology'
        },
        {
            title: 'On-Call Emergency Duty - Dr. E. Rostova 🚨',
            start: moment().startOf('week').add(6, 'days').set({hour: 9, minute: 0}).toDate(),
            end: moment().startOf('week').add(6, 'days').set({hour: 17, minute: 0}).toDate(),
            type: 'oncall'
        }
    ]);

    const eventStyleGetter = (event) => {
        let backgroundColor = '#8EB69B'; 
        let color = 'white';

        switch (event.type) {
            case 'emergency': 
                backgroundColor = '#8EB69B'; // Sage green
                color = '#051F20';
                break; 
            case 'cardiology': 
                backgroundColor = '#A3C9A8'; // Soft light green
                color = '#051F20';
                break; 
            case 'surgery': 
                backgroundColor = '#235347'; // Dark green
                color = '#DAF1DE';
                break; 
            case 'consult': 
                backgroundColor = '#E5DFD3'; // Beige
                color = '#051F20';
                break; 
            case 'pediatrics': 
                backgroundColor = '#DAF1DE'; // Pale mint
                color = '#051F20';
                break; 
            case 'neurology': 
                backgroundColor = '#B2D8C3'; // Soft pastel green
                color = '#051F20';
                break;
            case 'icu': 
                backgroundColor = '#051F20'; // Deep emerald
                color = '#DAF1DE';
                break;
            case 'sync': 
                backgroundColor = '#D4C5B9'; // Taupe beige
                color = '#051F20';
                break;
            case 'oncall':
                backgroundColor = '#0B2B26'; // Dark green
                color = '#DAF1DE';
                break;
            default: 
                backgroundColor = '#8EB69B';
                color = '#051F20';
        }

        return {
            style: {
                backgroundColor,
                color,
                borderRadius: '6px',
                opacity: 0.95,
                border: 'none',
                display: 'block',
                fontWeight: '600',
                fontSize: '0.8rem',
                padding: '4px 8px',
                boxShadow: '0 2px 6px rgba(5,31,32,0.15)'
            }
        };
    };

    return (
        <div className="admin-calendar-container glass-panel">
            <header className="calendar-header">
                <h2>Hospital Operations Calendar</h2>
                <p>Physician shifts and appointment master schedule</p>
            </header>
            <div className="calendar-wrapper">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 700 }}
                    eventPropGetter={eventStyleGetter}
                    views={['month', 'week', 'day']}
                    defaultView="week"
                />
            </div>
        </div>
    );
}


import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { API_BASE_URL } from '../apiConfig';
import './AdminCalendarOverview.css';

const localizer = momentLocalizer(moment);

const BASE_EVENTS = [
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
        title: 'Hospital Staff Sync & Shift Handover 📋',
        start: moment().startOf('week').add(4, 'days').set({hour: 16, minute: 0}).toDate(),
        end: moment().startOf('week').add(4, 'days').set({hour: 17, minute: 30}).toDate(),
        type: 'sync'
    }
];

export default function AdminCalendarOverview() {
    const [events, setEvents] = useState(BASE_EVENTS);

    const loadCalendarData = async () => {
        if (!API_BASE_URL) return;
        try {
            const token = localStorage.getItem('medora_token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const apptRes = await fetch(`${API_BASE_URL}/api/appointments`, { headers });
            if (apptRes.ok) {
                const appts = await apptRes.json();
                if (Array.isArray(appts)) {
                    const mappedAppts = appts.map(a => {
                        const dateStr = a.appointmentDate || moment().format('YYYY-MM-DD');
                        const startTimeStr = a.startTime ? a.startTime.substring(0, 5) : '09:00';
                        const endTimeStr = a.endTime ? a.endTime.substring(0, 5) : '09:30';

                        const startMoment = moment(`${dateStr} ${startTimeStr}`, 'YYYY-MM-DD HH:mm');
                        const endMoment = moment(`${dateStr} ${endTimeStr}`, 'YYYY-MM-DD HH:mm');

                        return {
                            id: `appt-${a.id}`,
                            title: `🩺 ${a.doctorName || 'Doctor'}: Consult with ${a.patientName} (${a.status || 'Confirmed'})`,
                            start: startMoment.isValid() ? startMoment.toDate() : new Date(),
                            end: endMoment.isValid() ? endMoment.toDate() : moment().add(30, 'minutes').toDate(),
                            type: 'consult'
                        };
                    });

                    setEvents([...BASE_EVENTS, ...mappedAppts]);
                }
            }
        } catch (err) {
            console.warn("Error loading calendar appointments:", err);
        }
    };

    useEffect(() => {
        loadCalendarData();
        const handleSync = () => loadCalendarData();
        window.addEventListener('medora_appointment_updated', handleSync);
        return () => window.removeEventListener('medora_appointment_updated', handleSync);
    }, []);

    const eventStyleGetter = (event) => {
        let backgroundColor = '#8EB69B'; 
        let color = '#051F20';

        switch (event.type) {
            case 'emergency': 
                backgroundColor = '#8EB69B';
                color = '#051F20';
                break; 
            case 'cardiology': 
                backgroundColor = '#A3C9A8';
                color = '#051F20';
                break; 
            case 'surgery': 
                backgroundColor = '#235347';
                color = '#DAF1DE';
                break; 
            case 'consult': 
                backgroundColor = '#E5DFD3';
                color = '#051F20';
                break; 
            case 'pediatrics': 
                backgroundColor = '#DAF1DE';
                color = '#051F20';
                break; 
            case 'neurology': 
                backgroundColor = '#B2D8C3';
                color = '#051F20';
                break;
            case 'icu': 
                backgroundColor = '#051F20';
                color = '#DAF1DE';
                break;
            case 'sync': 
                backgroundColor = '#D4C5B9';
                color = '#051F20';
                break;
            case 'oncall':
                backgroundColor = '#0B2B26';
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
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
                display: 'block',
                fontWeight: '600',
                fontSize: '0.8rem',
                padding: '4px 8px'
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

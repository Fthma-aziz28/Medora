import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { API_BASE_URL } from '../apiConfig';
import './AdminCalendarOverview.css';

const localizer = momentLocalizer(moment);

const BASE_EVENTS = [
    {
        title: 'Dr. Sarah Jenkins — Emergency Ward',
        start: moment().startOf('week').add(1, 'days').set({ hour: 8, minute: 0 }).toDate(),
        end:   moment().startOf('week').add(1, 'days').set({ hour: 16, minute: 0 }).toDate(),
        type: 'emergency', doctorName: 'Dr. Sarah Jenkins'
    },
    {
        title: 'Dr. Marcus Vance — Cardiology Consults',
        start: moment().startOf('week').add(1, 'days').set({ hour: 9, minute: 0 }).toDate(),
        end:   moment().startOf('week').add(1, 'days').set({ hour: 13, minute: 0 }).toDate(),
        type: 'cardiology', doctorName: 'Dr. Marcus Vance'
    },
    {
        title: 'Dr. Elena Rostova — Outpatient Surgery',
        start: moment().startOf('week').add(2, 'days').set({ hour: 8, minute: 30 }).toDate(),
        end:   moment().startOf('week').add(2, 'days').set({ hour: 14, minute: 0 }).toDate(),
        type: 'surgery', doctorName: 'Dr. Elena Rostova'
    },
    {
        title: 'Hospital Staff Sync & Shift Handover',
        start: moment().startOf('week').add(4, 'days').set({ hour: 16, minute: 0 }).toDate(),
        end:   moment().startOf('week').add(4, 'days').set({ hour: 17, minute: 30 }).toDate(),
        type: 'sync', doctorName: 'All Staff'
    }
];

const EVENT_COLORS = {
    emergency:  { bg: '#8EB69B', fg: '#051F20' },
    cardiology: { bg: '#A3C9A8', fg: '#051F20' },
    surgery:    { bg: '#235347', fg: '#DAF1DE' },
    consult:    { bg: '#E5DFD3', fg: '#051F20' },
    pediatrics: { bg: '#DAF1DE', fg: '#051F20' },
    neurology:  { bg: '#B2D8C3', fg: '#051F20' },
    icu:        { bg: '#051F20', fg: '#DAF1DE' },
    sync:       { bg: '#D4C5B9', fg: '#051F20' },
    oncall:     { bg: '#0B2B26', fg: '#DAF1DE' },
    leave:      { bg: '#F59E0B', fg: '#1C1917' },
    default:    { bg: '#8EB69B', fg: '#051F20' },
};

const LEGEND_ITEMS = [
    { label: 'Consult / Appointment', type: 'consult' },
    { label: 'Emergency Shift',        type: 'emergency' },
    { label: 'Surgery',                type: 'surgery' },
    { label: 'Cardiology',             type: 'cardiology' },
    { label: 'Sync / Handover',        type: 'sync' },
    { label: 'On Call',                type: 'oncall' },
    { label: 'Leave',                  type: 'leave' },
];

export default function AdminCalendarOverview() {
    const [allEvents, setAllEvents]   = useState(BASE_EVENTS);
    const [doctors, setDoctors]       = useState([]);
    const [filterDoc, setFilterDoc]   = useState('ALL'); // 'ALL' or doctorName string

    const loadCalendarData = async () => {
        if (!API_BASE_URL) return;
        const token = localStorage.getItem('medora_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        // Load doctors for the filter dropdown
        try {
            const docRes = await fetch(`${API_BASE_URL}/api/doctors`, { headers });
            if (docRes.ok) {
                const docs = await docRes.json();
                if (Array.isArray(docs)) setDoctors(docs);
            }
        } catch (err) {
            console.warn('Doctor list fetch failed:', err);
        }

        // Load appointments into calendar
        try {
            const apptRes = await fetch(`${API_BASE_URL}/api/appointments`, { headers });
            if (apptRes.ok) {
                const appts = await apptRes.json();
                if (Array.isArray(appts)) {
                    const mappedAppts = appts.map(a => {
                        const dateStr     = a.appointmentDate || moment().format('YYYY-MM-DD');
                        const startStr    = a.startTime ? a.startTime.substring(0, 5) : '09:00';
                        const endStr      = a.endTime   ? a.endTime.substring(0, 5)   : '09:30';
                        const startMoment = moment(`${dateStr} ${startStr}`, 'YYYY-MM-DD HH:mm');
                        const endMoment   = moment(`${dateStr} ${endStr}`,   'YYYY-MM-DD HH:mm');
                        const docName     = a.doctorName || 'Doctor';
                        return {
                            id:         `appt-${a.id}`,
                            title:      `${docName}: ${a.patientName || 'Patient'} (${a.status || 'Confirmed'})`,
                            start:      startMoment.isValid() ? startMoment.toDate() : new Date(),
                            end:        endMoment.isValid()   ? endMoment.toDate()   : moment().add(30, 'minutes').toDate(),
                            type:       'consult',
                            doctorName: docName,
                        };
                    });
                    setAllEvents([...BASE_EVENTS, ...mappedAppts]);
                }
            }
        } catch (err) {
            console.warn('Calendar appointments fetch failed:', err);
        }
    };

    useEffect(() => {
        loadCalendarData();
        const handleSync = () => loadCalendarData();
        window.addEventListener('medora_appointment_updated', handleSync);
        return () => window.removeEventListener('medora_appointment_updated', handleSync);
    }, []);

    // Apply doctor filter
    const visibleEvents = filterDoc === 'ALL'
        ? allEvents
        : allEvents.filter(e => (e.doctorName || '').includes(filterDoc));

    const eventStyleGetter = (event) => {
        const colors = EVENT_COLORS[event.type] || EVENT_COLORS.default;
        return {
            style: {
                backgroundColor: colors.bg,
                color:           colors.fg,
                borderRadius:    '5px',
                border:          'none',
                display:         'block',
                fontWeight:      600,
                fontSize:        '0.78rem',
                padding:         '3px 7px',
                overflow:        'hidden',
                whiteSpace:      'nowrap',
                textOverflow:    'ellipsis',
            }
        };
    };

    return (
        <div className="admin-calendar-container glass-panel">
            <header className="calendar-header">
                <div className="calendar-header-row">
                    <div>
                        <h2>Hospital Operations Calendar</h2>
                        <p>Physician shifts, appointments, and duty assignments</p>
                    </div>

                    {/* Doctor filter */}
                    <div className="calendar-filter">
                        <label htmlFor="doc-filter">Viewing:</label>
                        <select
                            id="doc-filter"
                            value={filterDoc}
                            onChange={e => setFilterDoc(e.target.value)}
                        >
                            <option value="ALL">All Doctors</option>
                            {doctors.map(d => (
                                <option key={d.id} value={d.name || `Doc-${d.id}`}>
                                    {d.name || `Doctor ${d.id}`}
                                </option>
                            ))}
                            {/* Fallback demo names if no backend */}
                            {doctors.length === 0 && <>
                                <option value="Dr. Sarah Jenkins">Dr. Sarah Jenkins</option>
                                <option value="Dr. Marcus Vance">Dr. Marcus Vance</option>
                                <option value="Dr. Elena Rostova">Dr. Elena Rostova</option>
                            </>}
                        </select>
                    </div>
                </div>
            </header>

            <div className="calendar-wrapper">
                <Calendar
                    localizer={localizer}
                    events={visibleEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 640 }}
                    eventPropGetter={eventStyleGetter}
                    views={['month', 'week', 'day']}
                    defaultView="week"
                    popup
                    showMultiDayTimes
                    step={30}
                    timeslots={2}
                    tooltipAccessor={e => e.title}
                />
            </div>

            {/* Legend */}
            <div className="calendar-legend">
                {LEGEND_ITEMS.map(item => {
                    const colors = EVENT_COLORS[item.type];
                    return (
                        <div key={item.type} className="legend-item">
                            <span
                                className="legend-swatch"
                                style={{ background: colors.bg, border: `1px solid ${colors.fg}22` }}
                            />
                            <span className="legend-label">{item.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

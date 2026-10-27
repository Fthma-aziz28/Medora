import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { API_BASE_URL } from '../apiConfig';
import './AdminCalendarOverview.css';

const localizer = momentLocalizer(moment);

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
    { label: 'Outpatient Consult',     type: 'consult' },
    { label: 'Emergency Reassignment', type: 'emergency' },
    { label: 'Cardiology / Dept Shift',type: 'cardiology' },
    { label: 'Approved Leave',         type: 'leave' },
    { label: 'Scheduled Roster Duty',  type: 'oncall' }
];

export default function AdminCalendarOverview() {
    const [allEvents, setAllEvents] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [filterDoc, setFilterDoc] = useState('ALL');
    const [loading, setLoading] = useState(true);

    const loadCalendarData = async () => {
        if (!API_BASE_URL) {
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('medora_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const events = [];

        let docList = [];
        // 1. Fetch real doctors
        try {
            const docRes = await fetch(`${API_BASE_URL}/api/doctors`, { headers });
            if (docRes.ok) {
                const docs = await docRes.json();
                if (Array.isArray(docs)) {
                    docList = docs;
                    setDoctors(docs);
                }
            }
        } catch (err) {
            console.warn('Doctor list fetch failed:', err);
        }

        // 2. Fetch real appointments
        try {
            const apptRes = await fetch(`${API_BASE_URL}/api/appointments`, { headers });
            if (apptRes.ok) {
                const appts = await apptRes.json();
                if (Array.isArray(appts)) {
                    appts.forEach(a => {
                        const dateStr = a.appointmentDate || moment().format('YYYY-MM-DD');
                        const startStr = a.startTime ? a.startTime.substring(0, 5) : '09:00';
                        const endStr = a.endTime ? a.endTime.substring(0, 5) : '09:30';
                        const startMoment = moment(`${dateStr} ${startStr}`, 'YYYY-MM-DD HH:mm');
                        const endMoment = moment(`${dateStr} ${endStr}`, 'YYYY-MM-DD HH:mm');
                        const docName = a.doctorName || `Dr. #${a.doctorId}`;
                        const isEmergency = a.isEmergencyReplacement;

                        events.push({
                            id: `appt-${a.id}`,
                            title: `${docName}: ${a.patientName} (${a.status || 'Confirmed'})`,
                            start: startMoment.isValid() ? startMoment.toDate() : new Date(),
                            end: endMoment.isValid() ? endMoment.toDate() : moment().add(30, 'minutes').toDate(),
                            type: isEmergency ? 'emergency' : 'consult',
                            doctorName: docName
                        });
                    });
                }
            }
        } catch (err) {
            console.warn('Appointments fetch failed:', err);
        }

        // 3. Fetch real approved leave requests
        try {
            const leaveRes = await fetch(`${API_BASE_URL}/api/leaves`, { headers });
            if (leaveRes.ok) {
                const leaves = await leaveRes.json();
                if (Array.isArray(leaves)) {
                    leaves.forEach(l => {
                        if ((l.status || '').toUpperCase() === 'APPROVED') {
                            const docName = l.doctorName || `Dr. #${l.doctorId}`;
                            const startM = moment(l.startDate, 'YYYY-MM-DD').startOf('day');
                            const endM = moment(l.endDate, 'YYYY-MM-DD').endOf('day');

                            events.push({
                                id: `leave-${l.id}`,
                                title: `${docName}: Approved Absence (${l.reason || 'Authorized'})`,
                                start: startM.isValid() ? startM.toDate() : new Date(),
                                end: endM.isValid() ? endM.toDate() : new Date(),
                                type: 'leave',
                                doctorName: docName
                            });
                        }
                    });
                }
            }
        } catch (err) {
            console.warn('Leave requests fetch failed:', err);
        }

        // 4. Synthesize real roster shift duties for active doctors
        if (docList.length > 0) {
            const startOfWeek = moment().startOf('week');
            docList.forEach(doc => {
                if (!doc.workingDays) return;
                const docName = doc.name || `Dr. #${doc.id}`;
                const workingDaysStr = doc.workingDays.toLowerCase();
                const startTimeStr = doc.startTime ? doc.startTime.substring(0, 5) : '08:00';
                const endTimeStr = doc.endTime ? doc.endTime.substring(0, 5) : '16:00';

                // Check standard days Mon(1) to Fri(5)
                const dayMap = [
                    { name: 'mon', num: 1 },
                    { name: 'tue', num: 2 },
                    { name: 'wed', num: 3 },
                    { name: 'thu', num: 4 },
                    { name: 'fri', num: 5 },
                    { name: 'sat', num: 6 },
                    { name: 'sun', num: 7 }
                ];

                dayMap.forEach(d => {
                    if (workingDaysStr.includes(d.name) || workingDaysStr.includes(String(d.num))) {
                        const shiftDate = moment(startOfWeek).add(d.num, 'days').format('YYYY-MM-DD');
                        const startM = moment(`${shiftDate} ${startTimeStr}`, 'YYYY-MM-DD HH:mm');
                        const endM = moment(`${shiftDate} ${endTimeStr}`, 'YYYY-MM-DD HH:mm');

                        events.push({
                            id: `shift-${doc.id}-${d.num}`,
                            title: `${docName} — ${doc.departmentName || doc.specialty || 'General'} Shift`,
                            start: startM.toDate(),
                            end: endM.toDate(),
                            type: (doc.departmentName || '').toLowerCase().includes('cardio') ? 'cardiology' : 'oncall',
                            doctorName: docName
                        });
                    }
                });
            });
        }

        setAllEvents(events);
        setLoading(false);
    };

    useEffect(() => {
        loadCalendarData();
        const handleSync = () => loadCalendarData();
        window.addEventListener('medora_appointment_updated', handleSync);
        window.addEventListener('medora_doctor_updated', handleSync);
        return () => {
            window.removeEventListener('medora_appointment_updated', handleSync);
            window.removeEventListener('medora_doctor_updated', handleSync);
        };
    }, []);

    // Apply doctor filter
    const visibleEvents = filterDoc === 'ALL'
        ? allEvents
        : allEvents.filter(e => (e.doctorName || '').toLowerCase().includes(filterDoc.toLowerCase()));

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
                        <p>Real-time physician shifts, outpatient appointments, and authorized absence coverage</p>
                    </div>

                    {/* Doctor filter */}
                    <div className="calendar-filter">
                        <label htmlFor="doc-filter">Viewing:</label>
                        <select
                            id="doc-filter"
                            value={filterDoc}
                            onChange={e => setFilterDoc(e.target.value)}
                        >
                            <option value="ALL">All Physicians ({doctors.length})</option>
                            {doctors.map(d => (
                                <option key={d.id} value={d.name || `Doc-${d.id}`}>
                                    {d.name || `Dr. #${d.id}`} ({d.departmentName || 'Staff'})
                                </option>
                            ))}
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

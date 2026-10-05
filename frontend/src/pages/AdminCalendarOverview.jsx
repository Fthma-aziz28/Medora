import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CalendarDays, Clock, User, Building2, Search, 
    Filter, X, CheckCircle, AlertCircle, ChevronLeft, ChevronRight 
} from 'lucide-react';
import DateRangePicker from '@/components/ui/date-range-picker';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './AdminCalendarOverview.css';

const localizer = momentLocalizer(moment);

const INITIAL_EVENTS = [
    {
        id: 1,
        title: 'Dr. Sarah Jenkins',
        department: 'Emergency',
        ward: 'Trauma Bay 1',
        start: moment().startOf('week').add(1, 'days').set({hour: 8, minute: 0}).toDate(),
        end: moment().startOf('week').add(1, 'days').set({hour: 16, minute: 0}).toDate(),
        type: 'emergency',
        status: 'Confirmed Shift'
    },
    {
        id: 2,
        title: 'Dr. Marcus Vance',
        department: 'Cardiology',
        ward: 'Cath Lab 2',
        start: moment().startOf('week').add(1, 'days').set({hour: 9, minute: 0}).toDate(),
        end: moment().startOf('week').add(1, 'days').set({hour: 13, minute: 0}).toDate(),
        type: 'cardiology',
        status: 'Scheduled'
    },
    {
        id: 3,
        title: 'Dr. Elena Rostova',
        department: 'Surgery',
        ward: 'OR-4 General',
        start: moment().startOf('week').add(2, 'days').set({hour: 8, minute: 30}).toDate(),
        end: moment().startOf('week').add(2, 'days').set({hour: 14, minute: 0}).toDate(),
        type: 'surgery',
        status: 'Pre-Op Confirmed'
    },
    {
        id: 4,
        title: 'Patient Consult: Emily Watson',
        department: 'General Outpatient',
        ward: 'Consult Room 102',
        start: moment().startOf('week').add(2, 'days').set({hour: 14, minute: 30}).toDate(),
        end: moment().startOf('week').add(2, 'days').set({hour: 16, minute: 0}).toDate(),
        type: 'consult',
        status: 'Routine Visit'
    },
    {
        id: 5,
        title: 'Dr. Robert Chen',
        department: 'Pediatrics',
        ward: 'Pediatric Wing B',
        start: moment().startOf('week').add(3, 'days').set({hour: 9, minute: 0}).toDate(),
        end: moment().startOf('week').add(3, 'days').set({hour: 13, minute: 0}).toDate(),
        type: 'pediatrics',
        status: 'Morning Clinic'
    },
    {
        id: 6,
        title: 'Dr. Ayesha Khan',
        department: 'Neurology',
        ward: 'Neuro Diagnostic Suite',
        start: moment().startOf('week').add(3, 'days').set({hour: 13, minute: 30}).toDate(),
        end: moment().startOf('week').add(3, 'days').set({hour: 17, minute: 30}).toDate(),
        type: 'neurology',
        status: 'EEG Reviews'
    },
    {
        id: 7,
        title: 'Dr. David Miller',
        department: 'ICU',
        ward: 'Intensive Care Unit 3',
        start: moment().startOf('week').add(4, 'days').set({hour: 8, minute: 0}).toDate(),
        end: moment().startOf('week').add(4, 'days').set({hour: 16, minute: 0}).toDate(),
        type: 'icu',
        status: 'Supervision Shift'
    },
    {
        id: 8,
        title: 'Hospital Staff Sync & Handover',
        department: 'Operations',
        ward: 'Conference Room Alpha',
        start: moment().startOf('week').add(4, 'days').set({hour: 16, minute: 0}).toDate(),
        end: moment().startOf('week').add(4, 'days').set({hour: 17, minute: 30}).toDate(),
        type: 'sync',
        status: 'Mandatory All-Hands'
    },
    {
        id: 9,
        title: 'Dr. Sarah Jenkins',
        department: 'Emergency',
        ward: 'Rapid Response Unit',
        start: moment().startOf('week').add(5, 'days').set({hour: 8, minute: 0}).toDate(),
        end: moment().startOf('week').add(5, 'days').set({hour: 16, minute: 0}).toDate(),
        type: 'emergency',
        status: 'On-Duty'
    },
    {
        id: 10,
        title: 'Dr. Marcus Vance',
        department: 'Cardiology',
        ward: 'Echocardiogram Unit',
        start: moment().startOf('week').add(5, 'days').set({hour: 10, minute: 0}).toDate(),
        end: moment().startOf('week').add(5, 'days').set({hour: 15, minute: 0}).toDate(),
        type: 'cardiology',
        status: 'Procedures'
    },
    {
        id: 11,
        title: 'Dr. Elena Rostova (On-Call)',
        department: 'Emergency',
        ward: 'On-Call Room C',
        start: moment().startOf('week').add(6, 'days').set({hour: 9, minute: 0}).toDate(),
        end: moment().startOf('week').add(6, 'days').set({hour: 17, minute: 0}).toDate(),
        type: 'oncall',
        status: 'Active Coverage'
    }
];

const DEPARTMENTS = ['All', 'Emergency', 'Cardiology', 'Surgery', 'Pediatrics', 'Neurology', 'ICU'];

export default function AdminCalendarOverview() {
    const [events] = useState(INITIAL_EVENTS);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState('week');
    const [selectedDepartment, setSelectedDepartment] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedRange, setSelectedRange] = useState(null);

    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            const matchesDept = selectedDepartment === 'All' || 
                e.department.toLowerCase() === selectedDepartment.toLowerCase() ||
                e.type.toLowerCase() === selectedDepartment.toLowerCase();
            
            const matchesSearch = searchQuery === '' || 
                e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.ward.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesDateRange = !selectedRange || (
                moment(e.start).isSameOrAfter(moment(selectedRange.start).startOf('day')) &&
                moment(e.end).isSameOrBefore(moment(selectedRange.end).endOf('day'))
            );

            return matchesDept && matchesSearch && matchesDateRange;
        });
    }, [events, selectedDepartment, searchQuery, selectedRange]);

    const handleRangeChange = (range) => {
        setSelectedRange(range);
        if (range?.start) {
            setCurrentDate(range.start);
        }
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
    };

    const eventStyleGetter = (event) => {
        let backgroundColor = '#8EB69B';
        let color = '#051F20';
        let borderLeft = '4px solid #163832';

        switch (event.type) {
            case 'emergency':
                backgroundColor = '#DAF1DE';
                color = '#051F20';
                borderLeft = '4px solid #235347';
                break;
            case 'cardiology':
                backgroundColor = '#B2D8C3';
                color = '#051F20';
                borderLeft = '4px solid #163832';
                break;
            case 'surgery':
                backgroundColor = '#235347';
                color = '#DAF1DE';
                borderLeft = '4px solid #8EB69B';
                break;
            case 'consult':
                backgroundColor = '#f3efe6';
                color = '#051F20';
                borderLeft = '4px solid #0B2B26';
                break;
            case 'pediatrics':
                backgroundColor = '#DAF1DE';
                color = '#051F20';
                borderLeft = '4px solid #8EB69B';
                break;
            case 'neurology':
                backgroundColor = '#A3C9A8';
                color = '#051F20';
                borderLeft = '4px solid #051F20';
                break;
            case 'icu':
                backgroundColor = '#051F20';
                color = '#DAF1DE';
                borderLeft = '4px solid #DAF1DE';
                break;
            case 'oncall':
                backgroundColor = '#0B2B26';
                color = '#f3efe6';
                borderLeft = '4px solid #A3C9A8';
                break;
            default:
                backgroundColor = '#8EB69B';
                color = '#051F20';
                borderLeft = '4px solid #235347';
        }

        return {
            style: {
                backgroundColor,
                color,
                borderLeft,
                borderRadius: '6px',
                padding: '4px 6px',
                fontSize: '0.78rem',
                fontWeight: '600',
                borderTop: 'none',
                borderRight: 'none',
                borderBottom: 'none',
                boxShadow: '0 2px 6px rgba(5, 31, 32, 0.1)',
                cursor: 'pointer'
            }
        };
    };

    // Custom clear event renderer for React Big Calendar
    const CustomEvent = ({ event }) => {
        const timeStr = `${moment(event.start).format('HH:mm')} - ${moment(event.end).format('HH:mm')}`;
        return (
            <div className="cal-event-card" title={`${event.title} (${event.department})`}>
                <div className="cal-event-title">{event.title}</div>
                <div className="cal-event-meta">
                    <span className="cal-event-time">{timeStr}</span>
                    <span className="cal-event-dept">{event.ward || event.department}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="admin-calendar-container glass-panel">
            {/* Top Calendar Header & Tools */}
            <header className="calendar-header-modern">
                <div className="calendar-title-group">
                    <div className="calendar-icon-badge">
                        <CalendarDays size={24} color="var(--color-1)" />
                    </div>
                    <div>
                        <h2>Hospital Operations Calendar</h2>
                        <p>Real-time physician shift schedules, ward coverage, and clinical consultations</p>
                    </div>
                </div>

                <div className="calendar-actions-bar">
                    {/* Modern Interactive Date Range Picker */}
                    <div className="calendar-picker-wrapper">
                        <DateRangePicker 
                            onChange={handleRangeChange}
                            placeholder="Filter by Date Range"
                        />
                    </div>

                    {/* View Switcher: Week / Month / Day / Agenda */}
                    <div className="calendar-view-toggles">
                        {['week', 'month', 'day', 'agenda'].map(v => (
                            <button
                                key={v}
                                className={`cal-view-btn ${currentView === v ? 'active' : ''}`}
                                onClick={() => setCurrentView(v)}
                            >
                                {v.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Filter & Search Bar */}
            <div className="calendar-filter-ribbon">
                <div className="department-pills">
                    <span className="ribbon-label"><Filter size={14} /> Ward:</span>
                    {DEPARTMENTS.map(dept => (
                        <button
                            key={dept}
                            className={`dept-pill ${selectedDepartment === dept ? 'active' : ''}`}
                            onClick={() => setSelectedDepartment(dept)}
                        >
                            {dept}
                        </button>
                    ))}
                </div>

                <div className="search-filter-box">
                    <Search size={15} color="var(--color-3)" />
                    <input 
                        type="text"
                        placeholder="Search doctor, ward, or patient..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="clear-search" onClick={() => setSearchQuery('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Shift Counters / Metrics Summary */}
            <div className="calendar-metrics-strip">
                <div className="strip-metric">
                    <span className="strip-label">Active Shifts in View</span>
                    <span className="strip-value">{filteredEvents.length}</span>
                </div>
                <div className="strip-metric">
                    <span className="strip-label">Emergency Coverage</span>
                    <span className="strip-value" style={{ color: 'var(--color-4)' }}>
                        {filteredEvents.filter(e => e.type === 'emergency' || e.type === 'oncall').length}
                    </span>
                </div>
                <div className="strip-metric">
                    <span className="strip-label">Departments Staffed</span>
                    <span className="strip-value">
                        {new Set(filteredEvents.map(e => e.department)).size}
                    </span>
                </div>
                <div className="strip-date-info">
                    <Clock size={15} color="var(--color-3)" />
                    <span>Viewing: <strong>{moment(currentDate).format('MMMM YYYY')}</strong></span>
                </div>
            </div>

            {/* Main Calendar Viewport */}
            <div className="calendar-viewport-wrapper">
                <Calendar
                    localizer={localizer}
                    events={filteredEvents}
                    date={currentDate}
                    onNavigate={(newDate) => setCurrentDate(newDate)}
                    view={currentView}
                    onView={(newView) => setCurrentView(newView)}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ minHeight: 650 }}
                    eventPropGetter={eventStyleGetter}
                    components={{
                        event: CustomEvent
                    }}
                    onSelectEvent={handleSelectEvent}
                    step={30}
                    timeslots={2}
                />
            </div>

            {/* Clicked Event Modal / Inspection Card */}
            <AnimatePresence>
                {selectedEvent && (
                    <div className="event-modal-overlay" onClick={() => setSelectedEvent(null)}>
                        <motion.div 
                            className="event-modal-card glass-panel"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        >
                            <div className="event-modal-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span className="modal-status-badge">{selectedEvent.status}</span>
                                    <span className="modal-dept-badge">{selectedEvent.department}</span>
                                </div>
                                <button className="modal-close-btn" onClick={() => setSelectedEvent(null)}>
                                    <X size={18} />
                                </button>
                            </div>

                            <h3 className="event-modal-title">{selectedEvent.title}</h3>

                            <div className="event-modal-grid">
                                <div className="event-detail-item">
                                    <span className="detail-label"><Clock size={15} /> Scheduled Time</span>
                                    <span className="detail-value">
                                        {moment(selectedEvent.start).format('ddd, MMM DD, YYYY')} <br/>
                                        <strong>{moment(selectedEvent.start).format('hh:mm A')} - {moment(selectedEvent.end).format('hh:mm A')}</strong>
                                    </span>
                                </div>

                                <div className="event-detail-item">
                                    <span className="detail-label"><Building2 size={15} /> Ward & Location</span>
                                    <span className="detail-value">{selectedEvent.ward}</span>
                                </div>

                                <div className="event-detail-item">
                                    <span className="detail-label"><CheckCircle size={15} /> Shift Category</span>
                                    <span className="detail-value" style={{ textTransform: 'capitalize' }}>
                                        {selectedEvent.type} Duty
                                    </span>
                                </div>
                            </div>

                            <div className="event-modal-actions">
                                <button className="modal-action-btn primary" onClick={() => setSelectedEvent(null)}>
                                    Acknowledge Shift
                                </button>
                                <button className="modal-action-btn secondary" onClick={() => setSelectedEvent(null)}>
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

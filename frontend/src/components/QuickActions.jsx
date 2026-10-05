import React from 'react';
import { CalendarPlus, FileText, Users, UploadCloud, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuickActions({ onOpenUpload }) {
    const navigate = useNavigate();
    
    const actions = [
        {
            title: 'Schedule Appointment',
            subtitle: 'Book physician slot',
            icon: <CalendarPlus size={18} />,
            path: '/app/appointments'
        },
        {
            title: 'Review Leave Requests',
            subtitle: 'Authorize absence',
            icon: <FileText size={18} />,
            path: '/app/leave'
        },
        {
            title: 'Manage Duty Roster',
            subtitle: 'Shift allocations',
            icon: <Users size={18} />,
            path: '/app/roster'
        },
        {
            title: 'Upload Document',
            subtitle: 'Clinical credential / log',
            icon: <UploadCloud size={18} />,
            path: 'UPLOAD'
        }
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', width: '100%' }}>
            {actions.map((action, idx) => (
                <button 
                    key={idx}
                    onClick={() => {
                        if (action.path === 'UPLOAD') {
                            onOpenUpload && onOpenUpload();
                        } else if (action.path !== '#') {
                            navigate(action.path);
                        }
                    }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.85rem 1rem',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.15s ease, background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-strong)';
                        e.currentTarget.style.backgroundColor = 'var(--color-surface-subtle)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(5, 31, 32, 0.05)',
                            color: 'var(--color-1)'
                        }}>
                            {action.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-1)' }}>
                                {action.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                                {action.subtitle}
                            </div>
                        </div>
                    </div>
                    <ArrowUpRight size={15} color="var(--text-muted)" />
                </button>
            ))}
        </div>
    );
}

import React from 'react';
import { FileText, Users, CalendarPlus, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuickActions({ onOpenUpload }) {
    const navigate = useNavigate();
    
    const actions = [
        {
            title: 'Schedule Surgery',
            icon: <CalendarPlus size={24} />,
            color: 'var(--color-1)',
            bg: 'var(--color-6)',
            path: '/app/appointments'
        },
        {
            title: 'Approve Leaves',
            icon: <FileText size={24} />,
            color: 'var(--color-6)',
            bg: 'var(--color-4)',
            path: '/app/leave'
        },
        {
            title: 'Manage Duty Roster',
            icon: <Users size={24} />,
            color: 'var(--color-1)',
            bg: 'var(--color-5)',
            path: '/app/roster'
        },
        {
            title: 'Upload Document',
            icon: <FileText size={24} />,
            color: 'var(--color-6)',
            bg: 'var(--color-2)',
            path: 'UPLOAD'
        }
    ];

    return (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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
                        flex: '1 1 calc(25% - 1rem)',
                        minWidth: '150px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        padding: '1.5rem',
                        backgroundColor: action.bg,
                        color: action.color,
                        border: 'none',
                        borderRadius: '12px',
                        cursor: action.path !== '#' ? 'pointer' : 'default',
                        boxShadow: '0 4px 12px rgba(5,31,32,0.15)',
                        transition: 'transform 0.2s, boxShadow 0.2s',
                        fontFamily: 'inherit',
                        fontWeight: '600'
                    }}
                    onMouseOver={(e) => { if(action.path !== '#') e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseOut={(e) => { if(action.path !== '#') e.currentTarget.style.transform = 'translateY(0)' }}
                >
                    {action.icon}
                    <span>{action.title}</span>
                </button>
            ))}
        </div>
    );
}

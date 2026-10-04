window.NavigationRail = function NavigationRail({ currentPath, onNavigate }) {
    const navItems = [
        { path: '/admin/dashboard', icon: 'grid', title: 'Overview' },
        { path: '/admin/schedule', icon: 'calendar', title: 'Schedule' },
        { path: '/admin/doctors', icon: 'users', title: 'Doctors' },
        { path: '/admin/leave', icon: 'clock', title: 'Leave' }
    ];

    // No need for feather.replace() anymore

    return (
        <aside className="nav-rail">
            <div className="nav-logo">
                <window.Icon name="activity" />
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {navItems.map(item => (
                    <button 
                        key={item.path}
                        className={`nav-item ${currentPath === item.path ? 'active' : ''}`}
                        onClick={() => onNavigate(item.path)}
                        title={item.title}
                    >
                        <window.Icon name={item.icon} />
                    </button>
                ))}
            </div>

            <button className="nav-item" onClick={() => window.location.reload()} title="Logout" style={{ marginTop: 'auto' }}>
                <window.Icon name="log-out" />
            </button>
        </aside>
    );
};

window.App = function App() {
    const [user, setUser] = React.useState(null);
    const [path, setPath] = React.useState('');

    // App root

    const handleLogin = (role) => {
        let u = null;
        if (role === 'admin') u = { id: 'admin', role: 'admin', name: 'Admin' };
        if (role === 'doctor') u = { id: 'doc1', role: 'doctor', name: window.StoreUtils.getDoctor('doc1').name };
        if (role === 'patient') u = { id: 'p_guest', role: 'patient', name: 'Guest' };
        
        window.MedoraData.currentUser = u;
        setUser(u);
        
        if (role === 'admin') setPath('/admin/schedule');
        if (role === 'doctor') setPath('/doctor/dashboard');
        if (role === 'patient') setPath('/patient/booking');
    };

    if (!user) {
        return <window.Login onLogin={handleLogin} />;
    }

    let PageComponent = null;
    if (path === '/admin/dashboard') PageComponent = window.AdminDashboard;
    else if (path === '/admin/schedule') PageComponent = window.ScheduleViewer;
    else if (path === '/doctor/dashboard') PageComponent = window.DoctorDashboard;
    else if (path === '/patient/booking') PageComponent = window.PatientBooking;
    else PageComponent = () => <div>Page not found or Under Construction.</div>;

    return (
        <div className="app-layout">
            <window.NavigationRail currentPath={path} onNavigate={setPath} />
            <div className="main-view">
                <div className="page-container">
                    <PageComponent />
                </div>
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<window.App />);

import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, CalendarDays, Users, Database, ClipboardList, 
    BarChart3, History, FileText, LogOut, Menu, X, ShieldCheck, 
    Clock, Activity, ChevronRight, CheckCircle2 
} from 'lucide-react';
import './Layout.css';
import { useState } from 'react';

const getPageTitle = (pathname) => {
    if (pathname.includes('/overview')) return 'Overview Dashboard';
    if (pathname.includes('/roster')) return 'Duty Roster';
    if (pathname.includes('/appointments')) return 'Appointments';
    if (pathname.includes('/data-center')) return 'Data Center';
    if (pathname.includes('/leave-application')) return 'Leave Application';
    if (pathname.includes('/leave')) return 'Leave Management';
    if (pathname.includes('/emergency-allocation')) return 'Emergency Slot Allocation';
    if (pathname.includes('/fairness-history')) return 'Fairness History';
    if (pathname.includes('/fairness-analytics')) return 'Fairness Analytics';
    return 'Hospital Operations';
};

export default function Layout() {
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const pageTitle = getPageTitle(location.pathname);
    const todayFormatted = new Date().toLocaleDateString('en-US', { 
        weekday: 'short', month: 'short', day: 'numeric' 
    });

    return (
        <div className="app-layout">
            {mobileMenuOpen && <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)}></div>}
            
            {/* Stationary Fixed Sidebar Navigation */}
            <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h2 className="brand-logo">MEDORA</h2>
                            <p className="sidebar-subtitle">Hospital Operations</p>
                        </div>
                        {mobileMenuOpen && (
                            <button className="close-menu-btn" onClick={() => setMobileMenuOpen(false)}>
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="nav-links" onClick={() => setMobileMenuOpen(false)}>
                    {/* CORE OPERATIONS */}
                    <div className="nav-group-label">OPERATIONS</div>
                    
                    <NavLink to="/app/overview" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                        <LayoutDashboard size={18} />
                        <span>Overview</span>
                    </NavLink>
                    
                    {(user?.role === 'ADMIN' || user?.role === 'DOCTOR') && (
                        <NavLink to="/app/roster" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                            <CalendarDays size={18} />
                            <span>Duty Roster</span>
                        </NavLink>
                    )}
                    
                    <NavLink to="/app/appointments" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                        <Users size={18} />
                        <span>Appointments</span>
                    </NavLink>
                    
                    {/* ADMINISTRATIVE DATA & LEAVES */}
                    {user?.role === 'ADMIN' && (
                        <>
                            <div className="nav-group-label">ADMINISTRATION</div>
                            
                            <NavLink to="/app/data-center" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                                <Database size={18} />
                                <span>Data Center</span>
                            </NavLink>
                            
                            <NavLink to="/app/leave" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                                <ClipboardList size={18} />
                                <span>Leave Management</span>
                            </NavLink>

                            <div className="nav-group-label">FAIR ALLOCATION</div>

                            <NavLink to="/app/fairness-analytics" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                                <BarChart3 size={18} />
                                <span>Fairness Analytics</span>
                            </NavLink>

                            <NavLink to="/app/fairness-history" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                                <History size={18} />
                                <span>Fairness History</span>
                            </NavLink>
                        </>
                    )}
                    
                    {/* DOCTOR SPECIFIC */}
                    {user?.role === 'DOCTOR' && (
                        <>
                            <div className="nav-group-label">CLINICAL PORTAL</div>
                            <NavLink to="/app/leave-application" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                                <FileText size={18} />
                                <span>Leave Application</span>
                            </NavLink>
                        </>
                    )}
                </div>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
                        <div className="details">
                            <span className="name">{user?.name || 'Authorized User'}</span>
                            <span className="role">{user?.role || 'Staff'}</span>
                        </div>
                    </div>
                    <button onClick={logout} className="logout-btn">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area with Top Navbar */}
            <main className="main-content">
                {/* Complete Top Navbar */}
                <header className="top-navbar">
                    <div className="top-navbar-left">
                        <button onClick={() => setMobileMenuOpen(true)} className="mobile-toggle-btn" aria-label="Toggle menu">
                            <Menu size={20} />
                        </button>
                        <div className="breadcrumb-trail">
                            <span className="breadcrumb-root">MEDORA</span>
                            <span className="breadcrumb-sep">/</span>
                            <span className="breadcrumb-current">{pageTitle}</span>
                        </div>
                    </div>

                    <div className="top-navbar-right">
                        <div className="status-indicator-clean">
                            <span className="status-dot-active" />
                            <span>FAIRNESS ENGINE ACTIVE</span>
                        </div>

                        <div className="navbar-rule" />

                        <div className="navbar-shift-text">
                            <Clock size={13} strokeWidth={1.75} />
                            <span>{todayFormatted} • Shift: 08:00 - 16:00</span>
                        </div>

                        <div className="navbar-rule" />

                        <div className="navbar-role-text">
                            <span>{user?.role || 'ADMIN'}</span>
                        </div>
                    </div>
                </header>

                <div className="page-content">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            style={{ width: '100%', minWidth: 0 }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}



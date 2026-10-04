import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminCalendarOverview from './pages/AdminCalendarOverview';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import Roster from './pages/Roster';
import Appointments from './pages/Appointments';
import LeaveManagement from './pages/LeaveManagement';
import LeaveApplication from './pages/LeaveApplication';
import EmergencyAllocation from './pages/EmergencyAllocation';
import FairnessHistory from './pages/FairnessHistory';
import FairnessAnalytics from './pages/FairnessAnalytics';
import DataCenter from './pages/DataCenter';
import Layout from './components/Layout';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/app/overview" replace />;
    }
    return children;
};

const RoleBasedOverview = () => {
    const { user } = useAuth();
    if (!user) return null;
    
    // In Medora, ADMIN sees the original Dashboard + Calendar
    // DOCTOR sees DoctorDashboard
    // PATIENT sees PatientDashboard
    if (user.role === 'ADMIN') {
        return (
            <>
                <Dashboard />
                <AdminCalendarOverview />
            </>
        );
    } else if (user.role === 'DOCTOR') {
        return <DoctorDashboard />;
    } else {
        return <PatientDashboard />;
    }
};

const AnimatedRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/app" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                    <Route path="overview" element={<RoleBasedOverview />} />
                    
                    <Route path="roster" element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR']}>
                            <Roster />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="appointments" element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'PATIENT']}>
                            <Appointments />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="leave" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <LeaveManagement />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="leave-application" element={
                        <ProtectedRoute allowedRoles={['DOCTOR']}>
                            <LeaveApplication />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="emergency-allocation/:leaveId" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <EmergencyAllocation />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="fairness-history" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <FairnessHistory />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="fairness-analytics" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <FairnessAnalytics />
                        </ProtectedRoute>
                    } />

                    <Route path="data-center" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <DataCenter />
                        </ProtectedRoute>
                    } />
                </Route>
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AnimatedRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}

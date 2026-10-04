// Global Context and State Management for Prototype
window.Icon = function Icon({ name, style, className }) {
    if (!window.feather || !window.feather.icons[name]) return null;
    const svgStr = window.feather.icons[name].toSvg();
    return <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }} dangerouslySetInnerHTML={{ __html: svgStr }} />;
};

window.MedoraData = {
    currentUser: null,
    departments: [],
    doctors: [],
    appointments: [],
    leaves: [],
    
    // Analytics
    departmentCoverage: [],
    dutyDistribution: [],
    weeklyTrends: []
};

window.StoreUtils = {
    getDoctor(id) { return window.MedoraData.doctors.find(d => d.id === id); },
    getDept(id) { return window.MedoraData.departments.find(d => d.id === id); },
    getDocsByDept(deptId) { return window.MedoraData.doctors.filter(d => d.departmentId === deptId); },
    
    // Listeners for React state updates
    listeners: [],
    subscribe(listener) { 
        this.listeners.push(listener); 
        return () => { this.listeners = this.listeners.filter(l => l !== listener); };
    },
    notify() { this.listeners.forEach(l => l()); },

    addLeave(doctorId, date) {
        window.MedoraData.leaves.push({ doctorId, date });
        this.notify();
    },
    
    bookAppointment(appt) {
        window.MedoraData.appointments.push(appt);
        this.notify();
    },

    async initializeData() {
        try {
            const [depts, docs, appts, leaves, cov, dist, trends] = await Promise.all([
                window.MedoraAPI.fetchDepartments(),
                window.MedoraAPI.fetchDoctors(),
                window.MedoraAPI.fetchAppointments(),
                window.MedoraAPI.fetchLeaves(),
                window.MedoraAPI.fetchDepartmentCoverage(),
                window.MedoraAPI.fetchDutyDistribution(),
                window.MedoraAPI.fetchWeeklyTrends()
            ]);
            window.MedoraData.departments = depts;
            window.MedoraData.doctors = docs;
            window.MedoraData.appointments = appts;
            window.MedoraData.leaves = leaves;
            window.MedoraData.departmentCoverage = cov;
            window.MedoraData.dutyDistribution = dist;
            window.MedoraData.weeklyTrends = trends;
            this.notify();
        } catch (e) {
            console.error("Failed to load API data. Make sure Spring Boot backend is running on :8080", e);
        }
    }
};

// Initialize data from API on load
window.StoreUtils.initializeData();

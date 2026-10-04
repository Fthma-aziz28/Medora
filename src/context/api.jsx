const API_BASE = 'http://localhost:8080/api';

window.MedoraAPI = {
    async fetchDepartments() {
        const res = await fetch(`${API_BASE}/departments`);
        return res.json();
    },
    async fetchDoctors() {
        const res = await fetch(`${API_BASE}/doctors`);
        return res.json();
    },
    async fetchAppointments() {
        const res = await fetch(`${API_BASE}/appointments`);
        return res.json();
    },
    async fetchLeaves() {
        const res = await fetch(`${API_BASE}/leaves`);
        return res.json();
    },
    async fetchDepartmentCoverage() {
        const res = await fetch(`${API_BASE}/analytics/department-coverage`);
        return res.json();
    },
    async fetchDutyDistribution() {
        const res = await fetch(`${API_BASE}/analytics/duty-distribution`);
        return res.json();
    },
    async fetchWeeklyTrends() {
        const res = await fetch(`${API_BASE}/analytics/weekly-trends`);
        return res.json();
    }
};

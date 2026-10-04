window.AdminDashboard = function AdminDashboard() {
    const { useState, useEffect } = window.React;
    const [data, setData] = useState({
        coverage: [],
        distribution: [],
        trends: []
    });

    useEffect(() => {
        setData({
            coverage: window.MedoraData.departmentCoverage || [],
            distribution: window.MedoraData.dutyDistribution || [],
            trends: window.MedoraData.weeklyTrends || []
        });

        const unsubscribe = window.StoreUtils.subscribe(() => {
            setData({
                coverage: window.MedoraData.departmentCoverage || [],
                distribution: window.MedoraData.dutyDistribution || [],
                trends: window.MedoraData.weeklyTrends || []
            });
        });
        return unsubscribe;
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <div>
                <h1 style={{ fontWeight: 400 }}>Operational Analytics</h1>
                <p className="text-subtitle" style={{ color: 'var(--text-primary)' }}>Command Center</p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '1rem' }}>
                    <div className="composed-metric">
                        <span className="num" style={{ fontSize: '2rem', fontWeight: 600 }}>{window.MedoraData.doctors?.length || 0}</span>
                        <span className="desc">Doctors</span>
                    </div>
                    <div className="composed-metric">
                        <span className="num" style={{ fontSize: '2rem', fontWeight: 600 }}>{window.MedoraData.departments?.length || 0}</span>
                        <span className="desc">Departments</span>
                    </div>
                    <div className="composed-metric">
                        <span className="num" style={{ fontSize: '2rem', fontWeight: 600 }}>{window.MedoraData.appointments?.length || 0}</span>
                        <span className="desc">Today's Slots</span>
                    </div>
                    <div className="composed-metric">
                        <span className="num" style={{ fontSize: '2rem', fontWeight: 600 }}>{window.MedoraData.leaves?.length || 0}</span>
                        <span className="desc">On Leave</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
                <div className="chart-container">
                    <h3 style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.5rem', fontWeight: 500 }}>
                        Department Coverage
                    </h3>
                    <window.DepartmentCoverageChart data={data.coverage} />
                </div>
                
                <div className="chart-container">
                    <h3 style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.5rem', fontWeight: 500 }}>
                        Duty Distribution
                    </h3>
                    <window.DutyDistributionDonut data={data.distribution} />
                </div>
            </div>
            
            <div className="chart-container">
                <h3 style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.5rem', fontWeight: 500 }}>
                    Weekly Duty Trends
                </h3>
                <window.WeeklyDutyTrends data={data.trends} />
            </div>
        </div>
    );
};

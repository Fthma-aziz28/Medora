window.DepartmentCoverageChart = function DepartmentCoverageChart({ data }) {
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = window.Recharts;
    
    if (!data || data.length === 0) return <div>No data available</div>;

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{fill: '#f4f1e9'}} />
                    <Legend />
                    <Bar dataKey="required" fill="var(--chart-deep-ink)" name="Required Hrs" barSize={12} radius={[0, 4, 4, 0]} />
                    <Bar dataKey="assigned" fill="var(--chart-muted-sage)" name="Assigned Hrs" barSize={12} radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

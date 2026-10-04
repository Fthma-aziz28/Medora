window.WeeklyDutyTrends = function WeeklyDutyTrends({ data }) {
    const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = window.Recharts;
    
    if (!data || data.length === 0) return <div>No data available</div>;

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Scheduled" stroke="var(--chart-muted-sage)" strokeWidth={2} dot={{r: 4}} activeDot={{r: 6}} />
                    <Line type="monotone" dataKey="Completed" stroke="var(--chart-deep-ink)" strokeWidth={2} dot={{r: 4}} />
                    <Line type="monotone" dataKey="Unfilled" stroke="var(--chart-muted-ochre)" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

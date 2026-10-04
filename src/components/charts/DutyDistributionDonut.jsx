window.DutyDistributionDonut = function DutyDistributionDonut({ data }) {
    const { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } = window.Recharts;
    
    if (!data || data.length === 0) return <div>No data available</div>;

    const COLORS = {
        'Scheduled': 'var(--chart-muted-sage)',
        'Completed': 'var(--chart-deep-ink)',
        'Unfilled': 'var(--chart-muted-ochre)',
        'Cancelled': 'var(--chart-neutral-grey)'
    };

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie 
                        data={data} 
                        innerRadius={60} 
                        outerRadius={100} 
                        paddingAngle={2} 
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name] || 'var(--chart-deep-ink)'} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

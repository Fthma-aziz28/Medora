import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { API_BASE_URL } from '../../apiConfig';

// Light colors from the Medora green & beige color scheme
const LIGHT_COLORS = ['#8EB69B', '#B2D8C3', '#DAF1DE', '#D4C5B9', '#A3C9A8', '#E5DFD3'];

const DEFAULT_COVERAGE = [
    { name: 'Cardiology', assigned: 12 },
    { name: 'Emergency', assigned: 15 },
    { name: 'Pediatrics', assigned: 8 },
    { name: 'Neurology', assigned: 6 },
    { name: 'General Surgery', assigned: 10 }
];

export default function CoverageChart() {
    const [data, setData] = useState(DEFAULT_COVERAGE);
    
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/analytics/department-coverage`)
            .then(res => {
                if (res.ok) return res.json();
                throw new Error("Failed to fetch department coverage");
            })
            .then(d => {
                if (Array.isArray(d) && d.length > 0) {
                    setData(d);
                }
            })
            .catch(e => {
                console.warn("Using fallback department coverage data:", e);
            });
    }, []);

    return (
        <div style={{ width: '100%', height: 300, minWidth: 0, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="assigned"
                        nameKey="name"
                        stroke="rgba(255,255,255,0.6)"
                        strokeWidth={2}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={LIGHT_COLORS[index % LIGHT_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ 
                            borderRadius: '12px', 
                            background: '#051F20',
                            border: '1px solid rgba(255,255,255,0.1)', 
                            boxShadow: '0 8px 20px rgba(5,31,32,0.3)',
                            color: '#DAF1DE',
                            fontWeight: '600'
                        }} 
                        itemStyle={{ color: '#DAF1DE' }}
                    />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value) => <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.85rem' }}>{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}


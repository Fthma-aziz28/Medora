import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const data = [
    { month: 'Jan', appointments: 110 },
    { month: 'Feb', appointments: 135 },
    { month: 'Mar', appointments: 105 },
    { month: 'Apr', appointments: 160 },
    { month: 'May', appointments: 210 },
    { month: 'Jun', appointments: 185 },
    { month: 'Jul', appointments: 230 },
    { month: 'Aug', appointments: 200 }
];

export default function WaveChart() {
    return (
        <div style={{ width: '100%', height: 300, minWidth: 0, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#051F20" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8EB69B" stopOpacity={0.1}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(5,31,32,0.08)" />
                    <XAxis dataKey="month" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                    <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                    <Tooltip 
                        contentStyle={{ 
                            borderRadius: '12px', 
                            background: '#051F20', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            boxShadow: '0 8px 20px rgba(5,31,32,0.3)',
                            color: '#DAF1DE',
                            fontWeight: '600'
                        }} 
                        itemStyle={{ color: '#8EB69B' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="appointments" 
                        stroke="#051F20" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorWave)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}


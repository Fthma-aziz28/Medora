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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
            {/* Analytical Metric Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Monthly Encounters
                    </span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-1)', fontFamily: 'var(--font-heading)', marginTop: '0.15rem' }}>
                        200 <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-4)', fontFamily: 'var(--font-ui)' }}>+14.2% vs baseline</span>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Period
                    </span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-1)', marginTop: '0.15rem' }}>
                        Jan – Aug 2026
                    </div>
                </div>
            </div>

            {/* Line / Area Chart */}
            <div style={{ width: '100%', height: 210, minWidth: 0, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="editorialWave" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#051F20" stopOpacity={0.12}/>
                                <stop offset="95%" stopColor="#051F20" stopOpacity={0.0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="2 2" stroke="rgba(5, 31, 32, 0.05)" vertical={false} />
                        <XAxis 
                            dataKey="month" 
                            stroke="transparent" 
                            tick={{ fontSize: 11, fill: 'var(--text-muted)' }} 
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis 
                            stroke="transparent" 
                            tick={{ fontSize: 11, fill: 'var(--text-muted)' }} 
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                borderRadius: '4px', 
                                background: '#051F20', 
                                border: '1px solid rgba(255,255,255,0.12)', 
                                boxShadow: '0 4px 12px rgba(5,31,32,0.2)',
                                color: '#F5F5ED',
                                fontSize: '0.8rem',
                                padding: '0.4rem 0.75rem'
                            }} 
                            itemStyle={{ color: '#8EB69B' }}
                            formatter={(val) => [`${val} consultations`, 'Volume']}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="appointments" 
                            stroke="#051F20" 
                            strokeWidth={2} 
                            fillOpacity={1} 
                            fill="url(#editorialWave)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

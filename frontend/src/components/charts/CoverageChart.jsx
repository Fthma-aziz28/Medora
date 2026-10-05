import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { API_BASE_URL } from '../../apiConfig';

const CLINICAL_PALETTE = [
    '#051F20', // Deep Forest Teal
    '#235347', // Clinical Emerald
    '#8EB69B', // Muted Sage
    '#B2D8C3', // Pale Mint
    '#5C7772', // Slate Spruce
    '#D4C5B9'  // Warm Clay
];

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

    const totalAssigned = data.reduce((sum, item) => sum + (item.assigned || 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
            {/* Top Operational Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Active Allocation
                    </span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-1)', fontFamily: 'var(--font-heading)', marginTop: '0.15rem' }}>
                        {totalAssigned} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>Physicians Deployed</span>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Departments
                    </span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-1)', marginTop: '0.15rem' }}>
                        {data.length} Units
                    </div>
                </div>
            </div>

            {/* Split Visual Presentation: Concentric Clinical Donut & Department Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: '1.5rem', alignItems: 'center' }}>
                {/* Minimal High-Precision Donut */}
                <div style={{ width: '100%', height: 210, position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={64}
                                outerRadius={84}
                                paddingAngle={2}
                                dataKey="assigned"
                                nameKey="name"
                                stroke="#FFFFFF"
                                strokeWidth={2}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CLINICAL_PALETTE[index % CLINICAL_PALETTE.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '4px',
                                    background: '#051F20',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    boxShadow: '0 4px 12px rgba(5,31,32,0.2)',
                                    color: '#F5F5ED',
                                    fontSize: '0.8rem',
                                    padding: '0.4rem 0.75rem'
                                }}
                                itemStyle={{ color: '#DAF1DE' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Metric */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        pointerEvents: 'none'
                    }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-1)', lineHeight: 1.1 }}>
                            84%
                        </div>
                        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            Coverage
                        </div>
                    </div>
                </div>

                {/* Department Distribution Bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {data.map((dept, idx) => {
                        const pct = totalAssigned > 0 ? Math.round((dept.assigned / totalAssigned) * 100) : 0;
                        const color = CLINICAL_PALETTE[idx % CLINICAL_PALETTE.length];
                        return (
                            <div key={dept.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, display: 'inline-block' }} />
                                        {dept.name}
                                    </span>
                                    <span style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                                        <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{dept.assigned}</strong> ({pct}%)
                                    </span>
                                </div>
                                <div style={{ width: '100%', height: 4, background: 'rgba(5, 31, 32, 0.06)', borderRadius: 2, overflow: 'hidden' }}>
                                    <div
                                        style={{
                                            width: `${pct}%`,
                                            height: '100%',
                                            backgroundColor: color,
                                            borderRadius: 2,
                                            transition: 'width 0.4s ease'
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

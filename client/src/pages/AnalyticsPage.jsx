import { useState, useEffect } from 'react';
import api from '../services/api';
import { HiOutlineChartBar } from 'react-icons/hi';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

/* ── helpers ─────────────────────────────────────────────── */
const fillMissingDays = (data) => {
    const result = [];
    for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const found = data.find(r => r.date === dateStr);
        result.push({ date: dateStr.slice(5), count: found ? found.count : 0 });
    }
    return result;
};

const STATUS_COLORS = { assigned: '#f59e0b', in_progress: '#3b82f6', completed: '#22c55e' };
const scoreColor = (s) => s >= 70 ? 'var(--success)' : s >= 40 ? 'var(--warning)' : 'var(--danger)';

/* ── tooltip style (theme-aware) ─────────────────────────── */
const tipStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 8,
    color: 'var(--text-primary)',
    fontSize: 12
};

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/analytics')
            .then(res => setData(res.data))
            .catch(err => console.error('Analytics load failed:', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px', width: 28, height: 28 }} />
                    <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>Loading analytics...</p>
                </div>
            </div>
        );
    }

    const { trend = [], departments = [], statusDist = [], skills = [], performers = [] } = data || {};

    /* derived data */
    const trendData = fillMissingDays(trend);
    const deptData = departments.map(d => ({
        department: d.department,
        score: d.total_tasks > 0 ? Math.round((d.completed_tasks / d.total_tasks) * 100) : 0
    }));
    const pieData = statusDist.map(s => ({
        name: s.status.replace('_', ' '),
        value: s.count,
        color: STATUS_COLORS[s.status] || 'var(--accent)'
    }));

    return (
        <div className="animate-in">
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <HiOutlineChartBar size={24} /> Analytics
                </h1>
                <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>Real-time workforce intelligence — last 14 days</p>
            </div>

            {/* Row 1: Line Chart + Bar Chart */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {/* Task Completion Trend */}
                <div className="card glass-card" style={{ padding: 22 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                        <div style={{ width: 3, height: 20, borderRadius: 2, background: 'linear-gradient(to bottom, var(--accent), #6366f1)' }} />
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Task Completion Trend</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                            <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                            <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} allowDecimals={false} />
                            <Tooltip contentStyle={tipStyle} />
                            <Line type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={2}
                                dot={{ fill: 'var(--accent)', r: 3 }} activeDot={{ r: 5 }} name="Completed" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Department Productivity */}
                <div className="card glass-card" style={{ padding: 22 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                        <div style={{ width: 3, height: 20, borderRadius: 2, background: 'linear-gradient(to bottom, #22c55e, #14b8a6)' }} />
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Department Productivity</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={deptData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                            <XAxis dataKey="department" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                            <YAxis stroke="var(--text-muted)" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                            <Tooltip formatter={(v) => [`${v}%`, 'Completion Rate']} contentStyle={tipStyle} />
                            <Bar dataKey="score" fill="#22c55e" radius={[4, 4, 0, 0]} name="Completion %" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Row 2: Donut + Skills + Leaderboard */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {/* Task Status Distribution */}
                <div className="card" style={{ padding: 22 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 18 }}>Task Status</h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                                dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                labelLine={{ stroke: 'var(--text-muted)' }}>
                                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                            <Tooltip contentStyle={tipStyle} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 8 }}>
                        {pieData.map(p => (
                            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                                {p.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Skills */}
                <div className="card" style={{ padding: 22 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 18 }}>Skill Coverage</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={skills} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                            <XAxis type="number" stroke="var(--text-muted)" allowDecimals={false} tick={{ fontSize: 11 }} />
                            <YAxis type="category" dataKey="skill" stroke="var(--text-muted)" width={90} tick={{ fontSize: 11 }} />
                            <Tooltip contentStyle={tipStyle} />
                            <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Employees" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Employee Leaderboard */}
                <div className="card" style={{ padding: 22 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 18 }}>Performance Leaderboard</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 270, overflowY: 'auto' }}>
                        {performers.map((emp, i) => {
                            const pct = emp.total > 0 ? Math.round((emp.completed / emp.total) * 100) : 0;
                            return (
                                <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', width: 24, textAlign: 'center' }}>#{i + 1}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{emp.name}</span>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: scoreColor(pct) }}>{pct}%</span>
                                        </div>
                                        <div style={{ height: 4, background: 'var(--border-subtle)', borderRadius: 2 }}>
                                            <div style={{
                                                height: '100%', borderRadius: 2, transition: 'width 0.5s ease',
                                                width: `${pct}%`,
                                                background: pct >= 70 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444'
                                            }} />
                                        </div>
                                        <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{emp.role} · {emp.department}</span>
                                    </div>
                                </div>
                            );
                        })}
                        {performers.length === 0 && (
                            <p style={{ color: 'var(--text-faint)', fontSize: 13, textAlign: 'center', padding: 20 }}>
                                Assign tasks to see performance rankings
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Row 3: Team Performance Radar */}
            {deptData.length > 0 && (
                <div className="card glass-card" style={{ padding: 22, marginTop: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                        <div style={{ width: 3, height: 20, borderRadius: 2, background: 'linear-gradient(to bottom, #6366f1, #ec4899)' }} />
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Team Performance Overview</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'center' }}>
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={deptData.map(d => ({ ...d, fullMark: 100 }))}>
                                <PolarGrid stroke="var(--border-default)" />
                                <PolarAngleAxis dataKey="department" stroke="var(--text-dim)" tick={{ fontSize: 11 }} />
                                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="var(--text-dim)" tick={{ fontSize: 10 }} />
                                <Radar name="Completion Rate" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
                            </RadarChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Department Metrics</h4>
                            {deptData.map((dept, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{dept.department}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 60, height: 4, background: 'var(--border-subtle)', borderRadius: 2 }}>
                                            <div style={{ height: '100%', borderRadius: 2, width: `${dept.score}%`, background: dept.score >= 70 ? '#22c55e' : dept.score >= 40 ? '#f59e0b' : '#ef4444' }} />
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: scoreColor(dept.score), minWidth: 32 }}>{dept.score}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

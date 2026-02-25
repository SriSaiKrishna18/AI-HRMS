import { useState, useEffect } from 'react';
import api from '../services/api';
import { HiOutlineChartBar } from 'react-icons/hi';

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchStats(); }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/dashboard/stats');
            setData(res.data);
        } catch (err) { console.error('Failed to load analytics:', err); }
        finally { setLoading(false); }
    };

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

    return (
        <div className="animate-in">
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <HiOutlineChartBar size={24} /> Analytics
                </h1>
                <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>Department performance, skills, and workforce insights</p>
            </div>

            {/* Top Row: Department Performance + Top Performers */}
            <div className="stat-grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {/* Department Performance */}
                <div className="card" style={{ padding: 22 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 18 }}>Department Performance</h3>
                    {data?.departmentStats?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {data.departmentStats.map((d) => {
                                const pct = d.totalTasks > 0 ? Math.round((d.completedTasks / d.totalTasks) * 100) : 0;
                                return (
                                    <div key={d.department}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{d.department}</span>
                                            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{d.employees} members · {d.completedTasks}/{d.totalTasks} tasks</span>
                                        </div>
                                        <div style={{ height: 6, background: 'var(--border-subtle)', borderRadius: 3 }}>
                                            <div style={{
                                                height: '100%', borderRadius: 3,
                                                width: `${pct}%`,
                                                background: pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--accent)',
                                                transition: 'width 0.5s ease'
                                            }} />
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{pct}% completion</div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>No department data.</p>
                    )}
                </div>

                {/* Top Performers */}
                <div className="card" style={{ padding: 22 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 18 }}>Top Performers</h3>
                    {data?.topPerformers?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {data.topPerformers.map((p, i) => {
                                const pct = p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0;
                                return (
                                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: '50%',
                                            background: i === 0 ? '#eab308' : i === 1 ? '#a1a1aa' : i === 2 ? '#cd7f32' : 'var(--bg-hover)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 12, fontWeight: 700,
                                            color: i < 3 ? '#09090b' : 'var(--text-muted)'
                                        }}>{i + 1}</div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</p>
                                            <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{p.role} · {p.department}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)' }}>{p.completed}/{p.total}</span>
                                            <p style={{ fontSize: 10, color: 'var(--text-dim)' }}>{pct}%</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>Add employees to see rankings.</p>
                    )}
                </div>
            </div>

            {/* Bottom Row: Skill Distribution + Departments */}
            <div className="stat-grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Skill Distribution */}
                <div className="card" style={{ padding: 22 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 18 }}>Skill Distribution</h3>
                    {data?.skillDistribution?.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {data.skillDistribution.map((s) => (
                                <span key={s.skill} className="badge badge-skill" style={{
                                    padding: '5px 12px', borderRadius: 6, fontSize: 12
                                }}>
                                    {s.skill} <span style={{ opacity: 0.6 }}>×{s.count}</span>
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>No skill data.</p>
                    )}
                </div>

                {/* Departments Overview */}
                <div className="card" style={{ padding: 22 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 18 }}>Department Overview</h3>
                    {data?.departments?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {data.departments.map((d) => (
                                <div key={d.department} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 8
                                }}>
                                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{d.department}</span>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{d.count} member{d.count !== 1 ? 's' : ''}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>No departments yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

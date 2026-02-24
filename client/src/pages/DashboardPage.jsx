import { useState, useEffect } from 'react';
import api from '../services/api';
import { HiOutlineUserGroup, HiOutlineClipboardCheck, HiOutlineClipboardList, HiOutlineTrendingUp, HiOutlineLightningBolt, HiOutlineClock } from 'react-icons/hi';

export default function DashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchStats(); }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/dashboard/stats');
            setData(res.data);
        } catch (err) { console.error('Failed to load dashboard:', err); }
        finally { setLoading(false); }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px', width: 28, height: 28 }} />
                    <p style={{ color: '#52525b', fontSize: 13 }}>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const stats = data?.stats || {};
    const statCards = [
        { label: 'Total Employees', value: stats.totalEmployees || 0, icon: <HiOutlineUserGroup size={20} />, color: '#6366f1' },
        { label: 'Active', value: stats.activeEmployees || 0, icon: <HiOutlineLightningBolt size={20} />, color: '#22c55e' },
        { label: 'Tasks Assigned', value: stats.assignedTasks || 0, icon: <HiOutlineClipboardList size={20} />, color: '#eab308' },
        { label: 'Completed', value: stats.completedTasks || 0, icon: <HiOutlineClipboardCheck size={20} />, color: '#22c55e' },
        { label: 'In Progress', value: stats.inProgressTasks || 0, icon: <HiOutlineClock size={20} />, color: '#3b82f6' },
        { label: 'Productivity', value: `${stats.productivityRate || 0}%`, icon: <HiOutlineTrendingUp size={20} />, color: stats.productivityRate >= 70 ? '#22c55e' : stats.productivityRate >= 40 ? '#eab308' : '#ef4444' },
    ];

    return (
        <div className="animate-in">
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fafafa', letterSpacing: '-0.02em' }}>Dashboard</h1>
                <p style={{ color: '#52525b', fontSize: 13, marginTop: 4 }}>Organization overview & workforce analytics</p>
            </div>

            {/* Stats Grid */}
            <div className="stat-grid-responsive" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
                marginBottom: 28
            }}>
                {statCards.map((card, i) => (
                    <div key={i} className="card card-hover" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 8,
                                background: '#27272a',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: card.color
                            }}>
                                {card.icon}
                            </div>
                        </div>
                        <p style={{ fontSize: 28, fontWeight: 700, color: '#fafafa', letterSpacing: '-0.02em' }}>{card.value}</p>
                        <p style={{ fontSize: 12, color: '#52525b', marginTop: 4 }}>{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Bottom Row */}
            <div className="stat-grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Recent Activity */}
                <div className="card" style={{ padding: 22 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fafafa', marginBottom: 18 }}>Recent Activity</h3>
                    {data?.recentTasks?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {data.recentTasks.map(task => (
                                <div key={task.id} style={{
                                    padding: '12px 14px',
                                    background: '#0f0f11',
                                    borderRadius: 8,
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                }}>
                                    <div>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>{task.title}</p>
                                        <p style={{ fontSize: 11, color: '#52525b', marginTop: 2 }}>{task.employee_name}</p>
                                    </div>
                                    <span className={`badge status-${task.status}`}>{task.status.replace('_', ' ')}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#3f3f46', fontSize: 13 }}>No tasks yet. Assign tasks to get started.</p>
                    )}
                </div>

                {/* Right column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Top Performers */}
                    <div className="card" style={{ padding: 22 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fafafa', marginBottom: 18 }}>Top Performers</h3>
                        {data?.topPerformers?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {data.topPerformers.map((p, i) => (
                                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{
                                            width: 24, height: 24, borderRadius: '50%',
                                            background: i === 0 ? '#eab308' : '#27272a',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 11, fontWeight: 700,
                                            color: i === 0 ? '#09090b' : '#71717a'
                                        }}>{i + 1}</div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>{p.name}</p>
                                        </div>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#22c55e' }}>{p.completed}/{p.total}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#3f3f46', fontSize: 13 }}>Add employees to see rankings.</p>
                        )}
                    </div>

                    {/* Departments */}
                    <div className="card" style={{ padding: 22 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fafafa', marginBottom: 18 }}>Departments</h3>
                        {data?.departments?.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {data.departments.map(d => (
                                    <span key={d.department} className="badge badge-skill">
                                        {d.department} · {d.count}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#3f3f46', fontSize: 13 }}>No departments yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import api from '../services/api';
import { HiOutlineUserGroup, HiOutlineClipboardCheck, HiOutlineClipboardList, HiOutlineTrendingUp, HiOutlineLightningBolt, HiOutlineClock } from 'react-icons/hi';

export default function DashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/dashboard/stats');
            setData(res.data);
        } catch (err) {
            console.error('Failed to load dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="animate-pulse-glow" style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: 'linear-gradient(135deg, #6366f1, #34d399)',
                        margin: '0 auto 16px'
                    }} />
                    <p style={{ color: '#64748b', fontSize: 14 }}>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const stats = data?.stats || {};
    const statCards = [
        {
            label: 'Total Employees',
            value: stats.totalEmployees || 0,
            icon: <HiOutlineUserGroup size={22} />,
            color: '#818cf8',
            bg: 'rgba(99,102,241,0.12)'
        },
        {
            label: 'Active Employees',
            value: stats.activeEmployees || 0,
            icon: <HiOutlineLightningBolt size={22} />,
            color: '#34d399',
            bg: 'rgba(16,185,129,0.12)'
        },
        {
            label: 'Tasks Assigned',
            value: stats.assignedTasks || 0,
            icon: <HiOutlineClipboardList size={22} />,
            color: '#fbbf24',
            bg: 'rgba(251,191,36,0.12)'
        },
        {
            label: 'Tasks Completed',
            value: stats.completedTasks || 0,
            icon: <HiOutlineClipboardCheck size={22} />,
            color: '#34d399',
            bg: 'rgba(16,185,129,0.12)'
        },
        {
            label: 'In Progress',
            value: stats.inProgressTasks || 0,
            icon: <HiOutlineClock size={22} />,
            color: '#60a5fa',
            bg: 'rgba(59,130,246,0.12)'
        },
        {
            label: 'Productivity',
            value: `${stats.productivityRate || 0}%`,
            icon: <HiOutlineTrendingUp size={22} />,
            color: stats.productivityRate >= 70 ? '#34d399' : stats.productivityRate >= 40 ? '#fbbf24' : '#f87171',
            bg: stats.productivityRate >= 70 ? 'rgba(16,185,129,0.12)' : stats.productivityRate >= 40 ? 'rgba(251,191,36,0.12)' : 'rgba(239,68,68,0.12)'
        }
    ];

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: '#f1f5f9' }}>Dashboard</h1>
                <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Organization overview & workforce analytics</p>
            </div>

            {/* Stats Grid */}
            <div className="stat-grid-responsive" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
                marginBottom: 32
            }}>
                {statCards.map((card, i) => (
                    <div key={i} className="glass stat-card" style={{
                        padding: 24,
                        animationDelay: `${i * 0.08}s`
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div style={{
                                width: 42, height: 42, borderRadius: 10,
                                background: card.bg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: card.color
                            }}>
                                {card.icon}
                            </div>
                        </div>
                        <p style={{ fontSize: 30, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>{card.value}</p>
                        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Bottom Row */}
            <div className="stat-grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Recent Tasks */}
                <div className="glass" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Recent Activity</h3>
                    {data?.recentTasks?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {data.recentTasks.map(task => (
                                <div key={task.id} className="glass-light" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{task.title}</p>
                                        <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{task.employee_name}</p>
                                    </div>
                                    <span className={`badge status-${task.status}`}>{task.status.replace('_', ' ')}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#475569', fontSize: 14, fontStyle: 'italic' }}>No tasks yet. Assign tasks to get started.</p>
                    )}
                </div>

                {/* Top Performers & Departments */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="glass" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Top Performers</h3>
                        {data?.topPerformers?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {data.topPerformers.map((p, i) => (
                                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: '50%',
                                            background: i === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'rgba(51,65,85,0.5)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 12, fontWeight: 700, color: i === 0 ? '#1e293b' : '#94a3b8'
                                        }}>
                                            {i + 1}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{p.name}</p>
                                        </div>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#34d399' }}>{p.completed}/{p.total}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#475569', fontSize: 14, fontStyle: 'italic' }}>Add employees to see rankings.</p>
                        )}
                    </div>

                    <div className="glass" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Departments</h3>
                        {data?.departments?.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {data.departments.map(d => (
                                    <span key={d.department} className="badge badge-skill">
                                        {d.department} · {d.count}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#475569', fontSize: 14, fontStyle: 'italic' }}>No departments yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import api from '../services/api';
import { HiOutlineUserGroup, HiOutlineClipboardCheck, HiOutlineClipboardList, HiOutlineTrendingUp, HiOutlineLightningBolt, HiOutlineClock, HiOutlineExclamation, HiOutlinePuzzle } from 'react-icons/hi';

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

    // Relative time helper
    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
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

    const deptColors = ['#6366f1', '#22c55e', '#eab308', '#ef4444', '#3b82f6', '#f97316', '#8b5cf6', '#ec4899'];

    return (
        <div className="animate-in">
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fafafa', letterSpacing: '-0.02em' }}>Dashboard</h1>
                <p style={{ color: '#52525b', fontSize: 13, marginTop: 4 }}>Organization overview & workforce analytics</p>
            </div>

            {/* Overdue Alert */}
            {data?.overdueTasks?.length > 0 && (
                <div style={{
                    padding: '12px 16px', marginBottom: 16, borderRadius: 8,
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    display: 'flex', alignItems: 'center', gap: 10
                }}>
                    <HiOutlineExclamation size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#fca5a5' }}>
                        <strong>{data.overdueTasks.length} overdue task{data.overdueTasks.length > 1 ? 's' : ''}</strong>
                        {' — '}
                        {data.overdueTasks.slice(0, 3).map(t => t.title).join(', ')}
                    </span>
                </div>
            )}

            {/* Stats Grid */}
            <div className="stat-grid-responsive" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))',
                gap: 12,
                marginBottom: 24
            }}>
                {statCards.map((card, i) => (
                    <div key={i} className="card card-hover" style={{ padding: 18 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: 8,
                                background: '#27272a',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: card.color
                            }}>
                                {card.icon}
                            </div>
                        </div>
                        <p style={{ fontSize: 26, fontWeight: 700, color: '#fafafa', letterSpacing: '-0.02em' }}>{card.value}</p>
                        <p style={{ fontSize: 11, color: '#52525b', marginTop: 4 }}>{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Dept Distribution + Skill Cloud */}
            <div className="stat-grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {/* Department Performance */}
                <div className="card" style={{ padding: 22 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fafafa', marginBottom: 18 }}>Department Performance</h3>
                    {data?.departmentStats?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {data.departmentStats.map((d, i) => {
                                const pct = d.totalTasks > 0 ? Math.round((d.completedTasks / d.totalTasks) * 100) : 0;
                                return (
                                    <div key={d.department}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontSize: 12, color: '#a1a1aa' }}>{d.department}</span>
                                            <span style={{ fontSize: 11, color: '#52525b' }}>{d.employees} members · {d.completedTasks}/{d.totalTasks} tasks</span>
                                        </div>
                                        <div style={{ height: 6, background: '#1a1a1e', borderRadius: 3 }}>
                                            <div style={{
                                                height: '100%', borderRadius: 3,
                                                width: `${pct}%`,
                                                background: deptColors[i % deptColors.length],
                                                transition: 'width 0.5s ease'
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p style={{ color: '#3f3f46', fontSize: 13 }}>No department data.</p>
                    )}
                </div>

                {/* Skill Distribution */}
                <div className="card" style={{ padding: 22 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fafafa', marginBottom: 18 }}>Top Skills</h3>
                    {data?.skillDistribution?.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {data.skillDistribution.map((s, i) => (
                                <span key={s.skill} style={{
                                    padding: '4px 10px', borderRadius: 6,
                                    fontSize: 11, fontWeight: 500,
                                    background: `${deptColors[i % deptColors.length]}18`,
                                    color: deptColors[i % deptColors.length],
                                    border: `1px solid ${deptColors[i % deptColors.length]}30`
                                }}>
                                    {s.skill} <span style={{ opacity: 0.6 }}>×{s.count}</span>
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#3f3f46', fontSize: 13 }}>No skill data.</p>
                    )}
                </div>
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
                                    padding: '10px 12px',
                                    background: '#0f0f11',
                                    borderRadius: 8,
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 12, fontWeight: 600, color: '#e4e4e7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                                            <span style={{ fontSize: 11, color: '#52525b' }}>{task.employee_name}</span>
                                            <span style={{ fontSize: 11, color: '#3f3f46' }}>{timeAgo(task.created_at)}</span>
                                        </div>
                                    </div>
                                    <span className={`badge status-${task.status}`} style={{ fontSize: 10, flexShrink: 0, marginLeft: 8 }}>{task.status.replace('_', ' ')}</span>
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
                                            background: i === 0 ? '#eab308' : i === 1 ? '#a1a1aa' : i === 2 ? '#cd7f32' : '#27272a',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 11, fontWeight: 700,
                                            color: i < 3 ? '#09090b' : '#71717a'
                                        }}>{i + 1}</div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>{p.name}</p>
                                            <p style={{ fontSize: 10, color: '#52525b' }}>{p.role}</p>
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
                                {data.departments.map((d, i) => (
                                    <span key={d.department} style={{
                                        padding: '5px 12px', borderRadius: 6,
                                        fontSize: 12, fontWeight: 500,
                                        background: '#18181b',
                                        color: deptColors[i % deptColors.length],
                                        border: '1px solid #27272a'
                                    }}>
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

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HiOutlineUserGroup, HiOutlineClipboardCheck, HiOutlineClipboardList, HiOutlineTrendingUp, HiOutlineLightningBolt, HiOutlineClock, HiOutlineExclamation, HiOutlinePlus, HiOutlineChartBar } from 'react-icons/hi';

export default function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [workloadData, setWorkloadData] = useState(null);

    useEffect(() => { fetchStats(); fetchWorkload(); }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/dashboard/stats');
            setData(res.data);
        } catch (err) { console.error('Failed to load dashboard:', err); }
        finally { setLoading(false); }
    };

    const fetchWorkload = async () => {
        try {
            const res = await api.get('/ai/workload');
            setWorkloadData(res.data);
        } catch (err) { console.error('Workload load failed:', err); }
    };

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
            <div className="page-loader">
                <div className="spinner-lg" />
                <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>Loading dashboard...</p>
            </div>
        );
    }

    const stats = data?.stats || {};
    const completionRate = stats.productivityRate || 0;

    const statCards = [
        { label: 'Total Employees', value: stats.totalEmployees || 0, icon: <HiOutlineUserGroup size={20} />, color: 'var(--accent)' },
        { label: 'Active', value: stats.activeEmployees || 0, icon: <HiOutlineLightningBolt size={20} />, color: 'var(--success)' },
        { label: 'Tasks Assigned', value: stats.assignedTasks || 0, icon: <HiOutlineClipboardList size={20} />, color: 'var(--warning)' },
        { label: 'Completed', value: stats.completedTasks || 0, icon: <HiOutlineClipboardCheck size={20} />, color: 'var(--success)' },
        { label: 'In Progress', value: stats.inProgressTasks || 0, icon: <HiOutlineClock size={20} />, color: 'var(--info)' },
        { label: 'Productivity', value: `${completionRate}%`, icon: <HiOutlineTrendingUp size={20} />, color: completionRate >= 70 ? 'var(--success)' : completionRate >= 40 ? 'var(--warning)' : 'var(--danger)' },
    ];

    return (
        <div className="animate-in">
            {/* Welcome Header */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
                </h1>
                <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} — Here's your organization overview
                </p>
            </div>

            {/* Overdue Alert */}
            {data?.overdueTasks?.length > 0 && (
                <div style={{
                    padding: '12px 16px', marginBottom: 16, borderRadius: 8,
                    background: 'var(--danger-bg)', border: '1px solid var(--danger)',
                    display: 'flex', alignItems: 'center', gap: 10
                }}>
                    <HiOutlineExclamation size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--danger-text)' }}>
                        <strong>{data.overdueTasks.length} overdue task{data.overdueTasks.length > 1 ? 's' : ''}</strong>
                        {' — '}
                        {data.overdueTasks.slice(0, 3).map(t => t.title).join(', ')}
                    </span>
                </div>
            )}

            {/* Stats Grid */}
            <div className="stat-grid-responsive stagger-children" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))',
                gap: 14,
                marginBottom: 24
            }}>
                {statCards.map((card, i) => (
                    <div key={i} className="card card-hover stat-card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: 10,
                                background: `${card.color}15`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: card.color
                            }}>
                                {card.icon}
                            </div>
                            <div className="ai-label" style={{ fontSize: 9 }}>
                                <span style={{ width: 4, height: 4, borderRadius: '50%', background: card.color }} />
                                Live
                            </div>
                        </div>
                        <p className="stat-value" style={{ color: card.color }}>{card.value}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Middle Row: Completion Ring + Quick Actions */}
            <div className="stat-grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {/* Completion Ring */}
                <div className="card" style={{ padding: 22, display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
                        <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border-default)" strokeWidth="3" />
                            <circle cx="18" cy="18" r="15.5" fill="none"
                                stroke={completionRate >= 70 ? 'var(--success)' : completionRate >= 40 ? 'var(--warning)' : 'var(--danger)'}
                                strokeWidth="3" strokeLinecap="round"
                                strokeDasharray={`${completionRate * 0.974} 100`}
                                style={{ transition: 'stroke-dasharray 1s ease' }}
                            />
                        </svg>
                        <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{completionRate}%</span>
                        </div>
                    </div>
                    <div>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Task Completion</h3>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            {stats.completedTasks || 0} of {stats.totalTasks || 0} tasks completed across your organization.
                            {completionRate >= 70 ? ' Great momentum!' : completionRate >= 40 ? ' Room for improvement.' : ' Needs attention.'}
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card" style={{ padding: 22 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button className="btn-secondary" onClick={() => navigate('/employees')}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-start', width: '100%', padding: '12px 14px' }}>
                            <HiOutlinePlus size={16} style={{ color: 'var(--accent)' }} />
                            <span>Add Employee</span>
                        </button>
                        <button className="btn-secondary" onClick={() => navigate('/tasks')}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-start', width: '100%', padding: '12px 14px' }}>
                            <HiOutlineClipboardList size={16} style={{ color: 'var(--accent)' }} />
                            <span>Assign Task</span>
                        </button>
                        <button className="btn-secondary" onClick={() => navigate('/analytics')}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-start', width: '100%', padding: '12px 14px' }}>
                            <HiOutlineChartBar size={16} style={{ color: 'var(--accent)' }} />
                            <span>View Analytics</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Team Workload Overview */}
            {workloadData && (
                <div className="card" style={{ padding: 22, marginBottom: 16 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Team Workload</h3>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                        {[
                            { label: 'Available', count: workloadData.summary?.available || 0, color: '#22c55e', emoji: '🟢' },
                            { label: 'Busy', count: workloadData.summary?.busy || 0, color: '#f59e0b', emoji: '🟡' },
                            { label: 'Overloaded', count: workloadData.summary?.overloaded || 0, color: '#ef4444', emoji: '🔴' },
                        ].map(w => (
                            <div key={w.label} style={{
                                flex: 1, padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 8,
                                display: 'flex', alignItems: 'center', gap: 8
                            }}>
                                <span style={{ fontSize: 14 }}>{w.emoji}</span>
                                <div>
                                    <p style={{ fontSize: 18, fontWeight: 700, color: w.color }}>{w.count}</p>
                                    <p style={{ fontSize: 10, color: 'var(--text-dim)' }}>{w.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {(workloadData.workload || []).slice(0, 6).map(emp => (
                            <div key={emp.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '6px 10px', background: 'var(--bg-elevated)', borderRadius: 6, fontSize: 12
                            }}>
                                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{emp.name}</span>
                                <span style={{
                                    padding: '2px 8px', borderRadius: 4, fontWeight: 600, fontSize: 10,
                                    background: emp.color === 'red' ? 'rgba(239,68,68,0.12)' : emp.color === 'yellow' ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.12)',
                                    color: emp.color === 'red' ? '#ef4444' : emp.color === 'yellow' ? '#f59e0b' : '#22c55e'
                                }}>
                                    {emp.level} ({emp.active_tasks})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            <div className="card" style={{ padding: 22 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 18 }}>Recent Activity</h3>
                {data?.recentTasks?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {data.recentTasks.slice(0, 6).map(task => (
                            <div key={task.id} style={{
                                padding: '10px 12px',
                                background: 'var(--bg-elevated)',
                                borderRadius: 8,
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                                        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{task.employee_name}</span>
                                        <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{timeAgo(task.created_at)}</span>
                                    </div>
                                </div>
                                <span className={`badge status-${task.status}`} style={{ fontSize: 10, flexShrink: 0, marginLeft: 8 }}>{task.status.replace('_', ' ')}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>No tasks yet. Assign tasks to get started.</p>
                )}
            </div>
        </div>
    );
}

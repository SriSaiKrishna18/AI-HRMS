import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';

export default function EmployeeDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [payroll, setPayroll] = useState([]);
    const [productivity, setProductivity] = useState(null);
    const [skillGap, setSkillGap] = useState(null);
    const [trend, setTrend] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAll();
    }, [id]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [empRes, taskRes, payRes, prodRes, gapRes, trendRes] = await Promise.allSettled([
                api.get(`/employees/${id}`),
                api.get('/tasks'),
                api.get(`/payroll/${id}`),
                api.get(`/ai/productivity/${id}`),
                api.get(`/ai/skill-gap/${id}`),
                api.get(`/ai/trend/${id}`)
            ]);
            if (empRes.status === 'fulfilled') setEmployee(empRes.value.data);
            if (taskRes.status === 'fulfilled') {
                const all = Array.isArray(taskRes.value.data) ? taskRes.value.data : (taskRes.value.data?.tasks || []);
                setTasks(all.filter(t => t.employee_id === parseInt(id)));
            }
            if (payRes.status === 'fulfilled') setPayroll(Array.isArray(payRes.value.data) ? payRes.value.data : []);
            if (prodRes.status === 'fulfilled') setProductivity(prodRes.value.data);
            if (gapRes.status === 'fulfilled') setSkillGap(gapRes.value.data);
            if (trendRes.status === 'fulfilled') setTrend(trendRes.value.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const getRatingColor = (r) => ({ excellent: '#10b981', good: '#3b82f6', average: '#f59e0b', needs_improvement: '#ef4444' }[r] || '#6b7280');
    const getStatusColor = (s) => ({ completed: '#10b981', in_progress: '#3b82f6', assigned: '#f59e0b' }[s] || '#6b7280');
    const getTrendIcon = (t) => t === 'improving' ? '📈' : t === 'declining' ? '📉' : '➡️';

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="spinner" />
        </div>
    );

    if (!employee) return (
        <div style={{ textAlign: 'center', padding: 60 }}>
            <p style={{ fontSize: 15, color: 'var(--text-dim)' }}>Employee not found</p>
            <button onClick={() => navigate('/employees')} className="btn-primary" style={{ marginTop: 12 }}>← Back to Employees</button>
        </div>
    );

    const skills = (() => { try { return JSON.parse(employee.skills || '[]'); } catch { return []; } })();
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;

    return (
        <div>
            {/* Back Button + Header */}
            <div style={{ marginBottom: 20 }}>
                <button onClick={() => navigate('/employees')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 13, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                    ← Back to Employees
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{
                        width: 60, height: 60, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, fontWeight: 800, color: '#fff'
                    }}>
                        {employee.name.charAt(0)}
                    </div>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{employee.name}</h1>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{employee.role} • {employee.department}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>{employee.email}</p>
                    </div>
                    {productivity && (
                        <div style={{ marginLeft: 'auto', textAlign: 'center', padding: '10px 20px', borderRadius: 12, background: getRatingColor(productivity.rating) + '15', border: `1px solid ${getRatingColor(productivity.rating)}40` }}>
                            <p style={{ fontSize: 32, fontWeight: 800, color: getRatingColor(productivity.rating) }}>{productivity.score}</p>
                            <p style={{ fontSize: 11, fontWeight: 600, color: getRatingColor(productivity.rating), textTransform: 'capitalize' }}>{productivity.rating?.replace('_', ' ')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
                <div className="glass-card" style={{ padding: 16, textAlign: 'center' }}>
                    <p style={{ fontSize: 24, fontWeight: 800, color: '#3b82f6' }}>{tasks.length}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Total Tasks</p>
                </div>
                <div className="glass-card" style={{ padding: 16, textAlign: 'center' }}>
                    <p style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{completedTasks}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Completed</p>
                </div>
                <div className="glass-card" style={{ padding: 16, textAlign: 'center' }}>
                    <p style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>{inProgress}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>In Progress</p>
                </div>
                <div className="glass-card" style={{ padding: 16, textAlign: 'center' }}>
                    <p style={{ fontSize: 24, fontWeight: 800 }}>
                        {trend ? <span>{getTrendIcon(trend.trend)}</span> : '—'}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'capitalize' }}>{trend?.trend || 'No data'}</p>
                </div>
                <div className="glass-card" style={{ padding: 16, textAlign: 'center' }}>
                    <p style={{ fontSize: 24, fontWeight: 800, color: skillGap?.matchPercentage >= 70 ? '#10b981' : '#f59e0b' }}>
                        {skillGap?.matchPercentage != null ? `${skillGap.matchPercentage}%` : '—'}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Skill Match</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>

                {/* Skills & Gap Analysis */}
                <div className="glass-card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>🎯 Skills & Gap Analysis</h3>
                    <div style={{ marginBottom: 14 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 6 }}>Current Skills</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {skills.map(s => (
                                <span key={s} style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: '#10b98120', color: '#10b981' }}>{s}</span>
                            ))}
                        </div>
                    </div>
                    {skillGap?.missingSkills?.length > 0 && (
                        <div style={{ marginBottom: 14 }}>
                            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 6 }}>Missing Skills</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {skillGap.missingSkills.map(s => (
                                    <span key={s} style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: '#ef444420', color: '#ef4444' }}>{s}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {skillGap?.suggestedCourses?.length > 0 && (
                        <div>
                            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 6 }}>📚 Recommended Courses</p>
                            {skillGap.suggestedCourses.map(c => (
                                <div key={c} style={{ padding: '6px 10px', borderRadius: 6, background: 'var(--bg-hover)', marginBottom: 3, fontSize: 11, color: 'var(--text-primary)' }}>
                                    🎓 {c}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Productivity Breakdown */}
                {productivity?.breakdown && (
                    <div className="glass-card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>📊 Productivity Breakdown</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={Object.entries(productivity.breakdown).map(([k, v]) => ({
                                metric: k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
                                value: typeof v === 'number' ? Math.round(v) : 0
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                                <XAxis dataKey="metric" tick={{ fill: 'var(--text-dim)', fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                                <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 11 }} domain={[0, 100]} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Performance Trend */}
                {trend?.weeklyCompletions && (
                    <div className="glass-card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
                            {getTrendIcon(trend.trend)} Performance Trend
                            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-dim)', marginLeft: 8, textTransform: 'capitalize' }}>
                                {trend.trend}
                            </span>
                        </h3>
                        <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={trend.weeklyCompletions.map((v, i) => ({ week: `Week ${i + 1}`, tasks: v }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                                <XAxis dataKey="week" tick={{ fill: 'var(--text-dim)', fontSize: 11 }} />
                                <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }} />
                                <Line type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Task History */}
                <div className="glass-card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>📋 Task History</h3>
                    <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                        {tasks.length === 0 ? (
                            <p style={{ fontSize: 13, color: 'var(--text-dim)', textAlign: 'center', padding: 20 }}>No tasks assigned</p>
                        ) : tasks.map(t => (
                            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-default)' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor(t.status), flexShrink: 0 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</p>
                                    <p style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                                        {t.deadline ? new Date(t.deadline).toLocaleDateString() : 'No deadline'}
                                        {t.tx_hash && ' • 🔗 On-chain'}
                                    </p>
                                </div>
                                <span style={{
                                    padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                                    background: getStatusColor(t.status) + '20', color: getStatusColor(t.status)
                                }}>
                                    {t.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payroll History */}
                <div className="glass-card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>💰 Payroll History</h3>
                    {payroll.length === 0 ? (
                        <p style={{ fontSize: 13, color: 'var(--text-dim)', textAlign: 'center', padding: 20 }}>No payroll records</p>
                    ) : (
                        <div>
                            <ResponsiveContainer width="100%" height={160}>
                                <BarChart data={payroll.map(p => ({ period: p.period, amount: p.amount }))}>
                                    <XAxis dataKey="period" tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
                                    <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
                                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }} formatter={(v) => [`₹${v.toLocaleString()}`, 'Amount']} />
                                    <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                            <div style={{ marginTop: 10, maxHeight: 120, overflowY: 'auto' }}>
                                {payroll.map(p => (
                                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-default)', fontSize: 12 }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>{p.period}</span>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₹{p.amount?.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Wallet Info */}
                {employee.wallet_address && (
                    <div className="glass-card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>🔗 Web3 Wallet</h3>
                        <div style={{ padding: 12, borderRadius: 8, background: 'var(--bg-hover)', wordBreak: 'break-all' }}>
                            <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>Ethereum Address</p>
                            <a href={`https://sepolia.etherscan.io/address/${employee.wallet_address}`} target="_blank" rel="noopener noreferrer"
                                style={{ fontSize: 12, color: '#3b82f6', textDecoration: 'none' }}>
                                {employee.wallet_address}
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

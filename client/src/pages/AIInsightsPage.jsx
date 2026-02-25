import { useState, useEffect } from 'react';
import api from '../services/api';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line, CartesianGrid, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function AIInsightsPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productivityData, setProductivityData] = useState([]);
    const [workloadData, setWorkloadData] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [skillGap, setSkillGap] = useState(null);
    const [trend, setTrend] = useState(null);
    const [suggestForm, setSuggestForm] = useState({ title: '', skills: '' });
    const [suggestions, setSuggestions] = useState(null);
    const [suggestLoading, setSuggestLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('productivity');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [empRes, workRes] = await Promise.all([
                api.get('/employees?limit=100'),
                api.get('/ai/workload')
            ]);
            const emps = empRes.data?.employees || (Array.isArray(empRes.data) ? empRes.data : []);
            setEmployees(emps);
            setWorkloadData(workRes.data);

            // Fetch productivity scores for all employees
            const scores = await Promise.all(
                emps.slice(0, 20).map(async (emp) => {
                    try {
                        const res = await api.get(`/ai/productivity/${emp.id}`);
                        return { ...res.data, name: emp.name, department: emp.department, id: emp.id };
                    } catch { return { name: emp.name, department: emp.department, id: emp.id, score: 0, rating: 'N/A' }; }
                })
            );
            setProductivityData(scores.sort((a, b) => (b.score || 0) - (a.score || 0)));
        } catch (err) { console.error('AI data load failed:', err); }
        finally { setLoading(false); }
    };

    const fetchEmployeeAI = async (empId) => {
        setSelectedEmployee(empId);
        try {
            const [gapRes, trendRes] = await Promise.all([
                api.get(`/ai/skill-gap/${empId}`),
                api.get(`/ai/trend/${empId}`)
            ]);
            setSkillGap(gapRes.data);
            setTrend(trendRes.data);
        } catch (err) { console.error(err); }
    };

    const handleSuggest = async (e) => {
        e.preventDefault();
        if (!suggestForm.title) return;
        setSuggestLoading(true);
        try {
            const params = new URLSearchParams({ title: suggestForm.title });
            if (suggestForm.skills) params.set('skills', suggestForm.skills);
            const res = await api.get(`/ai/suggest-assignment?${params}`);
            setSuggestions(res.data);
        } catch (err) { console.error(err); }
        finally { setSuggestLoading(false); }
    };

    const getRatingColor = (rating) => {
        const map = { excellent: '#10b981', good: '#3b82f6', average: '#f59e0b', needs_improvement: '#ef4444' };
        return map[rating] || '#6b7280';
    };

    const getRatingBadge = (rating) => {
        const labels = { excellent: '🏆 Excellent', good: '✅ Good', average: '⚡ Average', needs_improvement: '⚠️ Needs Work' };
        return labels[rating] || rating;
    };

    const getTrendIcon = (t) => {
        if (t === 'improving') return '📈';
        if (t === 'declining') return '📉';
        return '➡️';
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="spinner" />
        </div>
    );

    const topPerformers = productivityData.slice(0, 5);
    const bottomPerformers = [...productivityData].reverse().slice(0, 5);

    // Department average scores
    const deptScores = {};
    productivityData.forEach(p => {
        if (!deptScores[p.department]) deptScores[p.department] = { total: 0, count: 0 };
        deptScores[p.department].total += (p.score || 0);
        deptScores[p.department].count += 1;
    });
    const deptAvg = Object.entries(deptScores).map(([dept, d]) => ({
        department: dept.length > 12 ? dept.slice(0, 12) + '…' : dept,
        avgScore: Math.round(d.total / d.count)
    })).sort((a, b) => b.avgScore - a.avgScore);

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    🧠 AI Workforce Intelligence
                </h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Machine learning-powered insights across {employees.length} employees
                </p>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-card)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
                {[
                    { id: 'productivity', label: '📊 Productivity', },
                    { id: 'skills', label: '🎯 Skill Gaps' },
                    { id: 'assignment', label: '🤖 Smart Assign' },
                    { id: 'workload', label: '⚖️ Workload' },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                            fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                            background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                            color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)'
                        }}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ─── Productivity Tab ─── */}
            {activeTab === 'productivity' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
                    {/* Top Performers */}
                    <div className="glass-card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                            🏆 Top 5 Performers
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {topPerformers.map((p, i) => (
                                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, background: 'var(--bg-hover)' }}>
                                    <span style={{ fontSize: 20, fontWeight: 800, color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : 'var(--text-dim)', width: 28 }}>
                                        {i + 1}
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                                        <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{p.department}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: 18, fontWeight: 800, color: getRatingColor(p.rating) }}>{p.score || 0}</span>
                                        <p style={{ fontSize: 10, color: getRatingColor(p.rating), fontWeight: 600 }}>{getRatingBadge(p.rating)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Department Averages Chart */}
                    <div className="glass-card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
                            📊 Department Productivity Averages
                        </h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={deptAvg} layout="vertical" margin={{ left: 10, right: 20 }}>
                                <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-dim)', fontSize: 11 }} />
                                <YAxis dataKey="department" type="category" width={90} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }} />
                                <Bar dataKey="avgScore" radius={[0, 6, 6, 0]}>
                                    {deptAvg.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Needs Improvement */}
                    <div className="glass-card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
                            ⚠️ Needs Improvement
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {bottomPerformers.map((p) => (
                                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, background: 'var(--bg-hover)' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</p>
                                        <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{p.department}</p>
                                    </div>
                                    <span style={{ fontSize: 16, fontWeight: 700, color: getRatingColor(p.rating) }}>{p.score || 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Full Leaderboard */}
                    <div className="glass-card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
                            📋 Full Productivity Leaderboard
                        </h3>
                        <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                                        <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-dim)', fontWeight: 600 }}>#</th>
                                        <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-dim)', fontWeight: 600 }}>Employee</th>
                                        <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--text-dim)', fontWeight: 600 }}>Score</th>
                                        <th style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--text-dim)', fontWeight: 600 }}>Rating</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productivityData.map((p, i) => (
                                        <tr key={p.id} style={{ borderBottom: '1px solid var(--border-default)', cursor: 'pointer' }}
                                            onClick={() => fetchEmployeeAI(p.id)}>
                                            <td style={{ padding: '8px', color: 'var(--text-dim)' }}>{i + 1}</td>
                                            <td style={{ padding: '8px', color: 'var(--text-primary)', fontWeight: 500 }}>{p.name}</td>
                                            <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700, color: getRatingColor(p.rating) }}>{p.score || 0}</td>
                                            <td style={{ padding: '8px', textAlign: 'center' }}>
                                                <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: getRatingColor(p.rating) + '20', color: getRatingColor(p.rating) }}>
                                                    {p.rating}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Skill Gap Tab ─── */}
            {activeTab === 'skills' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
                    {/* Employee Selector */}
                    <div className="glass-card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
                            🎯 Select Employee for Skill Analysis
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 400, overflowY: 'auto' }}>
                            {employees.map(emp => (
                                <button key={emp.id} onClick={() => fetchEmployeeAI(emp.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                                        borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left',
                                        background: selectedEmployee === emp.id ? 'var(--accent)' : 'var(--bg-hover)',
                                        color: selectedEmployee === emp.id ? '#fff' : 'var(--text-primary)',
                                        transition: 'all 0.15s'
                                    }}>
                                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: selectedEmployee === emp.id ? 'rgba(255,255,255,0.2)' : 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                                        {emp.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 13, fontWeight: 600 }}>{emp.name}</p>
                                        <p style={{ fontSize: 11, opacity: 0.7 }}>{emp.role}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Skill Gap Results */}
                    <div className="glass-card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
                            📊 Skill Gap Analysis
                        </h3>
                        {!skillGap ? (
                            <p style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center', padding: 40 }}>
                                ← Select an employee to see their skill analysis
                            </p>
                        ) : (
                            <div>
                                {/* Match Percentage */}
                                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                    <div style={{ fontSize: 48, fontWeight: 800, color: (skillGap.matchPercentage || 0) >= 70 ? '#10b981' : (skillGap.matchPercentage || 0) >= 40 ? '#f59e0b' : '#ef4444' }}>
                                        {skillGap.matchPercentage || 0}%
                                    </div>
                                    <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Skill Match</p>
                                </div>

                                {/* Skills Breakdown */}
                                <div style={{ marginBottom: 16 }}>
                                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 6 }}>Current Skills</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                        {(skillGap.currentSkills || []).map(s => (
                                            <span key={s} style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: '#10b98120', color: '#10b981' }}>{s}</span>
                                        ))}
                                    </div>
                                </div>

                                {(skillGap.missingSkills || []).length > 0 && (
                                    <div style={{ marginBottom: 16 }}>
                                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 6 }}>Missing Skills</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {skillGap.missingSkills.map(s => (
                                                <span key={s} style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: '#ef444420', color: '#ef4444' }}>{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(skillGap.suggestedCourses || []).length > 0 && (
                                    <div>
                                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 6 }}>📚 Suggested Courses</p>
                                        {skillGap.suggestedCourses.map(c => (
                                            <div key={c} style={{ padding: '8px 10px', borderRadius: 6, background: 'var(--bg-hover)', marginBottom: 4, fontSize: 12, color: 'var(--text-primary)' }}>
                                                🎓 {c}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Performance Trend */}
                    <div className="glass-card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
                            📈 Performance Trend
                        </h3>
                        {!trend ? (
                            <p style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center', padding: 40 }}>
                                ← Select an employee to see their trend
                            </p>
                        ) : (
                            <div>
                                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                    <span style={{ fontSize: 36 }}>{getTrendIcon(trend.trend)}</span>
                                    <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize', marginTop: 4 }}>
                                        {trend.trend}
                                    </p>
                                    <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>4-week rolling analysis</p>
                                </div>
                                {trend.weeklyCompletions && (
                                    <ResponsiveContainer width="100%" height={140}>
                                        <BarChart data={trend.weeklyCompletions.map((v, i) => ({ week: `W${i + 1}`, tasks: v }))}>
                                            <XAxis dataKey="week" tick={{ fill: 'var(--text-dim)', fontSize: 11 }} />
                                            <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 11 }} />
                                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }} />
                                            <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ─── Smart Assignment Tab ─── */}
            {activeTab === 'assignment' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
                    {/* Input Form */}
                    <div className="glass-card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                            🤖 AI Task Assignment Engine
                        </h3>
                        <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 16 }}>
                            Enter a task and required skills — AI will recommend the best employee based on skill match (50%), workload (30%), and productivity history (20%).
                        </p>
                        <form onSubmit={handleSuggest} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Task Title</label>
                                <input value={suggestForm.title} onChange={e => setSuggestForm(p => ({ ...p, title: e.target.value }))}
                                    placeholder="e.g. Build user dashboard with charts"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: 13 }} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Required Skills (comma-separated)</label>
                                <input value={suggestForm.skills} onChange={e => setSuggestForm(p => ({ ...p, skills: e.target.value }))}
                                    placeholder="e.g. React, JavaScript, CSS"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: 13 }} />
                            </div>
                            <button type="submit" className="btn-primary" disabled={suggestLoading}
                                style={{ padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                                {suggestLoading ? '⏳ Analyzing...' : '🧠 Find Best Match'}
                            </button>
                        </form>
                    </div>

                    {/* Results */}
                    <div className="glass-card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
                            🎯 AI Recommendations
                        </h3>
                        {!suggestions ? (
                            <p style={{ fontSize: 13, color: 'var(--text-dim)', textAlign: 'center', padding: 40 }}>
                                Enter a task and click "Find Best Match" to get AI recommendations
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {(suggestions.recommendations || []).map((rec, i) => (
                                    <div key={rec.employeeId} style={{
                                        padding: 14, borderRadius: 10,
                                        background: i === 0 ? 'linear-gradient(135deg, #3b82f610, #10b98110)' : 'var(--bg-hover)',
                                        border: i === 0 ? '1px solid #3b82f640' : '1px solid transparent'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                            <span style={{ fontSize: 22, fontWeight: 800, color: i === 0 ? '#3b82f6' : 'var(--text-dim)' }}>#{i + 1}</span>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{rec.name}</p>
                                                <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{rec.role} • {rec.department}</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ fontSize: 22, fontWeight: 800, color: '#3b82f6' }}>{rec.compositeScore}</span>
                                                <p style={{ fontSize: 10, color: 'var(--text-dim)' }}>Composite</p>
                                            </div>
                                        </div>
                                        {/* Score breakdown */}
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: '#3b82f620', color: '#3b82f6' }}>
                                                Skill: {rec.skillScore}%
                                            </span>
                                            <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: '#10b98120', color: '#10b981' }}>
                                                Avail: {rec.workloadScore}%
                                            </span>
                                            <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: '#f59e0b20', color: '#f59e0b' }}>
                                                Prod: {rec.productivityScore}%
                                            </span>
                                        </div>
                                        {rec.matchingSkills && (
                                            <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                                {rec.matchingSkills.map(s => (
                                                    <span key={s} style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9, background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>{s}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ─── Workload Tab ─── */}
            {activeTab === 'workload' && workloadData && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
                    {/* Summary Stats */}
                    <div className="glass-card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
                            ⚖️ Workload Overview
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                            <div style={{ padding: 14, borderRadius: 10, background: 'var(--bg-hover)', textAlign: 'center' }}>
                                <p style={{ fontSize: 24, fontWeight: 800, color: '#3b82f6' }}>{workloadData.summary?.avgActiveTasks?.toFixed(1) || 0}</p>
                                <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Avg Active Tasks</p>
                            </div>
                            <div style={{ padding: 14, borderRadius: 10, background: 'var(--bg-hover)', textAlign: 'center' }}>
                                <p style={{ fontSize: 24, fontWeight: 800, color: workloadData.summary?.overloaded > 0 ? '#ef4444' : '#10b981' }}>
                                    {workloadData.summary?.overloaded || 0}
                                </p>
                                <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Overloaded</p>
                            </div>
                        </div>

                        {/* Employees by workload */}
                        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                            {(workloadData.employees || []).map(emp => {
                                const level = emp.activeTasks > 4 ? 'high' : emp.activeTasks > 2 ? 'medium' : 'low';
                                const barColor = level === 'high' ? '#ef4444' : level === 'medium' ? '#f59e0b' : '#10b981';
                                return (
                                    <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-default)' }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</p>
                                        </div>
                                        <div style={{ width: 80, height: 6, borderRadius: 3, background: 'var(--bg-hover)', overflow: 'hidden' }}>
                                            <div style={{ width: `${Math.min(emp.activeTasks * 20, 100)}%`, height: '100%', borderRadius: 3, background: barColor, transition: 'width 0.3s' }} />
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: barColor, width: 20, textAlign: 'right' }}>{emp.activeTasks}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Workload Distribution Chart */}
                    <div className="glass-card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
                            📊 Workload Distribution
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={(workloadData.employees || []).slice(0, 15).map(e => ({ name: e.name.split(' ')[0], tasks: e.activeTasks }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                                <XAxis dataKey="name" tick={{ fill: 'var(--text-dim)', fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                                <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }} />
                                <Bar dataKey="tasks" radius={[4, 4, 0, 0]}>
                                    {(workloadData.employees || []).slice(0, 15).map((e, i) => (
                                        <Cell key={i} fill={e.activeTasks > 4 ? '#ef4444' : e.activeTasks > 2 ? '#f59e0b' : '#10b981'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}

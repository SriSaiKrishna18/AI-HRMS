import { useState, useEffect } from 'react';
import api from '../services/api';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineChartBar, HiOutlinePuzzle, HiOutlineX, HiOutlineUserGroup, HiOutlineSearch, HiOutlineDownload } from 'react-icons/hi';

export default function EmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', role: '', department: '', skills: '', wallet_address: '' });
    const [aiScores, setAiScores] = useState({});
    const [trends, setTrends] = useState({});
    const [aiPanel, setAiPanel] = useState(null);
    const [toast, setToast] = useState(null);
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [profileEmp, setProfileEmp] = useState(null);
    const [payrollRecords, setPayrollRecords] = useState([]);
    const [payrollForm, setPayrollForm] = useState({ amount: '', period: '', notes: '' });
    const [savingPayroll, setSavingPayroll] = useState(false);

    const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];
    const filtered = employees.filter(e => {
        const q = search.toLowerCase();
        const matchSearch = !q || e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q) || e.department.toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
        const matchDept = !deptFilter || e.department === deptFilter;
        return matchSearch && matchDept;
    });

    const handleExportCsv = async () => {
        try {
            const res = await api.get('/employees/export/csv', { responseType: 'blob' });
            const url = URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a'); a.href = url; a.download = 'employees.csv'; a.click();
            URL.revokeObjectURL(url);
            showToast('CSV exported');
        } catch { showToast('Export failed', 'error'); }
    };

    useEffect(() => { fetchEmployees(); }, []);

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/employees');
            const emps = res.data.employees;
            setEmployees(emps);
            loadAiScores(emps);
            loadTrends(emps);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const loadAiScores = async (emps) => {
        const scores = {};
        await Promise.allSettled(
            emps.map(async (emp) => {
                try {
                    const res = await api.get(`/ai/productivity/${emp.id}`);
                    scores[emp.id] = { score: res.data.score, rating: res.data.rating };
                } catch { scores[emp.id] = { score: 0, rating: 'Error' }; }
            })
        );
        setAiScores(scores);
    };

    const loadTrends = async (emps) => {
        const t = {};
        await Promise.allSettled(
            emps.map(async (emp) => {
                try {
                    const res = await api.get(`/ai/trend/${emp.id}`);
                    t[emp.id] = res.data;
                } catch { t[emp.id] = null; }
            })
        );
        setTrends(t);
    };

    const trendIcon = (empId) => {
        const t = trends[empId];
        if (!t) return <span style={{ color: 'var(--text-faint)' }}>â€”</span>;
        if (t.trend === 'improving') return <span className="trend-up" title={t.summary} style={{ fontWeight: 700, fontSize: 14 }}>â†‘</span>;
        if (t.trend === 'declining') return <span className="trend-down" title={t.summary} style={{ fontWeight: 700, fontSize: 14 }}>â†“</span>;
        return <span className="trend-stable" title={t.summary} style={{ fontWeight: 700, fontSize: 14 }}>â†’</span>;
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const payload = { ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) };
        try {
            if (editId) {
                await api.put(`/employees/${editId}`, payload);
                showToast('Employee updated');
            } else {
                await api.post('/employees', payload);
                showToast('Employee added');
            }
            setShowModal(false); setEditId(null);
            setForm({ name: '', email: '', role: '', department: '', skills: '', wallet_address: '' });
            fetchEmployees();
        } catch (err) { showToast(err.response?.data?.error || 'Error', 'error'); }
        finally { setSubmitting(false); }
    };

    const handleEdit = (emp) => {
        setEditId(emp.id);
        setForm({ name: emp.name, email: emp.email, role: emp.role, department: emp.department, skills: (emp.skills || []).join(', '), wallet_address: emp.wallet_address || '' });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this employee?')) return;
        try { await api.delete(`/employees/${id}`); showToast('Employee removed'); fetchEmployees(); }
        catch { showToast('Error removing', 'error'); }
    };

    const fetchProductivity = async (empId) => {
        try { const res = await api.get(`/ai/productivity/${empId}`); setAiPanel({ type: 'productivity', data: res.data }); }
        catch { showToast('Error loading AI data', 'error'); }
    };

    const fetchSkillGap = async (empId) => {
        try { const res = await api.get(`/ai/skill-gap/${empId}`); setAiPanel({ type: 'skillgap', data: res.data }); }
        catch { showToast('Error loading AI data', 'error'); }
    };

    const scoreColor = (s) => s >= 85 ? '#22c55e' : s >= 70 ? '#3b82f6' : s >= 50 ? '#eab308' : 'var(--danger)';

    const loadPayroll = async (empId) => {
        try {
            const res = await api.get(`/payroll/${empId}`);
            setPayrollRecords(res.data.records || []);
        } catch { setPayrollRecords([]); }
    };

    const handleMarkPayroll = async () => {
        if (!profileEmp || !payrollForm.amount || !payrollForm.period) return;
        setSavingPayroll(true);
        try {
            await api.post('/payroll', {
                employee_id: profileEmp.id,
                amount: parseFloat(payrollForm.amount),
                period: payrollForm.period,
                notes: payrollForm.notes || null
            });
            showToast('Payroll recorded');
            setPayrollForm({ amount: '', period: '', notes: '' });
            loadPayroll(profileEmp.id);
        } catch { showToast('Payroll save failed', 'error'); }
        finally { setSavingPayroll(false); }
    };

    const openProfile = (emp) => {
        setProfileEmp(emp);
        loadPayroll(emp.id);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px', width: 28, height: 28 }} />
                    <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>Loading employees...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in">
            <div className="page-header-responsive" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Employees</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>{filtered.length} of {employees.length} members</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-ghost" onClick={handleExportCsv} title="Export CSV" style={{ padding: '8px 14px', fontSize: 12 }}>
                        <HiOutlineDownload size={15} /> CSV
                    </button>
                    <button className="btn-primary" onClick={() => { setEditId(null); setForm({ name: '', email: '', role: '', department: '', skills: '', wallet_address: '' }); setShowModal(true); }}>
                        <HiOutlinePlus size={16} /> Add Employee
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <HiOutlineSearch size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <input className="input" placeholder="Search by name, role, department..." value={search} onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: 34, fontSize: 12 }} />
                </div>
                <select className="input" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
                    style={{ width: 160, padding: '8px 12px', fontSize: 12 }}>
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>

            {/* Employee Table */}
            <div className="card table-wrap">
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 780 }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #27272a' }}>
                            {['Name', 'Role', 'Department', 'Skills', 'Score', 'Trend', 'AI', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(emp => (
                            <tr key={emp.id} className="table-row" style={{ borderBottom: '1px solid #1a1a1e' }}>
                                <td style={{ padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: '50%',
                                            background: 'var(--bg-hover)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)'
                                        }}>{emp.name.charAt(0)}</div>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => openProfile(emp)}>{emp.name}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{emp.email}</p>
                                                {emp.wallet_address && (
                                                    <span title={emp.wallet_address} style={{ fontSize: 9, padding: '1px 5px', background: 'rgba(249,115,22,0.1)', color: 'var(--warning)', borderRadius: 4, fontFamily: 'monospace' }}>âŸ  {emp.wallet_address.slice(0, 6)}â€¦</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{emp.role}</td>
                                <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{emp.department}</td>
                                <td style={{ padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                        {(emp.skills || []).slice(0, 3).map(s => (
                                            <span key={s} className="badge badge-skill">{s}</span>
                                        ))}
                                        {(emp.skills || []).length > 3 && (
                                            <span className="badge" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>+{emp.skills.length - 3}</span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                    {aiScores[emp.id] ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div className="progress-bar" style={{ width: 50 }}>
                                                <div className="progress-fill" style={{ width: `${aiScores[emp.id].score}%`, background: scoreColor(aiScores[emp.id].score) }} />
                                            </div>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: scoreColor(aiScores[emp.id].score) }}>
                                                {aiScores[emp.id].score}
                                            </span>
                                        </div>
                                    ) : <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>â€”</span>}
                                </td>
                                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                    {trendIcon(emp.id)}
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button onClick={() => fetchProductivity(emp.id)} title="Productivity"
                                            className="btn-ghost" style={{ padding: '6px 8px' }}>
                                            <HiOutlineChartBar size={15} />
                                        </button>
                                        <button onClick={() => fetchSkillGap(emp.id)} title="Skill Gap"
                                            className="btn-ghost" style={{ padding: '6px 8px', color: '#22c55e' }}>
                                            <HiOutlinePuzzle size={15} />
                                        </button>
                                    </div>
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button onClick={() => handleEdit(emp)} className="btn-ghost" style={{ padding: '6px 8px', color: '#3b82f6' }}>
                                            <HiOutlinePencil size={15} />
                                        </button>
                                        <button onClick={() => handleDelete(emp.id)} className="btn-ghost" style={{ padding: '6px 8px', color: 'var(--danger)' }}>
                                            <HiOutlineTrash size={15} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {employees.length === 0 && (
                    <div style={{ padding: 48, textAlign: 'center' }}>
                        <HiOutlineUserGroup size={36} style={{ color: 'var(--bg-hover)', margin: '0 auto 10px', display: 'block' }} />
                        <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>No employees yet. Click "Add Employee" to start.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{editId ? 'Edit Employee' : 'Add Employee'}</h2>
                            <button onClick={() => setShowModal(false)} className="btn-ghost"><HiOutlineX size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {[
                                { label: 'Name', key: 'name', type: 'text', placeholder: 'John Doe', required: true },
                                { label: 'Email', key: 'email', type: 'email', placeholder: 'john@company.com', required: true },
                                { label: 'Role', key: 'role', type: 'text', placeholder: 'Frontend Developer', required: true },
                                { label: 'Department', key: 'department', type: 'text', placeholder: 'Engineering', required: true },
                                { label: 'Skills (comma-separated)', key: 'skills', type: 'text', placeholder: 'React, Node.js, TypeScript' },
                                { label: 'Wallet Address', key: 'wallet_address', type: 'text', placeholder: '0x...' },
                            ].map(f => (
                                <div key={f.key} style={{ marginBottom: 14 }}>
                                    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>{f.label}</label>
                                    <input className="input" type={f.type} placeholder={f.placeholder} required={f.required}
                                        value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                                </div>
                            ))}
                            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                                <button type="submit" className="btn-primary" disabled={submitting} style={{ flex: 1, justifyContent: 'center', opacity: submitting ? 0.5 : 1 }}>
                                    {submitting ? <><div className="spinner" /> Saving...</> : editId ? 'Update' : 'Add Employee'}
                                </button>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* AI Panel */}
            {aiPanel && (
                <div className="modal-overlay" onClick={() => setAiPanel(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                                {aiPanel.type === 'productivity' ? 'Productivity Score' : 'Skill Gap Analysis'}
                            </h2>
                            <button onClick={() => setAiPanel(null)} className="btn-ghost"><HiOutlineX size={18} /></button>
                        </div>

                        {aiPanel.type === 'productivity' && (
                            <div>
                                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                    <p style={{ fontSize: 44, fontWeight: 800, color: scoreColor(aiPanel.data.score), letterSpacing: '-0.03em' }}>{aiPanel.data.score}</p>
                                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{aiPanel.data.rating} Performance</p>
                                    {aiPanel.data.message && <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>{aiPanel.data.message}</p>}
                                </div>
                                <div className="progress-bar" style={{ marginBottom: 18 }}>
                                    <div className="progress-fill" style={{ width: `${aiPanel.data.score}%`, background: scoreColor(aiPanel.data.score) }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    {[
                                        { label: 'Completed', value: aiPanel.data.details.completedTasks },
                                        { label: 'Total Tasks', value: aiPanel.data.details.totalTasks },
                                        { label: 'Completion', value: `${aiPanel.data.details.completionRate}%` },
                                        { label: 'On-Time', value: `${aiPanel.data.details.deadlineAdherence}%` },
                                    ].map((item, i) => (
                                        <div key={i} style={{ padding: 12, background: 'var(--bg-elevated)', borderRadius: 8, textAlign: 'center' }}>
                                            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</p>
                                            <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{item.label}</p>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: 14, textAlign: 'center' }}>
                                    <span className={`badge ${aiPanel.data.trend === 'improving' ? 'status-completed' : aiPanel.data.trend === 'declining' ? 'badge-missing' : 'badge-skill'}`}>
                                        Trend: {aiPanel.data.trend}
                                    </span>
                                </div>
                            </div>
                        )}

                        {aiPanel.type === 'skillgap' && (
                            <div>
                                <div style={{ textAlign: 'center', marginBottom: 18 }}>
                                    <p style={{ fontSize: 36, fontWeight: 800, color: scoreColor(aiPanel.data.matchPercentage), letterSpacing: '-0.03em' }}>{aiPanel.data.matchPercentage}%</p>
                                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Skill Match Â· {aiPanel.data.level}</p>
                                </div>
                                <div className="progress-bar" style={{ marginBottom: 20 }}>
                                    <div className="progress-fill" style={{ width: `${aiPanel.data.matchPercentage}%`, background: 'var(--accent)' }} />
                                </div>
                                {aiPanel.data.matchedSkills?.length > 0 && (
                                    <div style={{ marginBottom: 14 }}>
                                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>âœ“ Matched Skills</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {aiPanel.data.matchedSkills.map(s => <span key={s} className="badge badge-skill">{s}</span>)}
                                        </div>
                                    </div>
                                )}
                                {aiPanel.data.missingSkills?.length > 0 && (
                                    <div style={{ marginBottom: 14 }}>
                                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--danger)', marginBottom: 6 }}>âœ— Missing Skills</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {aiPanel.data.missingSkills.map(s => <span key={s} className="badge badge-missing">{s}</span>)}
                                        </div>
                                    </div>
                                )}
                                {aiPanel.data.suggestedCourses?.length > 0 && (
                                    <div>
                                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Suggested Courses</p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            {aiPanel.data.suggestedCourses.map((c, i) => (
                                                <div key={i} style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 6, fontSize: 12, color: 'var(--text-secondary)' }}>{c}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Employee Profile Panel */}
            {profileEmp && (
                <div className="modal-overlay" onClick={() => setProfileEmp(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Employee Profile</h2>
                            <button onClick={() => setProfileEmp(null)} className="btn-ghost"><HiOutlineX size={18} /></button>
                        </div>

                        {/* Profile Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-hover)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 20, fontWeight: 700, color: 'var(--text-secondary)'
                            }}>{profileEmp.name.charAt(0)}</div>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{profileEmp.name}</p>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{profileEmp.role} Â· {profileEmp.department}</p>
                                {profileEmp.wallet_address && (
                                    <a href={`https://sepolia.etherscan.io/address/${profileEmp.wallet_address}`} target="_blank" rel="noreferrer"
                                        style={{ fontSize: 10, color: 'var(--warning)', fontFamily: 'monospace', textDecoration: 'none' }}>
                                        âŸ  {profileEmp.wallet_address.slice(0, 10)}â€¦{profileEmp.wallet_address.slice(-6)}
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* AI Score + Trend */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                            <div style={{ padding: 14, background: 'var(--bg-elevated)', borderRadius: 10, textAlign: 'center' }}>
                                <p style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 6 }}>AI Score</p>
                                <p style={{ fontSize: 28, fontWeight: 800, color: aiScores[profileEmp.id] ? scoreColor(aiScores[profileEmp.id].score) : 'var(--text-faint)' }}>
                                    {aiScores[profileEmp.id]?.score ?? 'â€”'}
                                </p>
                                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{aiScores[profileEmp.id]?.rating || 'Loading...'}</p>
                            </div>
                            <div style={{ padding: 14, background: 'var(--bg-elevated)', borderRadius: 10, textAlign: 'center' }}>
                                <p style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 6 }}>Trend</p>
                                <p style={{ fontSize: 28, fontWeight: 800 }}>{trendIcon(profileEmp.id)}</p>
                                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                    {trends[profileEmp.id]?.trend || 'Loading...'}
                                </p>
                            </div>
                        </div>

                        {/* Weekly Performance Bars */}
                        {trends[profileEmp.id]?.weeks && (
                            <div style={{ marginBottom: 18, padding: 14, background: 'var(--bg-elevated)', borderRadius: 10 }}>
                                <p style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10 }}>Weekly Completions</p>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 50 }}>
                                    {trends[profileEmp.id].weeks.map((w, i) => {
                                        const maxH = Math.max(...trends[profileEmp.id].weeks.map(wk => wk.completed), 1);
                                        const h = (w.completed / maxH) * 40 + 6;
                                        return (
                                            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                                                <div style={{
                                                    height: h, borderRadius: 3, margin: '0 auto',
                                                    width: '60%',
                                                    background: w.completed > 0 ? 'var(--accent)' : 'var(--bg-hover)',
                                                }} />
                                                <p style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 4 }}>{w.week}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Skills */}
                        <div style={{ marginBottom: 14 }}>
                            <p style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 8 }}>Skills</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {(profileEmp.skills || []).map(s => (
                                    <span key={s} className="badge badge-skill">{s}</span>
                                ))}
                            </div>
                        </div>

                        {/* Payroll Proof Section */}
                        <div style={{ marginBottom: 14, padding: 14, background: 'var(--bg-elevated)', borderRadius: 10 }}>
                            <p style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10 }}>💰 Payroll Proof</p>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                                <input type="number" placeholder="Amount (₹)" value={payrollForm.amount}
                                    onChange={e => setPayrollForm({ ...payrollForm, amount: e.target.value })}
                                    style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-default)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 12 }} />
                                <input type="month" value={payrollForm.period}
                                    onChange={e => setPayrollForm({ ...payrollForm, period: e.target.value })}
                                    style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-default)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 12 }} />
                            </div>
                            <button onClick={handleMarkPayroll} disabled={savingPayroll || !payrollForm.amount || !payrollForm.period}
                                className="btn-primary" style={{ width: '100%', padding: '8px 0', fontSize: 12 }}>
                                {savingPayroll ? 'Saving...' : 'Mark Payroll'}
                            </button>
                            {payrollRecords.length > 0 && (
                                <div style={{ marginTop: 10, maxHeight: 120, overflowY: 'auto' }}>
                                    {payrollRecords.map(r => (
                                        <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 11 }}>
                                            <span style={{ color: 'var(--text-primary)' }}>₹{r.amount.toLocaleString()} · {r.period}</span>
                                            {r.tx_hash ? (
                                                <a href={`https://sepolia.etherscan.io/tx/${r.tx_hash}`} target="_blank" rel="noreferrer"
                                                    style={{ color: 'var(--accent)', fontSize: 10 }}>🔗 On-chain</a>
                                            ) : (
                                                <span style={{ color: 'var(--text-faint)', fontSize: 10 }}>Pending</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 12 }}>
                            Joined {new Date(profileEmp.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            )}

            {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
        </div>
    );
}


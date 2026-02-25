import { useState, useEffect } from 'react';
import api from '../services/api';
import web3Service from '../services/web3';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineChartBar, HiOutlinePuzzle, HiOutlineX, HiOutlineUserGroup, HiOutlineSearch, HiOutlineDownload, HiOutlineExternalLink, HiOutlineLightningBolt, HiOutlineCube } from 'react-icons/hi';

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
    const [profileSkillGap, setProfileSkillGap] = useState(null);
    const [loggingPayrollOnChain, setLoggingPayrollOnChain] = useState(false);

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

    const openProfile = async (emp) => {
        setProfileEmp(emp);
        setProfileSkillGap(null);
        loadPayroll(emp.id);
        // Auto-fetch AI data for profile
        if (!aiScores[emp.id]) fetchProductivity(emp.id);
        if (!trends[emp.id]) {
            try { const res = await api.get(`/ai/trend/${emp.id}`); setTrends(prev => ({ ...prev, [emp.id]: res.data })); } catch { /* ignore */ }
        }
        try { const res = await api.get(`/ai/skill-gap/${emp.id}`); setProfileSkillGap(res.data); } catch { /* ignore */ }
    };

    const handlePayrollOnChain = async (record) => {
        if (!web3Service.getAddress()) {
            showToast('Connect MetaMask wallet first', 'error');
            return;
        }
        setLoggingPayrollOnChain(true);
        try {
            const result = await web3Service.logPayrollOnChain(
                profileEmp.wallet_address || web3Service.getAddress(),
                record.amount,
                record.period
            );
            await api.put(`/payroll/${record.id}/tx`, { tx_hash: result.txHash });
            showToast('Payroll logged on-chain!');
            loadPayroll(profileEmp.id);
        } catch (err) {
            showToast(`On-chain failed: ${err.message}`, 'error');
        } finally {
            setLoggingPayrollOnChain(false);
        }
    };

    if (loading) {
        return (
            <div className="page-loader">
                <div className="spinner-lg" />
                <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>Loading employees...</p>
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

            {/* Employee Profile Panel — AI Insights */}
            {profileEmp && (
                <div className="modal-overlay" onClick={() => setProfileEmp(null)}>
                    <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>Employee Profile</h2>
                                <span className="ai-label"><HiOutlineLightningBolt size={10} /> AI Insights</span>
                            </div>
                            <button onClick={() => setProfileEmp(null)} className="btn-ghost"><HiOutlineX size={18} /></button>
                        </div>

                        {/* Profile Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22, padding: '16px', background: 'var(--bg-elevated)', borderRadius: 12 }}>
                            <div style={{
                                width: 52, height: 52, borderRadius: '50%',
                                background: 'var(--accent-gradient)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 22, fontWeight: 700, color: 'white', flexShrink: 0,
                            }}>{profileEmp.name.charAt(0)}</div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{profileEmp.name}</p>
                                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{profileEmp.role} · {profileEmp.department}</p>
                                {profileEmp.wallet_address && (
                                    <a href={`https://sepolia.etherscan.io/address/${profileEmp.wallet_address}`} target="_blank" rel="noreferrer"
                                        className="chain-badge" style={{ marginTop: 6, display: 'inline-flex', textDecoration: 'none', fontSize: 10 }}>
                                        <HiOutlineCube size={10} /> {profileEmp.wallet_address.slice(0, 6)}…{profileEmp.wallet_address.slice(-4)}
                                        <HiOutlineExternalLink size={10} />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* AI Score Ring + Trend */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                            <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 12, textAlign: 'center' }}>
                                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                                    AI Productivity Score
                                </p>
                                {aiScores[profileEmp.id] ? (
                                    <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 8px' }}>
                                        <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border-default)" strokeWidth="2.5" />
                                            <circle cx="18" cy="18" r="15.5" fill="none"
                                                stroke={scoreColor(aiScores[profileEmp.id].score)}
                                                strokeWidth="2.5" strokeLinecap="round"
                                                strokeDasharray={`${aiScores[profileEmp.id].score * 0.974} 100`}
                                                style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)' }}
                                            />
                                        </svg>
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontSize: 22, fontWeight: 800, color: scoreColor(aiScores[profileEmp.id].score), letterSpacing: '-0.03em' }}>
                                                {aiScores[profileEmp.id].score}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="spinner" style={{ margin: '20px auto' }} />
                                )}
                                <p style={{ fontSize: 12, fontWeight: 600, color: aiScores[profileEmp.id] ? scoreColor(aiScores[profileEmp.id].score) : 'var(--text-dim)' }}>
                                    {aiScores[profileEmp.id]?.rating || 'Calculating...'}
                                </p>
                            </div>
                            <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 12, textAlign: 'center' }}>
                                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                                    Performance Trend
                                </p>
                                <p style={{ fontSize: 32, marginBottom: 4 }}>{trendIcon(profileEmp.id)}</p>
                                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                                    {trends[profileEmp.id]?.trend || 'Analyzing...'}
                                </p>
                                {trends[profileEmp.id]?.percentageChange !== undefined && (
                                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                        {trends[profileEmp.id].percentageChange > 0 ? '+' : ''}{trends[profileEmp.id].percentageChange}% vs last period
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Breakdown — if AI score loaded */}
                        {aiScores[profileEmp.id]?.details && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 18 }} className="stagger-children">
                                {[
                                    { label: 'Completed', value: aiScores[profileEmp.id].details.completedTasks, color: 'var(--success)' },
                                    { label: 'Total', value: aiScores[profileEmp.id].details.totalTasks, color: 'var(--accent)' },
                                    { label: 'Rate', value: `${aiScores[profileEmp.id].details.completionRate}%`, color: 'var(--info)' },
                                    { label: 'On-Time', value: `${aiScores[profileEmp.id].details.deadlineAdherence}%`, color: 'var(--warning)' },
                                ].map((item, i) => (
                                    <div key={i} style={{ padding: '10px 6px', background: 'var(--bg-elevated)', borderRadius: 10, textAlign: 'center' }}>
                                        <p style={{ fontSize: 18, fontWeight: 800, color: item.color, letterSpacing: '-0.02em' }}>{item.value}</p>
                                        <p style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 3, fontWeight: 500 }}>{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Weekly Performance Bars */}
                        {trends[profileEmp.id]?.weeks && (
                            <div style={{ marginBottom: 18, padding: 14, background: 'var(--bg-elevated)', borderRadius: 12 }}>
                                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Weekly Completions</p>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 55 }}>
                                    {trends[profileEmp.id].weeks.map((w, i) => {
                                        const maxH = Math.max(...trends[profileEmp.id].weeks.map(wk => wk.completed), 1);
                                        const h = (w.completed / maxH) * 42 + 6;
                                        return (
                                            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                                                <div style={{
                                                    height: h, borderRadius: 4, margin: '0 auto',
                                                    width: '65%',
                                                    background: w.completed > 0 ? 'var(--accent-gradient)' : 'var(--bg-hover)',
                                                    transition: 'height 0.5s cubic-bezier(0.4,0,0.2,1)',
                                                }} />
                                                <p style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 4, fontWeight: 500 }}>{w.week}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Skill Gap Analysis */}
                        {profileSkillGap && (
                            <div style={{ marginBottom: 18, padding: 14, background: 'var(--bg-elevated)', borderRadius: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skill Gap Analysis</p>
                                    <span className="badge" style={{ background: scoreColor(profileSkillGap.matchPercentage) + '20', color: scoreColor(profileSkillGap.matchPercentage), fontSize: 11, fontWeight: 700 }}>
                                        {profileSkillGap.matchPercentage}% Match
                                    </span>
                                </div>
                                <div className="progress-bar" style={{ marginBottom: 14, height: 8 }}>
                                    <div className="progress-fill" style={{ width: `${profileSkillGap.matchPercentage}%` }} />
                                </div>
                                {profileSkillGap.matchedSkills?.length > 0 && (
                                    <div style={{ marginBottom: 10 }}>
                                        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--success-text)', marginBottom: 6 }}>✓ Matched Skills</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {profileSkillGap.matchedSkills.map(s => <span key={s} className="badge badge-skill">{s}</span>)}
                                        </div>
                                    </div>
                                )}
                                {profileSkillGap.missingSkills?.length > 0 && (
                                    <div style={{ marginBottom: 10 }}>
                                        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--danger-text)', marginBottom: 6 }}>✗ Missing Skills</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {profileSkillGap.missingSkills.map(s => <span key={s} className="badge badge-missing">{s}</span>)}
                                        </div>
                                    </div>
                                )}
                                {profileSkillGap.suggestedCourses?.length > 0 && (
                                    <div>
                                        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>📚 Recommended Courses</p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            {profileSkillGap.suggestedCourses.map((c, i) => (
                                                <div key={i} style={{ padding: '7px 12px', background: 'var(--bg-body)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>{c}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Skills */}
                        <div style={{ marginBottom: 16 }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Current Skills</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                {(profileEmp.skills || []).map(s => (
                                    <span key={s} className="badge badge-skill">{s}</span>
                                ))}
                                {(!profileEmp.skills || profileEmp.skills.length === 0) && (
                                    <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>No skills listed</span>
                                )}
                            </div>
                        </div>

                        {/* Payroll Proof Section */}
                        <div style={{ marginBottom: 14, padding: 16, background: 'var(--bg-elevated)', borderRadius: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>💰 Payroll Proof</p>
                                <span className="chain-badge" style={{ fontSize: 9 }}>
                                    <HiOutlineCube size={10} /> On-Chain
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                                <input type="number" placeholder="Amount (₹)" value={payrollForm.amount}
                                    onChange={e => setPayrollForm({ ...payrollForm, amount: e.target.value })}
                                    className="input" style={{ flex: 1, padding: '8px 12px', fontSize: 12 }} />
                                <input type="month" value={payrollForm.period}
                                    onChange={e => setPayrollForm({ ...payrollForm, period: e.target.value })}
                                    className="input" style={{ flex: 1, padding: '8px 12px', fontSize: 12 }} />
                            </div>
                            <button onClick={handleMarkPayroll} disabled={savingPayroll || !payrollForm.amount || !payrollForm.period}
                                className="btn-primary" style={{ width: '100%', padding: '10px 0', fontSize: 13, justifyContent: 'center' }}>
                                {savingPayroll ? <><span className="spinner" /> Saving...</> : 'Create Payroll Record'}
                            </button>
                            {payrollRecords.length > 0 && (
                                <div style={{ marginTop: 12, maxHeight: 140, overflowY: 'auto' }}>
                                    {payrollRecords.map(r => (
                                        <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 12 }}>
                                            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>₹{r.amount.toLocaleString()} · {r.period}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                {r.tx_hash ? (
                                                    <a href={`https://sepolia.etherscan.io/tx/${r.tx_hash}`} target="_blank" rel="noreferrer"
                                                        className="chain-badge" style={{ fontSize: 9, textDecoration: 'none' }}>
                                                        <HiOutlineCube size={9} /> Verified
                                                    </a>
                                                ) : (
                                                    <button
                                                        onClick={() => handlePayrollOnChain(r)}
                                                        disabled={loggingPayrollOnChain}
                                                        className="btn-ghost"
                                                        style={{ fontSize: 10, padding: '3px 8px', color: 'var(--accent)' }}
                                                    >
                                                        {loggingPayrollOnChain ? '...' : '⛓ Log On-Chain'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 12, textAlign: 'center' }}>
                            Joined {new Date(profileEmp.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>
            )}

            {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
        </div>
    );
}


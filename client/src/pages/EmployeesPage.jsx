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
    const [aiPanel, setAiPanel] = useState(null);
    const [toast, setToast] = useState(null);
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('');

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

    const scoreColor = (s) => s >= 85 ? '#22c55e' : s >= 70 ? '#3b82f6' : s >= 50 ? '#eab308' : '#ef4444';

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px', width: 28, height: 28 }} />
                    <p style={{ color: '#52525b', fontSize: 13 }}>Loading employees...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in">
            <div className="page-header-responsive" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fafafa', letterSpacing: '-0.02em' }}>Employees</h1>
                    <p style={{ color: '#52525b', fontSize: 13, marginTop: 4 }}>{filtered.length} of {employees.length} members</p>
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
                    <HiOutlineSearch size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
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
                            {['Name', 'Role', 'Department', 'Skills', 'Score', 'AI', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
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
                                            background: '#27272a',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 13, fontWeight: 600, color: '#a1a1aa'
                                        }}>{emp.name.charAt(0)}</div>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: 13, color: '#e4e4e7' }}>{emp.name}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <p style={{ fontSize: 11, color: '#52525b' }}>{emp.email}</p>
                                                {emp.wallet_address && (
                                                    <span title={emp.wallet_address} style={{ fontSize: 9, padding: '1px 5px', background: 'rgba(249,115,22,0.1)', color: '#f97316', borderRadius: 4, fontFamily: 'monospace' }}>⟠ {emp.wallet_address.slice(0, 6)}…</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '14px 16px', fontSize: 13, color: '#a1a1aa' }}>{emp.role}</td>
                                <td style={{ padding: '14px 16px', fontSize: 13, color: '#a1a1aa' }}>{emp.department}</td>
                                <td style={{ padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                        {(emp.skills || []).slice(0, 3).map(s => (
                                            <span key={s} className="badge badge-skill">{s}</span>
                                        ))}
                                        {(emp.skills || []).length > 3 && (
                                            <span className="badge" style={{ background: '#27272a', color: '#71717a' }}>+{emp.skills.length - 3}</span>
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
                                    ) : <span style={{ fontSize: 12, color: '#3f3f46' }}>—</span>}
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
                                        <button onClick={() => handleDelete(emp.id)} className="btn-ghost" style={{ padding: '6px 8px', color: '#ef4444' }}>
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
                        <HiOutlineUserGroup size={36} style={{ color: '#27272a', margin: '0 auto 10px', display: 'block' }} />
                        <p style={{ color: '#3f3f46', fontSize: 13 }}>No employees yet. Click "Add Employee" to start.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fafafa' }}>{editId ? 'Edit Employee' : 'Add Employee'}</h2>
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
                                    <label style={{ fontSize: 12, fontWeight: 500, color: '#a1a1aa', marginBottom: 5, display: 'block' }}>{f.label}</label>
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
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fafafa' }}>
                                {aiPanel.type === 'productivity' ? 'Productivity Score' : 'Skill Gap Analysis'}
                            </h2>
                            <button onClick={() => setAiPanel(null)} className="btn-ghost"><HiOutlineX size={18} /></button>
                        </div>

                        {aiPanel.type === 'productivity' && (
                            <div>
                                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                    <p style={{ fontSize: 44, fontWeight: 800, color: scoreColor(aiPanel.data.score), letterSpacing: '-0.03em' }}>{aiPanel.data.score}</p>
                                    <p style={{ fontSize: 13, color: '#71717a', marginTop: 2 }}>{aiPanel.data.rating} Performance</p>
                                    {aiPanel.data.message && <p style={{ fontSize: 12, color: '#52525b', marginTop: 6 }}>{aiPanel.data.message}</p>}
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
                                        <div key={i} style={{ padding: 12, background: '#0f0f11', borderRadius: 8, textAlign: 'center' }}>
                                            <p style={{ fontSize: 18, fontWeight: 700, color: '#e4e4e7' }}>{item.value}</p>
                                            <p style={{ fontSize: 11, color: '#52525b', marginTop: 2 }}>{item.label}</p>
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
                                    <p style={{ fontSize: 13, color: '#71717a' }}>Skill Match · {aiPanel.data.level}</p>
                                </div>
                                <div className="progress-bar" style={{ marginBottom: 20 }}>
                                    <div className="progress-fill" style={{ width: `${aiPanel.data.matchPercentage}%`, background: '#6366f1' }} />
                                </div>
                                {aiPanel.data.matchedSkills?.length > 0 && (
                                    <div style={{ marginBottom: 14 }}>
                                        <p style={{ fontSize: 12, fontWeight: 600, color: '#71717a', marginBottom: 6 }}>✓ Matched Skills</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {aiPanel.data.matchedSkills.map(s => <span key={s} className="badge badge-skill">{s}</span>)}
                                        </div>
                                    </div>
                                )}
                                {aiPanel.data.missingSkills?.length > 0 && (
                                    <div style={{ marginBottom: 14 }}>
                                        <p style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', marginBottom: 6 }}>✗ Missing Skills</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {aiPanel.data.missingSkills.map(s => <span key={s} className="badge badge-missing">{s}</span>)}
                                        </div>
                                    </div>
                                )}
                                {aiPanel.data.suggestedCourses?.length > 0 && (
                                    <div>
                                        <p style={{ fontSize: 12, fontWeight: 600, color: '#71717a', marginBottom: 6 }}>Suggested Courses</p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            {aiPanel.data.suggestedCourses.map((c, i) => (
                                                <div key={i} style={{ padding: '8px 12px', background: '#0f0f11', borderRadius: 6, fontSize: 12, color: '#a1a1aa' }}>{c}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
        </div>
    );
}

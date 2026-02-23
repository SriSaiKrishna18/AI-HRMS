import { useState, useEffect } from 'react';
import api from '../services/api';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineChartBar, HiOutlinePuzzle, HiOutlineX, HiOutlineUserGroup } from 'react-icons/hi';

export default function EmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', role: '', department: '', skills: '', wallet_address: '' });
    const [aiScores, setAiScores] = useState({}); // { empId: { score, rating } }
    const [aiPanel, setAiPanel] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => { fetchEmployees(); }, []);

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/employees');
            const emps = res.data.employees;
            setEmployees(emps);
            // Auto-load AI scores for all employees
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
        const payload = {
            ...form,
            skills: form.skills.split(',').map(s => s.trim()).filter(Boolean)
        };
        try {
            if (editId) {
                await api.put(`/employees/${editId}`, payload);
                showToast('Employee updated');
            } else {
                await api.post('/employees', payload);
                showToast('Employee added');
            }
            setShowModal(false);
            setEditId(null);
            setForm({ name: '', email: '', role: '', department: '', skills: '', wallet_address: '' });
            fetchEmployees();
        } catch (err) {
            showToast(err.response?.data?.error || 'Error', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (emp) => {
        setEditId(emp.id);
        setForm({
            name: emp.name, email: emp.email, role: emp.role, department: emp.department,
            skills: (emp.skills || []).join(', '),
            wallet_address: emp.wallet_address || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this employee?')) return;
        try {
            await api.delete(`/employees/${id}`);
            showToast('Employee removed');
            fetchEmployees();
        } catch (err) { showToast('Error removing', 'error'); }
    };

    const fetchProductivity = async (empId) => {
        try {
            const res = await api.get(`/ai/productivity/${empId}`);
            setAiPanel({ type: 'productivity', data: res.data });
        } catch (err) { showToast('Error loading AI data', 'error'); }
    };

    const fetchSkillGap = async (empId) => {
        try {
            const res = await api.get(`/ai/skill-gap/${empId}`);
            setAiPanel({ type: 'skillgap', data: res.data });
        } catch (err) { showToast('Error loading AI data', 'error'); }
    };

    const scoreColor = (score) => score >= 85 ? '#34d399' : score >= 70 ? '#60a5fa' : score >= 50 ? '#fbbf24' : '#f87171';

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto 16px', width: 32, height: 32 }} />
                    <p style={{ color: '#64748b', fontSize: 14 }}>Loading employees...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header-responsive" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>Employees</h1>
                    <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{employees.length} total members</p>
                </div>
                <button className="btn-primary" onClick={() => { setEditId(null); setForm({ name: '', email: '', role: '', department: '', skills: '', wallet_address: '' }); setShowModal(true); }}>
                    <HiOutlinePlus size={18} /> Add Employee
                </button>
            </div>

            {/* Employee Table */}
            <div className="glass table-wrap" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                            {['Name', 'Role', 'Department', 'Skills', 'Score', 'AI Insights', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => (
                            <tr key={emp.id} className="table-row" style={{ borderBottom: '1px solid rgba(148,163,184,0.05)' }}>
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 14, fontWeight: 600, color: 'white'
                                        }}>{emp.name.charAt(0)}</div>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: 14, color: '#e2e8f0' }}>{emp.name}</p>
                                            <p style={{ fontSize: 12, color: '#64748b' }}>{emp.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 20px', fontSize: 14, color: '#94a3b8' }}>{emp.role}</td>
                                <td style={{ padding: '16px 20px', fontSize: 14, color: '#94a3b8' }}>{emp.department}</td>
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                        {(emp.skills || []).slice(0, 3).map(s => (
                                            <span key={s} className="badge badge-skill">{s}</span>
                                        ))}
                                        {(emp.skills || []).length > 3 && (
                                            <span className="badge" style={{ background: 'rgba(51,65,85,0.5)', color: '#94a3b8' }}>+{emp.skills.length - 3}</span>
                                        )}
                                    </div>
                                </td>
                                {/* Inline AI Score */}
                                <td style={{ padding: '16px 20px' }}>
                                    {aiScores[emp.id] ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div className="progress-bar" style={{ width: 60 }}>
                                                <div className="progress-fill" style={{ width: `${aiScores[emp.id].score}%`, background: scoreColor(aiScores[emp.id].score) }} />
                                            </div>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: scoreColor(aiScores[emp.id].score) }}>
                                                {aiScores[emp.id].score}
                                            </span>
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: 12, color: '#475569' }}>—</span>
                                    )}
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button onClick={() => fetchProductivity(emp.id)} title="Productivity Score"
                                            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', padding: '6px 8px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }}>
                                            <HiOutlineChartBar size={16} />
                                        </button>
                                        <button onClick={() => fetchSkillGap(emp.id)} title="Skill Gap Analysis"
                                            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', padding: '6px 8px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }}>
                                            <HiOutlinePuzzle size={16} />
                                        </button>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button onClick={() => handleEdit(emp)}
                                            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa', padding: '6px 8px', borderRadius: 8, cursor: 'pointer' }}>
                                            <HiOutlinePencil size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(emp.id)}
                                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '6px 8px', borderRadius: 8, cursor: 'pointer' }}>
                                            <HiOutlineTrash size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {employees.length === 0 && (
                    <div style={{ padding: 48, textAlign: 'center' }}>
                        <HiOutlineUserGroup size={40} style={{ color: '#334155', margin: '0 auto 12px', display: 'block' }} />
                        <p style={{ color: '#475569', fontSize: 14 }}>No employees yet. Click "Add Employee" to start.</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>{editId ? 'Edit Employee' : 'Add Employee'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><HiOutlineX size={20} /></button>
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
                                <div key={f.key} style={{ marginBottom: 16 }}>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6, display: 'block' }}>{f.label}</label>
                                    <input className="input" type={f.type} placeholder={f.placeholder} required={f.required}
                                        value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                                </div>
                            ))}
                            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                                <button type="submit" className="btn-primary" disabled={submitting} style={{ flex: 1, justifyContent: 'center', opacity: submitting ? 0.7 : 1 }}>
                                    {submitting ? <><div className="spinner" /> Saving...</> : editId ? 'Update' : 'Add Employee'}
                                </button>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* AI Insight Panel */}
            {aiPanel && (
                <div className="modal-overlay" onClick={() => setAiPanel(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>
                                {aiPanel.type === 'productivity' ? '📊 Productivity Score' : '🧩 Skill Gap Analysis'}
                            </h2>
                            <button onClick={() => setAiPanel(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><HiOutlineX size={20} /></button>
                        </div>

                        {aiPanel.type === 'productivity' && (
                            <div>
                                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                    <p style={{ fontSize: 48, fontWeight: 800, color: scoreColor(aiPanel.data.score) }}>{aiPanel.data.score}</p>
                                    <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>{aiPanel.data.rating} Performance</p>
                                    {aiPanel.data.message && <p style={{ fontSize: 13, color: '#64748b', marginTop: 8, fontStyle: 'italic' }}>{aiPanel.data.message}</p>}
                                </div>
                                <div className="progress-bar" style={{ marginBottom: 20 }}>
                                    <div className="progress-fill" style={{ width: `${aiPanel.data.score}%`, background: `linear-gradient(90deg, ${scoreColor(aiPanel.data.score)}, ${scoreColor(aiPanel.data.score)}88)` }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    {[
                                        { label: 'Tasks Completed', value: aiPanel.data.details.completedTasks },
                                        { label: 'Total Tasks', value: aiPanel.data.details.totalTasks },
                                        { label: 'Completion Rate', value: `${aiPanel.data.details.completionRate}%` },
                                        { label: 'On-Time Rate', value: `${aiPanel.data.details.deadlineAdherence}%` },
                                    ].map((item, i) => (
                                        <div key={i} className="glass-light" style={{ padding: 14, textAlign: 'center' }}>
                                            <p style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0' }}>{item.value}</p>
                                            <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{item.label}</p>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: 16, textAlign: 'center' }}>
                                    <span className={`badge ${aiPanel.data.trend === 'improving' ? 'status-completed' : aiPanel.data.trend === 'declining' ? 'badge-missing' : 'badge-skill'}`}>
                                        Trend: {aiPanel.data.trend}
                                    </span>
                                </div>
                            </div>
                        )}

                        {aiPanel.type === 'skillgap' && (
                            <div>
                                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                    <p style={{ fontSize: 36, fontWeight: 800, color: scoreColor(aiPanel.data.matchPercentage) }}>{aiPanel.data.matchPercentage}%</p>
                                    <p style={{ fontSize: 14, color: '#94a3b8' }}>Skill Match · {aiPanel.data.level}</p>
                                </div>
                                <div className="progress-bar" style={{ marginBottom: 24 }}>
                                    <div className="progress-fill" style={{ width: `${aiPanel.data.matchPercentage}%`, background: `linear-gradient(90deg, #6366f1, #34d399)` }} />
                                </div>

                                {aiPanel.data.matchedSkills?.length > 0 && (
                                    <div style={{ marginBottom: 16 }}>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>✅ Matched Skills</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {aiPanel.data.matchedSkills.map(s => <span key={s} className="badge badge-skill">{s}</span>)}
                                        </div>
                                    </div>
                                )}

                                {aiPanel.data.missingSkills?.length > 0 && (
                                    <div style={{ marginBottom: 16 }}>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: '#f87171', marginBottom: 8 }}>⚠️ Missing Skills</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {aiPanel.data.missingSkills.map(s => <span key={s} className="badge badge-missing">{s}</span>)}
                                        </div>
                                    </div>
                                )}

                                {aiPanel.data.suggestedCourses?.length > 0 && (
                                    <div>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>📚 Suggested Courses</p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {aiPanel.data.suggestedCourses.map((c, i) => (
                                                <div key={i} className="glass-light" style={{ padding: '10px 14px', fontSize: 13, color: '#e2e8f0' }}>
                                                    {c}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
        </div>
    );
}

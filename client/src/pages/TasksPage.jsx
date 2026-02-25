import { useState, useEffect } from 'react';
import api from '../services/api';
import web3Service from '../services/web3';
import { HiOutlinePlus, HiOutlineX, HiOutlineExternalLink, HiOutlineClipboardList, HiOutlineLightningBolt } from 'react-icons/hi';

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ employee_id: '', title: '', description: '', deadline: '', required_skills: '' });
    const [filter, setFilter] = useState({ status: '', employee_id: '' });
    const [toast, setToast] = useState(null);
    const [aiSuggestions, setAiSuggestions] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [walletAddr, setWalletAddr] = useState(web3Service.getAddress());

    const connectWallet = async () => {
        try {
            const result = await web3Service.connectWallet();
            setWalletAddr(result.address);
            showToast(`Wallet connected: ${result.address.slice(0, 6)}...${result.address.slice(-4)}`);
        } catch (err) { showToast(err.message, 'error'); }
    };

    const isOverdue = (task) => task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completed';


    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [tasksRes, empRes] = await Promise.all([api.get('/tasks'), api.get('/employees')]);
            setTasks(tasksRes.data.tasks);
            setEmployees(empRes.data.employees);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks', form);
            showToast('Task assigned');
            setShowModal(false);
            setForm({ employee_id: '', title: '', description: '', deadline: '', required_skills: '' });
            setAiSuggestions(null);
            fetchData();
        } catch (err) { showToast(err.response?.data?.error || 'Error', 'error'); }
    };

    const handleStatusChange = async (taskId, newStatus, employeeId) => {
        try {
            await api.put(`/tasks/${taskId}/status`, { status: newStatus });
            showToast(`Status â†’ ${newStatus.replace('_', ' ')}`);
            if (newStatus === 'completed' && web3Service.getAddress()) {
                try {
                    showToast('Logging to blockchain...', 'success');
                    const result = await web3Service.logTaskOnChain(employeeId, taskId);
                    await api.put(`/tasks/${taskId}/tx-hash`, { tx_hash: result.txHash });
                    showToast('âœ… Logged on Sepolia!');
                } catch (web3Err) {
                    console.error('Web3 logging failed:', web3Err);
                    showToast(`Web3: ${web3Err.message || web3Err}`, 'error');
                }
            }
            fetchData();
        } catch (err) { showToast(err.response?.data?.error || 'Cannot change status', 'error'); }
    };

    const fetchSmartSuggestions = async () => {
        const skills = form.required_skills?.trim();
        if (!skills) { showToast('Enter required skills first', 'error'); return; }
        setAiLoading(true);
        try {
            const res = await api.get(`/ai/suggest-assignment?skills=${encodeURIComponent(skills)}`);
            setAiSuggestions(res.data);
        } catch (err) { showToast('AI suggestion failed', 'error'); }
        finally { setAiLoading(false); }
    };

    const filteredTasks = tasks.filter(t => {
        if (filter.status && t.status !== filter.status) return false;
        if (filter.employee_id && t.employee_id !== parseInt(filter.employee_id)) return false;
        return true;
    });

    const statusCounts = {
        all: tasks.length,
        assigned: tasks.filter(t => t.status === 'assigned').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
    };

    const nextStatus = { assigned: 'in_progress', in_progress: 'completed' };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px', width: 28, height: 28 }} />
                    <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>Loading tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in">
            {/* Header */}
            <div className="page-header-responsive" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Tasks</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>{tasks.length} total tasks</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {walletAddr ? (
                        <span className="badge badge-skill" style={{ fontSize: 11 }}>
                            ðŸ¦Š {walletAddr.slice(0, 6)}â€¦{walletAddr.slice(-4)}
                        </span>
                    ) : (
                        <button className="btn-ghost" onClick={connectWallet}>
                            ðŸ¦Š Connect Wallet
                        </button>
                    )}
                    <button className="btn-primary" onClick={() => setShowModal(true)}>
                        <HiOutlinePlus size={16} /> Assign Task
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-row-responsive" style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {[
                    { key: '', label: `All (${statusCounts.all})` },
                    { key: 'assigned', label: `Assigned (${statusCounts.assigned})` },
                    { key: 'in_progress', label: `In Progress (${statusCounts.in_progress})` },
                    { key: 'completed', label: `Done (${statusCounts.completed})` },
                ].map(f => (
                    <button key={f.key}
                        onClick={() => setFilter({ ...filter, status: f.key })}
                        style={{
                            padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500,
                            cursor: 'pointer', transition: 'all 0.15s',
                            background: filter.status === f.key ? 'var(--bg-hover)' : 'transparent',
                            border: `1px solid ${filter.status === f.key ? 'var(--text-faint)' : 'var(--bg-hover)'}`,
                            color: filter.status === f.key ? 'var(--text-primary)' : 'var(--text-muted)'
                        }}>
                        {f.label}
                    </button>
                ))}

                {employees.length > 0 && (
                    <select value={filter.employee_id}
                        onChange={e => setFilter({ ...filter, employee_id: e.target.value })}
                        className="input" style={{ width: 180, padding: '6px 12px', fontSize: 12, borderRadius: 100 }}>
                        <option value="">All Employees</option>
                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                    </select>
                )}
            </div>

            {/* Task Cards */}
            <div className="task-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
                {filteredTasks.map(task => (
                    <div key={task.id} className="card card-hover" style={{ padding: 20, borderLeft: isOverdue(task) ? '3px solid #ef4444' : undefined }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <span className={`badge status-${task.status}`} style={{ fontSize: 11 }}>
                                    {task.status.replace('_', ' ')}
                                </span>
                                {isOverdue(task) && (
                                    <span style={{ fontSize: 10, color: 'var(--danger)', fontWeight: 600 }}>âš  OVERDUE</span>
                                )}
                            </div>
                            {task.deadline && (
                                <span style={{ fontSize: 11, color: isOverdue(task) ? 'var(--danger)' : 'var(--text-dim)' }}>
                                    Due {new Date(task.deadline).toLocaleDateString()}
                                </span>
                            )}
                        </div>

                        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{task.title}</h3>
                        {task.description && (
                            <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 12, lineHeight: 1.5 }}>{task.description}</p>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                            <div style={{
                                width: 22, height: 22, borderRadius: '50%',
                                background: 'var(--bg-hover)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)'
                            }}>{task.employee_name?.charAt(0)}</div>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{task.employee_name}</span>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            {nextStatus[task.status] && (
                                <button onClick={() => handleStatusChange(task.id, nextStatus[task.status], task.employee_id)}
                                    className="btn-primary" style={{ fontSize: 12, padding: '5px 12px' }}>
                                    â†’ {nextStatus[task.status].replace('_', ' ')}
                                </button>
                            )}
                            {task.tx_hash && (
                                <a href={`https://sepolia.etherscan.io/tx/${task.tx_hash}`} target="_blank" rel="noreferrer"
                                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>
                                    <HiOutlineExternalLink size={13} /> Etherscan
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredTasks.length === 0 && !loading && (
                <div className="card" style={{ padding: 48, textAlign: 'center' }}>
                    <HiOutlineClipboardList size={36} style={{ color: 'var(--bg-hover)', margin: '0 auto 10px', display: 'block' }} />
                    <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>
                        {tasks.length === 0 ? 'No tasks yet. Assign a task to get started.' : 'No tasks match the current filter.'}
                    </p>
                </div>
            )}

            {/* Create Task Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Assign Task</h2>
                            <button onClick={() => setShowModal(false)} className="btn-ghost"><HiOutlineX size={18} /></button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>Task Title</label>
                                <input className="input" required placeholder="Design homepage UI" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>Description</label>
                                <textarea className="input" rows={2} placeholder="Details..." style={{ resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>Required Skills</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input className="input" style={{ flex: 1 }} placeholder="React, Node.js, Docker" value={form.required_skills} onChange={e => setForm({ ...form, required_skills: e.target.value })} />
                                    <button type="button" onClick={fetchSmartSuggestions} disabled={aiLoading}
                                        style={{
                                            padding: '8px 14px', border: '1px solid #6366f1', borderRadius: 8,
                                            background: 'rgba(99,102,241,0.1)', color: 'var(--accent)', fontSize: 12, fontWeight: 600,
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                                            opacity: aiLoading ? 0.5 : 1
                                        }}>
                                        {aiLoading ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <HiOutlineLightningBolt size={14} />}
                                        Smart Assign
                                    </button>
                                </div>
                            </div>

                            {/* AI Suggestions Panel */}
                            {aiSuggestions && aiSuggestions.suggestions?.length > 0 && (
                                <div style={{ marginBottom: 16, padding: 12, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid #27272a' }}>
                                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                        âš¡ AI Recommendations
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {aiSuggestions.suggestions.map((s, i) => (
                                            <div key={s.employeeId} onClick={() => { setForm({ ...form, employee_id: String(s.employeeId) }); showToast(`Selected ${s.name}`); }}
                                                style={{
                                                    padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                                                    background: form.employee_id === String(s.employeeId) ? 'rgba(99,102,241,0.15)' : 'var(--bg-card)',
                                                    border: form.employee_id === String(s.employeeId) ? '1px solid #6366f1' : '1px solid #27272a',
                                                    transition: 'all 0.15s'
                                                }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <span style={{
                                                            fontSize: 11, fontWeight: 700, color: i === 0 ? '#22c55e' : i === 1 ? '#3b82f6' : '#eab308',
                                                            background: i === 0 ? 'rgba(34,197,94,0.1)' : i === 1 ? 'rgba(59,130,246,0.1)' : 'rgba(234,179,8,0.1)',
                                                            padding: '2px 6px', borderRadius: 4
                                                        }}>#{i + 1}</span>
                                                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
                                                        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{s.role}</span>
                                                    </div>
                                                    <span style={{ fontSize: 18, fontWeight: 800, color: s.compositeScore >= 70 ? '#22c55e' : s.compositeScore >= 50 ? '#3b82f6' : '#eab308' }}>{s.compositeScore}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                    {s.reasons.map((r, j) => (
                                                        <span key={j} style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '2px 6px', borderRadius: 4 }}>{r}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 8, textAlign: 'center' }}>
                                        {aiSuggestions.algorithm?.description}
                                    </p>
                                </div>
                            )}

                            <div style={{ marginBottom: 14 }}>
                                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>Employee</label>
                                <select className="input" required value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })}>
                                    <option value="">Select employee...</option>
                                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} â€” {emp.role}</option>)}
                                </select>
                            </div>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>Deadline</label>
                                <input className="input" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Assign Task</button>
                                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); setAiSuggestions(null); }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
        </div>
    );
}


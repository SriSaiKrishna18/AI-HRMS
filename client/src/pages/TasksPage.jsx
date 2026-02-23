import { useState, useEffect } from 'react';
import api from '../services/api';
import web3Service from '../services/web3';
import { HiOutlinePlus, HiOutlineX, HiOutlineExternalLink } from 'react-icons/hi';

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ employee_id: '', title: '', description: '', deadline: '' });
    const [filter, setFilter] = useState({ status: '', employee_id: '' });
    const [toast, setToast] = useState(null);

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
            setForm({ employee_id: '', title: '', description: '', deadline: '' });
            fetchData();
        } catch (err) { showToast(err.response?.data?.error || 'Error', 'error'); }
    };

    const handleStatusChange = async (taskId, newStatus, employeeId) => {
        try {
            await api.put(`/tasks/${taskId}/status`, { status: newStatus });
            showToast(`Status → ${newStatus.replace('_', ' ')}`);

            // If completing a task and wallet is connected, log on-chain
            if (newStatus === 'completed' && web3Service.getAddress()) {
                try {
                    showToast('Logging to blockchain...', 'success');
                    const result = await web3Service.logTaskOnChain(employeeId, taskId);
                    await api.put(`/tasks/${taskId}/tx-hash`, { tx_hash: result.txHash });
                    showToast('✅ Logged on Sepolia!');
                } catch (web3Err) {
                    console.error('Web3 logging failed:', web3Err);
                    showToast('Task completed (Web3 log skipped)', 'error');
                }
            }

            fetchData();
        } catch (err) { showToast(err.response?.data?.error || 'Cannot change status', 'error'); }
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

    return (
        <div className="animate-fade-in">
            <div className="page-header-responsive" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>Tasks</h1>
                    <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{tasks.length} total tasks</p>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    <HiOutlinePlus size={18} /> Assign Task
                </button>
            </div>

            {/* Filters */}
            <div className="filter-row-responsive" style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                {[
                    { key: '', label: `All (${statusCounts.all})` },
                    { key: 'assigned', label: `Assigned (${statusCounts.assigned})` },
                    { key: 'in_progress', label: `In Progress (${statusCounts.in_progress})` },
                    { key: 'completed', label: `Completed (${statusCounts.completed})` },
                ].map(f => (
                    <button key={f.key}
                        onClick={() => setFilter({ ...filter, status: f.key })}
                        style={{
                            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                            cursor: 'pointer', transition: 'all 0.2s',
                            background: filter.status === f.key ? 'rgba(99,102,241,0.15)' : 'rgba(51,65,85,0.3)',
                            border: `1px solid ${filter.status === f.key ? 'rgba(99,102,241,0.3)' : 'rgba(148,163,184,0.1)'}`,
                            color: filter.status === f.key ? '#a5b4fc' : '#94a3b8'
                        }}>
                        {f.label}
                    </button>
                ))}

                {employees.length > 0 && (
                    <select
                        value={filter.employee_id}
                        onChange={e => setFilter({ ...filter, employee_id: e.target.value })}
                        className="input"
                        style={{ width: 200, padding: '8px 12px' }}
                    >
                        <option value="">All Employees</option>
                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                    </select>
                )}
            </div>

            {/* Task Cards */}
            <div className="task-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                {filteredTasks.map(task => (
                    <div key={task.id} className="glass stat-card" style={{ padding: 22 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                            <span className={`badge status-${task.status}`} style={{ fontSize: 11 }}>
                                {task.status.replace('_', ' ')}
                            </span>
                            {task.deadline && (
                                <span style={{ fontSize: 12, color: '#64748b' }}>
                                    Due: {new Date(task.deadline).toLocaleDateString()}
                                </span>
                            )}
                        </div>

                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{task.title}</h3>
                        {task.description && <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12, lineHeight: 1.5 }}>{task.description}</p>}

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                            <div style={{
                                width: 24, height: 24, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 600, color: 'white'
                            }}>{task.employee_name?.charAt(0)}</div>
                            <span style={{ fontSize: 13, color: '#94a3b8' }}>{task.employee_name}</span>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            {nextStatus[task.status] && (
                                <button
                                    onClick={() => handleStatusChange(task.id, nextStatus[task.status], task.employee_id)}
                                    className="btn-primary"
                                    style={{ fontSize: 12, padding: '6px 14px' }}
                                >
                                    → {nextStatus[task.status].replace('_', ' ')}
                                </button>
                            )}
                            {task.tx_hash && (
                                <a href={`https://sepolia.etherscan.io/tx/${task.tx_hash}`} target="_blank" rel="noreferrer"
                                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#818cf8', textDecoration: 'none' }}>
                                    <HiOutlineExternalLink size={14} /> Tx
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredTasks.length === 0 && !loading && (
                <div className="glass" style={{ padding: 48, textAlign: 'center' }}>
                    <p style={{ color: '#475569', fontSize: 14 }}>
                        {tasks.length === 0 ? 'No tasks yet. Assign a task to get started.' : 'No tasks match the current filter.'}
                    </p>
                </div>
            )}

            {/* Create Task Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>Assign Task</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><HiOutlineX size={20} /></button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Employee</label>
                                <select className="input" required value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })}>
                                    <option value="">Select employee...</option>
                                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} — {emp.role}</option>)}
                                </select>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Task Title</label>
                                <input className="input" required placeholder="Design homepage UI" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Description</label>
                                <textarea className="input" rows={3} placeholder="Task details..." style={{ resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Deadline</label>
                                <input className="input" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Assign Task</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
        </div>
    );
}

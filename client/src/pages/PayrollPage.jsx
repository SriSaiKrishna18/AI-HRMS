import { useState, useEffect } from 'react';
import api from '../services/api';
import web3Service from '../services/web3';
import { HiOutlineCurrencyDollar, HiOutlineTrendingUp, HiOutlineUserGroup, HiOutlineCalendar, HiOutlinePlus } from 'react-icons/hi';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const tipStyle = {
    background: 'var(--bg-card)', border: '1px solid var(--border-default)',
    borderRadius: 8, color: 'var(--text-primary)', fontSize: 12
};

export default function PayrollPage() {
    const [records, setRecords] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ employee_id: '', amount: '', period: '', notes: '' });
    const [submitting, setSubmitting] = useState(false);
    const [txLoading, setTxLoading] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [payrollRes, empRes] = await Promise.all([
                api.get('/payroll'),
                api.get('/employees')
            ]);
            setRecords(payrollRes.data);
            setEmployees(empRes.data);
        } catch (err) { console.error('Payroll load failed:', err); }
        finally { setLoading(false); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/payroll', {
                employee_id: Number(form.employee_id),
                amount: Number(form.amount),
                period: form.period,
                notes: form.notes
            });
            setForm({ employee_id: '', amount: '', period: '', notes: '' });
            setShowForm(false);
            fetchData();
        } catch (err) { alert(err.response?.data?.error || 'Failed to create payroll'); }
        finally { setSubmitting(false); }
    };

    const handleLogOnChain = async (record) => {
        setTxLoading(record.id);
        try {
            const result = await web3Service.logTaskOnChain(
                record.wallet_address || '0x0000000000000000000000000000000000000001',
                record.id
            );
            if (result?.txHash) {
                await api.put(`/payroll/${record.id}/tx`, { tx_hash: result.txHash });
                fetchData();
            }
        } catch (err) { console.error('On-chain log failed:', err); alert('On-chain logging failed. Make sure MetaMask is connected.'); }
        finally { setTxLoading(null); }
    };

    if (loading) {
        return (
            <div className="page-loader">
                <div className="spinner-lg" />
                <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>Loading payroll...</p>
            </div>
        );
    }

    // Stats
    const totalPayroll = records.reduce((sum, r) => sum + (r.amount || 0), 0);
    const avgSalary = records.length > 0 ? totalPayroll / records.length : 0;
    const onChainCount = records.filter(r => r.tx_hash).length;
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

    // Monthly trend data (group by period)
    const trendMap = {};
    records.forEach(r => {
        const key = r.period || 'Unknown';
        if (!trendMap[key]) trendMap[key] = { period: key, total: 0, count: 0 };
        trendMap[key].total += r.amount || 0;
        trendMap[key].count++;
    });
    const trendData = Object.values(trendMap).sort((a, b) => a.period.localeCompare(b.period)).slice(-6);

    const statCards = [
        { label: 'Total Payroll', value: `$${totalPayroll.toLocaleString()}`, icon: <HiOutlineCurrencyDollar size={20} />, color: '#22c55e' },
        { label: 'Average Salary', value: `$${Math.round(avgSalary).toLocaleString()}`, icon: <HiOutlineTrendingUp size={20} />, color: '#3b82f6' },
        { label: 'Employees Paid', value: records.length, icon: <HiOutlineUserGroup size={20} />, color: '#8b5cf6' },
        { label: 'On-Chain Verified', value: onChainCount, icon: <HiOutlineCalendar size={20} />, color: '#f59e0b' },
    ];

    return (
        <div className="animate-in">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Payroll</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>Manage employee salaries and on-chain verification</p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <HiOutlinePlus size={16} /> Process Payroll
                </button>
            </div>

            {/* Stats */}
            <div className="stagger-children" style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20
            }}>
                {statCards.map((card, i) => (
                    <div key={i} className="card card-hover stat-card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: 10,
                                background: `${card.color}15`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: card.color
                            }}>{card.icon}</div>
                        </div>
                        <p className="stat-value" style={{ color: card.color }}>{card.value}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="card" style={{ padding: 22, marginBottom: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Process New Payroll</h3>
                    <form onSubmit={handleCreate}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                            <select className="input" value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })} required>
                                <option value="">Select Employee</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name} — {emp.role}</option>
                                ))}
                            </select>
                            <input className="input" type="number" placeholder="Amount ($)" value={form.amount}
                                onChange={e => setForm({ ...form, amount: e.target.value })} required min="0" step="0.01" />
                            <input className="input" type="text" placeholder="Period (e.g. 2026-02)" value={form.period}
                                onChange={e => setForm({ ...form, period: e.target.value })} required />
                            <input className="input" type="text" placeholder="Notes (optional)" value={form.notes}
                                onChange={e => setForm({ ...form, notes: e.target.value })} />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button type="submit" className="btn-primary" disabled={submitting}>
                                {submitting ? 'Processing...' : 'Submit Payroll'}
                            </button>
                            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Payroll Trend Chart */}
            {trendData.length > 0 && (
                <div className="card glass-card" style={{ padding: 22, marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <div style={{ width: 3, height: 20, borderRadius: 2, background: 'linear-gradient(to bottom, #22c55e, #3b82f6)' }} />
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Payroll Trend</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                            <XAxis dataKey="period" stroke="var(--text-dim)" fontSize={10} />
                            <YAxis stroke="var(--text-dim)" fontSize={10} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                            <Tooltip contentStyle={tipStyle} formatter={(v) => `$${Number(v).toLocaleString()}`} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="total" fill="#3b82f6" name="Total Payroll" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Payroll Records */}
            <div className="card" style={{ padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 3, height: 20, borderRadius: 2, background: 'linear-gradient(to bottom, #8b5cf6, #ec4899)' }} />
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Payroll Records</h3>
                </div>
                {records.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {records.map(record => (
                            <div key={record.id} className="card-hover" style={{
                                padding: '14px 16px', background: 'var(--bg-elevated)', borderRadius: 10,
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                                border: '1px solid var(--border-default)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        background: 'var(--bg-hover)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0
                                    }}>
                                        {record.employee_name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {record.employee_name || `Employee #${record.employee_id}`}
                                        </p>
                                        <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{record.period}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: 15, fontWeight: 700, color: '#22c55e' }}>${Number(record.amount).toLocaleString()}</p>
                                        {record.notes && <p style={{ fontSize: 10, color: 'var(--text-dim)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{record.notes}</p>}
                                    </div>

                                    {record.tx_hash ? (
                                        <a href={`https://sepolia.etherscan.io/tx/${record.tx_hash}`} target="_blank" rel="noopener noreferrer"
                                            className="badge" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', fontSize: 10, cursor: 'pointer', textDecoration: 'none' }}>
                                            ⛓ On-Chain
                                        </a>
                                    ) : (
                                        <button className="btn-ghost" onClick={() => handleLogOnChain(record)} disabled={txLoading === record.id}
                                            style={{ fontSize: 10, padding: '4px 10px', whiteSpace: 'nowrap' }}>
                                            {txLoading === record.id ? '⏳' : '⛓ Log'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>No payroll records yet. Click "Process Payroll" to get started.</p>
                )}
            </div>
        </div>
    );
}

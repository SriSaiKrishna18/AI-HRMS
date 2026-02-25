import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiOutlineLightningBolt, HiOutlineShieldCheck, HiOutlineCube, HiOutlineChartBar } from 'react-icons/hi';

export default function LoginPage() {
    const { login, register } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (isRegister && form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.');
            setLoading(false);
            return;
        }

        try {
            if (isRegister) {
                await register(form.name, form.email, form.password);
            } else {
                await login(form.email, form.password);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: HiOutlineChartBar, title: 'AI-Powered Analytics', desc: 'Productivity scores, skill gap detection, smart task assignment' },
        { icon: HiOutlineCube, title: 'Web3 Verification', desc: 'On-chain task logging & payroll proof via smart contracts' },
        { icon: HiOutlineLightningBolt, title: 'Real-time Dashboard', desc: 'Live metrics, workload indicators, performance trends' },
        { icon: HiOutlineShieldCheck, title: 'Enterprise Security', desc: 'JWT auth, rate limiting, input validation, encrypted storage' },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            background: 'var(--bg-body)',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background gradient orbs */}
            <div style={{
                position: 'absolute', top: '-20%', left: '-10%',
                width: '500px', height: '500px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '-20%', right: '-10%',
                width: '600px', height: '600px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            {/* Left Panel — Branding */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '60px',
                position: 'relative',
                zIndex: 1,
            }} className="page-header-responsive" id="login-branding">
                <div style={{ maxWidth: '480px' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        marginBottom: '32px',
                    }}>
                        <img src="/RizeOS.png" alt="RizeOS" style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
                        <span style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                            RizeOS
                        </span>
                    </div>

                    <h1 style={{
                        fontSize: '42px', fontWeight: '800', lineHeight: '1.1',
                        letterSpacing: '-0.04em', marginBottom: '16px',
                        color: 'var(--text-primary)',
                    }}>
                        Workforce intelligence, <span className="gradient-text">reimagined.</span>
                    </h1>

                    <p style={{
                        fontSize: '16px', lineHeight: '1.7', color: 'var(--text-muted)',
                        marginBottom: '40px',
                    }}>
                        AI-powered HR management with blockchain-verified workforce analytics.
                        Built for modern teams that demand transparency and performance.
                    </p>

                    <div style={{ display: 'grid', gap: '16px' }} className="stagger-children">
                        {features.map((f, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'flex-start', gap: '14px',
                                padding: '14px 16px', borderRadius: '12px',
                                background: 'var(--accent-bg)', border: '1px solid var(--border-subtle)',
                            }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '10px',
                                    background: 'var(--accent-gradient)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <f.icon size={18} color="white" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>
                                        {f.title}
                                    </div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                                        {f.desc}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div style={{
                width: '480px', minHeight: '100vh',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '40px',
                background: 'var(--bg-card)',
                borderLeft: '1px solid var(--border-default)',
                position: 'relative', zIndex: 1,
            }}>
                <div style={{ width: '100%', maxWidth: '360px' }} className="animate-in">
                    {/* Toggle */}
                    <div style={{
                        display: 'flex', marginBottom: '32px',
                        background: 'var(--bg-body)', borderRadius: '12px',
                        padding: '4px', border: '1px solid var(--border-default)',
                    }}>
                        <button
                            type="button"
                            onClick={() => { setIsRegister(false); setError(''); }}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '9px', border: 'none',
                                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                background: !isRegister ? 'var(--accent-gradient)' : 'transparent',
                                color: !isRegister ? 'white' : 'var(--text-muted)',
                                boxShadow: !isRegister ? '0 2px 8px rgba(99,102,241,0.25)' : 'none',
                            }}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsRegister(true); setError(''); }}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '9px', border: 'none',
                                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                background: isRegister ? 'var(--accent-gradient)' : 'transparent',
                                color: isRegister ? 'white' : 'var(--text-muted)',
                                boxShadow: isRegister ? '0 2px 8px rgba(99,102,241,0.25)' : 'none',
                            }}
                        >
                            Register
                        </button>
                    </div>

                    <h2 style={{
                        fontSize: '24px', fontWeight: '800', marginBottom: '8px',
                        letterSpacing: '-0.03em',
                    }}>
                        {isRegister ? 'Create your organization' : 'Welcome back'}
                    </h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px' }}>
                        {isRegister
                            ? 'Set up your AI-HRMS workspace in seconds'
                            : 'Sign in to your workforce intelligence platform'}
                    </p>

                    {error && (
                        <div style={{
                            padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
                            background: 'var(--danger-bg)', color: 'var(--danger-text)',
                            fontSize: '13px', fontWeight: '500',
                            border: '1px solid rgba(239,68,68,0.2)',
                            animation: 'slideUp 0.2s ease',
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {isRegister && (
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                                    Organization Name
                                </label>
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="e.g. Acme Corp"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    required
                                    autoComplete="organization"
                                />
                            </div>
                        )}

                        <div>
                            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                                Email Address
                            </label>
                            <input
                                className="input"
                                type="email"
                                placeholder="admin@company.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                                Password
                            </label>
                            <input
                                className="input"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                                minLength={6}
                                autoComplete={isRegister ? 'new-password' : 'current-password'}
                            />
                        </div>

                        {isRegister && (
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                                    Confirm Password
                                </label>
                                <input
                                    className="input"
                                    type="password"
                                    placeholder="••••••••"
                                    value={form.confirmPassword}
                                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{
                                width: '100%', justifyContent: 'center',
                                padding: '12px', fontSize: '15px', marginTop: '8px',
                            }}
                        >
                            {loading ? (
                                <><span className="spinner" /> Processing...</>
                            ) : (
                                isRegister ? 'Create Organization' : 'Sign In'
                            )}
                        </button>
                    </form>

                    {!isRegister && (
                        <div style={{
                            marginTop: '24px', padding: '14px 16px', borderRadius: '10px',
                            background: 'var(--accent-bg)', border: '1px solid var(--border-subtle)',
                        }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--accent)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Demo Credentials
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                admin@rizetech.com / demo123
                            </div>
                        </div>
                    )}

                    <p style={{
                        marginTop: '24px', fontSize: '12px', color: 'var(--text-dim)',
                        textAlign: 'center', lineHeight: '1.6',
                    }}>
                        Built with React · Node.js · SQLite · Ethereum
                    </p>
                </div>
            </div>

            {/* Mobile: Hide left panel */}
            <style>{`
                @media (max-width: 768px) {
                    #login-branding { display: none !important; }
                    #login-branding + div {
                        width: 100% !important;
                        border-left: none !important;
                    }
                }
            `}</style>
        </div>
    );
}

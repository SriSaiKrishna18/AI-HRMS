import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [coldStart, setColdStart] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setColdStart(false);
        const timer = setTimeout(() => setColdStart(true), 5000);
        try {
            if (isRegister) {
                await register(name, email, password);
            } else {
                await login(email, password);
            }
            clearTimeout(timer);
            navigate('/');
        } catch (err) {
            clearTimeout(timer);
            setColdStart(false);
            setError(err.response?.data?.error || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex' }}>
            {/* Left panel — branding */}
            <div style={{
                flex: 1,
                background: '#09090b',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '60px 48px',
                borderRight: '1px solid #27272a',
                position: 'relative',
                overflow: 'hidden'
            }}
                className="login-left-panel"
            >
                {/* Subtle grid pattern */}
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.03,
                    backgroundImage: 'radial-gradient(#fafafa 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    pointerEvents: 'none'
                }} />

                <div style={{ position: 'relative', zIndex: 1, maxWidth: 400 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        marginBottom: 48
                    }}>
                        <div style={{
                            width: 32, height: 32,
                            background: '#6366f1',
                            borderRadius: 8,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 16, fontWeight: 800, color: '#fff'
                        }}>R</div>
                        <span style={{ fontSize: 18, fontWeight: 700, color: '#fafafa', letterSpacing: '-0.02em' }}>RizeOS</span>
                    </div>

                    <h1 style={{
                        fontSize: 40, fontWeight: 700, color: '#fafafa',
                        lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: 20
                    }}>
                        Workforce intelligence,<br />
                        <span style={{ color: '#6366f1' }}>reimagined.</span>
                    </h1>

                    <p style={{ fontSize: 16, color: '#71717a', lineHeight: 1.6, marginBottom: 40 }}>
                        AI-powered productivity scoring, skill gap detection,
                        and on-chain task verification — all in one platform.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[
                            { icon: '📊', text: 'AI productivity scoring with trend analysis' },
                            { icon: '🧩', text: 'Smart skill gap detection & course suggestions' },
                            { icon: '⛓️', text: 'On-chain task logging via Ethereum Sepolia' }
                        ].map((feat, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ fontSize: 18 }}>{feat.icon}</span>
                                <span style={{ fontSize: 14, color: '#a1a1aa' }}>{feat.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right panel — form */}
            <div style={{
                width: 480,
                minWidth: 380,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '48px 40px',
                background: '#0a0a0c'
            }}
                className="login-right-panel"
            >
                <div style={{ maxWidth: 360, width: '100%', margin: '0 auto' }}>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fafafa', marginBottom: 6, letterSpacing: '-0.02em' }}>
                        {isRegister ? 'Create your workspace' : 'Welcome back'}
                    </h2>
                    <p style={{ color: '#71717a', fontSize: 14, marginBottom: 32 }}>
                        {isRegister ? 'Set up your organization to get started' : 'Sign in to continue to RizeOS'}
                    </p>

                    {error && (
                        <div style={{
                            background: '#2a1215',
                            border: '1px solid #7f1d1d',
                            color: '#fca5a5',
                            padding: '10px 14px',
                            borderRadius: 8,
                            fontSize: 13,
                            marginBottom: 20
                        }}>
                            {error}
                        </div>
                    )}

                    {coldStart && (
                        <div style={{
                            background: 'rgba(251,191,36,0.08)',
                            border: '1px solid rgba(251,191,36,0.2)',
                            color: '#fbbf24',
                            padding: '10px 14px',
                            borderRadius: 8,
                            fontSize: 12,
                            marginBottom: 20,
                            lineHeight: 1.5
                        }}>
                            ⏳ Server is waking up (free tier cold start — takes ~30s on first load). Please wait...
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {isRegister && (
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 6, display: 'block' }}>
                                    Organization name
                                </label>
                                <input className="input" placeholder="Acme Inc."
                                    value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                        )}

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 6, display: 'block' }}>
                                Email
                            </label>
                            <input className="input" type="email" placeholder="you@company.com"
                                value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>

                        <div style={{ marginBottom: 28 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 6, display: 'block' }}>
                                Password
                            </label>
                            <input className="input" type="password" placeholder="••••••••"
                                value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading}
                            style={{ width: '100%', justifyContent: 'center', padding: '12px 24px', fontSize: 14 }}>
                            {loading ? <><div className="spinner" /> {coldStart ? 'Waking server...' : 'Please wait...'}</> : (isRegister ? 'Create workspace' : 'Sign in')}
                        </button>

                        {!isRegister && (
                            <p style={{ fontSize: 11, color: '#3f3f46', textAlign: 'center', marginTop: 12 }}>
                                Demo: admin@rizetech.com / demo123
                            </p>
                        )}
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 24 }}>
                        <button
                            onClick={() => { setIsRegister(!isRegister); setError(''); }}
                            style={{
                                background: 'none', border: 'none', color: '#6366f1',
                                cursor: 'pointer', fontSize: 13, fontWeight: 500
                            }}
                        >
                            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Responsive: hide left panel on mobile */}
            <style>{`
                @media (max-width: 768px) {
                    .login-left-panel { display: none !important; }
                    .login-right-panel { width: 100% !important; min-width: unset !important; }
                }
            `}</style>
        </div>
    );
}

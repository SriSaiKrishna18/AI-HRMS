import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineCube, HiOutlineMail, HiOutlineLockClosed, HiOutlineOfficeBuilding } from 'react-icons/hi';

export default function LoginPage() {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isRegister) {
                await register(name, email, password);
            } else {
                await login(email, password);
            }
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: 'linear-gradient(135deg, #020617 0%, #0c1222 40%, #0f172a 100%)'
        }}>
            {/* Decorative orbs */}
            <div style={{
                position: 'fixed', width: 400, height: 400,
                background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
                top: -100, right: -100, borderRadius: '50%', pointerEvents: 'none'
            }} />
            <div style={{
                position: 'fixed', width: 300, height: 300,
                background: 'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)',
                bottom: -50, left: -50, borderRadius: '50%', pointerEvents: 'none'
            }} />

            <div className="animate-fade-in" style={{ width: '100%', maxWidth: 440 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{
                        width: 56, height: 56, margin: '0 auto 16px',
                        background: 'linear-gradient(135deg, #6366f1, #34d399)',
                        borderRadius: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <HiOutlineCube color="white" size={28} />
                    </div>
                    <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>
                        RizeOS
                    </h1>
                    <p style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>
                        AI-Powered HR Management System
                    </p>
                </div>

                {/* Card */}
                <div className="glass glow" style={{ padding: 36 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: '#f1f5f9' }}>
                        {isRegister ? 'Create Organization' : 'Welcome Back'}
                    </h2>
                    <p style={{ color: '#64748b', fontSize: 13, marginBottom: 28 }}>
                        {isRegister ? 'Set up your organization workspace' : 'Sign in to your workspace'}
                    </p>

                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            color: '#fca5a5',
                            padding: '10px 16px',
                            borderRadius: 10,
                            fontSize: 13,
                            marginBottom: 20
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {isRegister && (
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                                    Organization Name
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <HiOutlineOfficeBuilding style={{ position: 'absolute', left: 14, top: 14, color: '#475569' }} size={16} />
                                    <input
                                        className="input"
                                        style={{ paddingLeft: 40 }}
                                        placeholder="Acme Inc."
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                                Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <HiOutlineMail style={{ position: 'absolute', left: 14, top: 14, color: '#475569' }} size={16} />
                                <input
                                    className="input"
                                    style={{ paddingLeft: 40 }}
                                    type="email"
                                    placeholder="admin@company.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <HiOutlineLockClosed style={{ position: 'absolute', left: 14, top: 14, color: '#475569' }} size={16} />
                                <input
                                    className="input"
                                    style={{ paddingLeft: 40 }}
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{ width: '100%', justifyContent: 'center', padding: '14px 24px', fontSize: 15 }}
                        >
                            {loading ? 'Please wait...' : (isRegister ? 'Create Organization' : 'Sign In')}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 24 }}>
                        <button
                            onClick={() => { setIsRegister(!isRegister); setError(''); }}
                            style={{
                                background: 'none', border: 'none', color: '#818cf8',
                                cursor: 'pointer', fontSize: 13, fontWeight: 500
                            }}
                        >
                            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

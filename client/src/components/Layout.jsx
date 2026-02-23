import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WalletConnect from './WalletConnect';
import { HiOutlineViewGrid, HiOutlineUserGroup, HiOutlineClipboardList, HiOutlineLogout, HiOutlineCube, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const links = [
        { to: '/', icon: <HiOutlineViewGrid size={20} />, label: 'Dashboard' },
        { to: '/employees', icon: <HiOutlineUserGroup size={20} />, label: 'Employees' },
        { to: '/tasks', icon: <HiOutlineClipboardList size={20} />, label: 'Tasks' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Hamburger button (mobile only) */}
            <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <HiOutlineX size={22} /> : <HiOutlineMenu size={22} />}
            </button>

            {/* Sidebar overlay (mobile only) */}
            <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

            {/* Sidebar */}
            <aside className={`sidebar-mobile ${sidebarOpen ? 'open' : ''}`} style={{
                width: 260,
                padding: '24px 16px',
                borderRight: '1px solid rgba(99,102,241,0.1)',
                background: 'rgba(15,23,42,0.95)',
                backdropFilter: 'blur(20px)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 10
            }}>
                {/* Logo */}
                <div style={{ padding: '8px 16px', marginBottom: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36,
                            background: 'linear-gradient(135deg, #6366f1, #34d399)',
                            borderRadius: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <HiOutlineCube color="white" size={20} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }} className="gradient-text">RizeOS</h1>
                            <p style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>AI-HRMS Platform</p>
                        </div>
                    </div>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    {links.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.to === '/'}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            {link.icon}
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Web3 Wallet */}
                <div style={{ padding: '0 8px', marginBottom: 16 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, padding: '0 8px' }}>Web3</p>
                    <WalletConnect />
                </div>

                {/* User section */}
                <div style={{
                    padding: '16px',
                    borderTop: '1px solid rgba(148,163,184,0.1)',
                    marginTop: 'auto'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{
                            width: 36, height: 36,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, fontWeight: 600, color: 'white'
                        }}>
                            {user?.name?.charAt(0)?.toUpperCase() || 'O'}
                        </div>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{user?.name}</p>
                            <p style={{ fontSize: 11, color: '#64748b' }}>{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="btn-secondary"
                        style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '8px 12px' }}
                    >
                        <HiOutlineLogout size={16} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content-responsive" style={{
                flex: 1,
                marginLeft: 260,
                padding: '32px 40px',
                minHeight: '100vh'
            }}>
                <Outlet />
            </main>
        </div>
    );
}

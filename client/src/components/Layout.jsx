import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import WalletConnect from './WalletConnect';
import { HiOutlineViewGrid, HiOutlineUserGroup, HiOutlineClipboardList, HiOutlineLogout, HiOutlineMenu, HiOutlineX, HiOutlineMoon, HiOutlineSun, HiOutlineChartBar } from 'react-icons/hi';

export default function Layout() {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };

    const links = [
        { to: '/', icon: <HiOutlineViewGrid size={18} />, label: 'Dashboard' },
        { to: '/employees', icon: <HiOutlineUserGroup size={18} />, label: 'Employees' },
        { to: '/tasks', icon: <HiOutlineClipboardList size={18} />, label: 'Tasks' },
        { to: '/analytics', icon: <HiOutlineChartBar size={18} />, label: 'Analytics' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Hamburger (mobile) */}
            <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <HiOutlineX size={20} /> : <HiOutlineMenu size={20} />}
            </button>

            {/* Overlay (mobile) */}
            <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

            {/* Sidebar */}
            <aside className={`sidebar-mobile ${sidebarOpen ? 'open' : ''}`} style={{
                width: 240,
                padding: '20px 12px',
                borderRight: '1px solid var(--border-default)',
                background: 'var(--bg-sidebar)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0, left: 0, bottom: 0,
                zIndex: 10,
                transition: 'background 0.2s ease'
            }}>
                {/* Logo */}
                <div style={{ padding: '4px 14px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src="/RizeOS.png" alt="RizeOS" style={{ height: 28, width: 'auto', objectFit: 'contain' }} />
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>RizeOS</span>
                </div>

                {/* Navigation */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
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

                {/* Theme Toggle */}
                <div style={{ padding: '0 6px', marginBottom: 8 }}>
                    <button className="theme-toggle" onClick={toggleTheme}>
                        {isDark ? <HiOutlineSun size={16} /> : <HiOutlineMoon size={16} />}
                        {isDark ? 'Light Mode' : 'Dark Mode'}
                    </button>
                </div>

                {/* Web3 */}
                <div style={{ padding: '0 6px', marginBottom: 12 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, padding: '0 8px' }}>Web3</p>
                    <WalletConnect />
                </div>

                {/* User */}
                <div style={{ padding: '14px 10px', borderTop: '1px solid var(--border-default)', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <div style={{
                            width: 32, height: 32,
                            borderRadius: '50%',
                            background: 'var(--bg-hover)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)'
                        }}>
                            {user?.name?.charAt(0)?.toUpperCase() || 'O'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn-ghost"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', fontSize: 13 }}>
                        <HiOutlineLogout size={14} /> Sign out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="main-content-responsive" style={{
                flex: 1,
                marginLeft: 240,
                padding: '28px 36px',
                minHeight: '100vh'
            }}>
                <Outlet />
            </main>
        </div>
    );
}

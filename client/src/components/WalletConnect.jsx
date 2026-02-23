import { useState, useEffect } from 'react';
import web3Service from '../services/web3';
import { HiOutlineLink, HiOutlineLogout, HiOutlineExclamation } from 'react-icons/hi';
import { SiEthereum } from 'react-icons/si';

export default function WalletConnect({ onConnect, onDisconnect }) {
    const [wallet, setWallet] = useState(null);
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Listen for account changes
        web3Service.onAccountsChanged((accounts) => {
            if (accounts.length === 0) {
                handleDisconnect();
            } else {
                setWallet(prev => prev ? { ...prev, address: accounts[0] } : null);
            }
        });
    }, []);

    const handleConnect = async () => {
        setConnecting(true);
        setError('');
        try {
            const result = await web3Service.connectWallet();
            setWallet(result);
            onConnect?.(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setConnecting(false);
        }
    };

    const handleDisconnect = () => {
        web3Service.disconnect();
        setWallet(null);
        onDisconnect?.();
    };

    const shortenAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    if (!web3Service.isMetaMaskInstalled()) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
                borderRadius: 10, fontSize: 13, color: '#fbbf24'
            }}>
                <HiOutlineExclamation size={18} />
                <span>Install <a href="https://metamask.io" target="_blank" rel="noreferrer" style={{ color: '#818cf8', textDecoration: 'underline' }}>MetaMask</a> for Web3 features</span>
            </div>
        );
    }

    if (wallet) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 10
            }}>
                <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f97316, #eab308)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <SiEthereum size={14} color="white" />
                </div>
                <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#34d399' }}>{wallet.network}</p>
                    <p style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>{shortenAddress(wallet.address)}</p>
                </div>
                <button
                    onClick={handleDisconnect}
                    style={{
                        marginLeft: 'auto', background: 'none', border: 'none',
                        color: '#64748b', cursor: 'pointer', padding: 4
                    }}
                    title="Disconnect"
                >
                    <HiOutlineLogout size={16} />
                </button>
            </div>
        );
    }

    return (
        <div>
            <button
                onClick={handleConnect}
                disabled={connecting}
                style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 18px', borderRadius: 10,
                    background: 'linear-gradient(135deg, #f97316, #eab308)',
                    color: 'white', fontWeight: 600, fontSize: 13,
                    border: 'none', cursor: connecting ? 'wait' : 'pointer',
                    transition: 'all 0.2s', opacity: connecting ? 0.7 : 1,
                    width: '100%', justifyContent: 'center'
                }}
            >
                <HiOutlineLink size={16} />
                {connecting ? 'Connecting...' : 'Connect MetaMask'}
            </button>
            {error && (
                <p style={{ fontSize: 12, color: '#f87171', marginTop: 6 }}>{error}</p>
            )}
        </div>
    );
}

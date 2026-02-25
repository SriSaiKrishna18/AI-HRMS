import { useState, useEffect } from 'react';
import web3Service from '../services/web3';
import { HiOutlineCube, HiOutlineExternalLink } from 'react-icons/hi';

export default function WalletConnect({ onConnect, onDisconnect, compact = false }) {
    const [address, setAddress] = useState(web3Service.getAddress());
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState('');
    const [balance, setBalance] = useState(null);

    useEffect(() => {
        // Listen for account changes
        web3Service.onAccountsChanged((accounts) => {
            if (accounts.length === 0) {
                handleDisconnect();
            } else {
                setAddress(accounts[0]);
            }
        });

        web3Service.onChainChanged(() => {
            window.location.reload();
        });

        // Check if already connected
        if (web3Service.getAddress()) {
            setAddress(web3Service.getAddress());
            loadBalance();
        }
    }, []);

    const loadBalance = async () => {
        try {
            const bal = await web3Service.getBalance();
            setBalance(parseFloat(bal).toFixed(4));
        } catch { /* ignore */ }
    };

    const handleConnect = async () => {
        setConnecting(true);
        setError('');
        try {
            const result = await web3Service.connectWallet();
            setAddress(result.address);
            onConnect?.(result);
            await loadBalance();
        } catch (err) {
            setError(err.message || 'Failed to connect');
        } finally {
            setConnecting(false);
        }
    };

    const handleDisconnect = () => {
        web3Service.disconnect();
        setAddress(null);
        setBalance(null);
        onDisconnect?.();
    };

    if (!web3Service.isMetaMaskInstalled()) {
        return (
            <a
                href="https://metamask.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="wallet-badge wallet-badge-disconnected"
                style={{ textDecoration: 'none' }}
            >
                <HiOutlineCube size={14} />
                Install MetaMask
                <HiOutlineExternalLink size={12} />
            </a>
        );
    }

    // Connected state
    if (address) {
        const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;

        if (compact) {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="wallet-badge wallet-badge-connected">
                        <span className="pulse-dot pulse-dot-success" style={{ width: '6px', height: '6px' }} />
                        <span>{shortAddr}</span>
                    </div>
                    <button
                        onClick={handleDisconnect}
                        className="btn-ghost"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        title="Disconnect wallet"
                    >
                        ✕
                    </button>
                </div>
            );
        }

        return (
            <div className="card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="pulse-dot pulse-dot-success" />
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--success-text)' }}>Connected</span>
                    </div>
                    <div className="chain-badge">
                        <HiOutlineCube size={12} />
                        Sepolia
                    </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                        Wallet Address
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                        {shortAddr}
                    </div>
                </div>

                {balance !== null && (
                    <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                            Balance
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            {balance} <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>ETH</span>
                        </div>
                    </div>
                )}

                <a
                    href={`https://sepolia.etherscan.io/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '12px', color: 'var(--accent)', textDecoration: 'none',
                        marginBottom: '12px',
                    }}
                >
                    View on Etherscan <HiOutlineExternalLink size={12} />
                </a>

                <button onClick={handleDisconnect} className="btn-danger" style={{ width: '100%', justifyContent: 'center' }}>
                    Disconnect Wallet
                </button>

                {error && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--danger-text)' }}>{error}</div>
                )}
            </div>
        );
    }

    // Disconnected state
    return (
        <div>
            <button
                onClick={handleConnect}
                disabled={connecting}
                className={compact ? 'wallet-badge wallet-badge-disconnected' : 'btn-primary'}
                style={compact ? {} : { width: '100%', justifyContent: 'center' }}
            >
                {connecting ? (
                    <><span className="spinner" /> Connecting...</>
                ) : (
                    <><HiOutlineCube size={compact ? 14 : 16} /> {compact ? 'Connect' : 'Connect MetaMask Wallet'}</>
                )}
            </button>
            {error && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--danger-text)' }}>{error}</div>
            )}
        </div>
    );
}

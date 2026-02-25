import { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: '80vh', padding: 40
                }}>
                    <div style={{ textAlign: 'center', maxWidth: 400 }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: 16, margin: '0 auto 20px',
                            background: 'rgba(239,68,68,0.1)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontSize: 24
                        }}>💥</div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fafafa', marginBottom: 8 }}>
                            Something went wrong
                        </h2>
                        <p style={{ fontSize: 13, color: '#52525b', marginBottom: 20, lineHeight: 1.5 }}>
                            An unexpected error occurred. Try refreshing the page.
                        </p>
                        <button
                            className="btn-primary"
                            onClick={() => window.location.reload()}
                            style={{ padding: '10px 24px' }}
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

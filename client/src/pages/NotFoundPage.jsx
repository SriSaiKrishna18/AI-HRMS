import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '80vh', padding: 40
        }}>
            <div style={{ textAlign: 'center', maxWidth: 400 }}>
                <p style={{
                    fontSize: 72, fontWeight: 800, letterSpacing: '-0.04em',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    marginBottom: 8
                }}>404</p>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fafafa', marginBottom: 8 }}>
                    Page not found
                </h2>
                <p style={{ fontSize: 13, color: '#52525b', marginBottom: 24, lineHeight: 1.5 }}>
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Link to="/dashboard" className="btn-primary" style={{ padding: '10px 24px', textDecoration: 'none' }}>
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}

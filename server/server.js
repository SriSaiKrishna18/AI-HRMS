require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// ── Environment validation ──────────────────────────────────
const requiredEnv = ['JWT_SECRET'];
const missing = requiredEnv.filter(key => !process.env[key]);
if (missing.length > 0) {
    console.error(`\n❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('   Create a .env file with these values. See .env.example for reference.\n');
    process.exit(1);
}

// Rate limiters
const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100,
    message: { error: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 attempts per window
    message: { error: 'Too many login attempts. Try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Import routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const taskRoutes = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');
const aiRoutes = require('./routes/ai');
const analyticsRoutes = require('./routes/analytics');
const payrollRoutes = require('./routes/payroll');

// Auto-seed if database is empty (handles Render ephemeral filesystem wipe)
const db = require('./config/db');
const { runSeed } = require('./seed');
try {
    const count = db.prepare('SELECT COUNT(*) as count FROM employees').get();
    if (count.count === 0) {
        console.log('📦 Empty database detected — auto-seeding demo data...');
        runSeed();
    }
} catch (err) {
    console.error('Auto-seed check failed:', err.message);
}

const app = express();
const PORT = process.env.PORT || 5000;
const startTime = Date.now();

// Middleware
app.use(helmet());
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc)
        if (!origin) return callback(null, true);
        const allowed = [
            'http://localhost:5173',
            'http://localhost:3000',
            'https://ai-hrms-iota.vercel.app',
        ];
        // Also allow any *.vercel.app subdomain for preview deployments
        if (allowed.includes(origin) || /\.vercel\.app$/.test(origin)) {
            return callback(null, true);
        }
        callback(new Error('CORS not allowed'));
    },
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Health check — enhanced with diagnostics
app.get('/api/health', (req, res) => {
    const mem = process.memoryUsage();
    res.json({
        status: 'ok',
        version: '1.1.0',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor((Date.now() - startTime) / 1000)}s`,
        memory: { heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)}MB`, rss: `${Math.round(mem.rss / 1024 / 1024)}MB` },
        database: 'connected'
    });
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api', generalLimiter);
app.use('/api/employees', employeeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payroll', payrollRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found.' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
    console.log(`\n🚀 RizeOS HRMS Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;

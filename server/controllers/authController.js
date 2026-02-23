const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Register a new organization
exports.register = (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }

        // Check if org already exists
        const existing = db.prepare('SELECT id FROM organizations WHERE email = ?').get(email);
        if (existing) {
            return res.status(409).json({ error: 'Organization with this email already exists.' });
        }

        const password_hash = bcrypt.hashSync(password, 10);
        const result = db.prepare(
            'INSERT INTO organizations (name, email, password_hash) VALUES (?, ?, ?)'
        ).run(name, email, password_hash);

        const token = jwt.sign(
            { id: result.lastInsertRowid, email, name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Organization registered successfully.',
            token,
            org: { id: result.lastInsertRowid, name, email }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Login
exports.login = (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const org = db.prepare('SELECT * FROM organizations WHERE email = ?').get(email);
        if (!org) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const isMatch = bcrypt.compareSync(password, org.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { id: org.id, email: org.email, name: org.name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful.',
            token,
            org: { id: org.id, name: org.name, email: org.email }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const db = require('../config/db');

// GET /api/payroll — get all payroll records for org
exports.getAll = (req, res) => {
    try {
        const org_id = req.org.id;
        const records = db.prepare(`
            SELECT p.*, e.name as employee_name, e.wallet_address
            FROM payroll_records p
            JOIN employees e ON p.employee_id = e.id
            WHERE p.org_id = ?
            ORDER BY p.created_at DESC
        `).all(org_id);
        res.json(records);
    } catch (err) {
        console.error('Get all payroll error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// POST /api/payroll — create payroll record
exports.create = (req, res) => {
    try {
        const org_id = req.org.id;
        const { employee_id, amount, period, notes, tx_hash } = req.body;

        if (!employee_id || !amount || !period) {
            return res.status(400).json({ error: 'Employee ID, amount, and period are required.' });
        }

        // Verify employee belongs to org
        const emp = db.prepare('SELECT id, name FROM employees WHERE id = ? AND org_id = ?').get(employee_id, org_id);
        if (!emp) return res.status(404).json({ error: 'Employee not found.' });

        const result = db.prepare(
            'INSERT INTO payroll_records (org_id, employee_id, amount, period, notes, tx_hash) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(org_id, employee_id, amount, period, notes || null, tx_hash || null);

        res.status(201).json({
            message: 'Payroll record created.',
            record: {
                id: result.lastInsertRowid,
                org_id, employee_id, amount, period,
                notes: notes || null,
                tx_hash: tx_hash || null,
                employee_name: emp.name
            }
        });
    } catch (err) {
        console.error('Create payroll error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// GET /api/payroll/:employeeId — get payroll history for employee
exports.getByEmployee = (req, res) => {
    try {
        const org_id = req.org.id;
        const { employeeId } = req.params;

        const records = db.prepare(`
            SELECT p.*, e.name as employee_name
            FROM payroll_records p
            JOIN employees e ON p.employee_id = e.id
            WHERE p.org_id = ? AND p.employee_id = ?
            ORDER BY p.created_at DESC
        `).all(org_id, employeeId);

        res.json({ records });
    } catch (err) {
        console.error('Get payroll error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// PUT /api/payroll/:id/tx — store tx hash after on-chain logging
exports.storeTxHash = (req, res) => {
    try {
        const org_id = req.org.id;
        const { id } = req.params;
        const { tx_hash } = req.body;

        if (!tx_hash) return res.status(400).json({ error: 'Transaction hash is required.' });

        const record = db.prepare('SELECT * FROM payroll_records WHERE id = ? AND org_id = ?').get(id, org_id);
        if (!record) return res.status(404).json({ error: 'Payroll record not found.' });

        db.prepare('UPDATE payroll_records SET tx_hash = ? WHERE id = ?').run(tx_hash, id);

        res.json({ message: 'Payroll transaction hash stored.', tx_hash });
    } catch (err) {
        console.error('Store payroll tx error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

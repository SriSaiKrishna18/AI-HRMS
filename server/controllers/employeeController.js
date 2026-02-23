const db = require('../config/db');

// Add employee
exports.create = (req, res) => {
    try {
        const { name, email, role, department, skills, wallet_address } = req.body;
        const org_id = req.org.id;

        if (!name || !email || !role || !department) {
            return res.status(400).json({ error: 'Name, email, role, and department are required.' });
        }

        // Check for duplicate email within the org
        const existing = db.prepare('SELECT id FROM employees WHERE email = ? AND org_id = ?').get(email, org_id);
        if (existing) {
            return res.status(409).json({ error: 'An employee with this email already exists.' });
        }

        const result = db.prepare(
            'INSERT INTO employees (org_id, name, email, role, department, skills, wallet_address) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(org_id, name, email, role, department, JSON.stringify(skills || []), wallet_address || null);

        res.status(201).json({
            message: 'Employee added successfully.',
            employee: {
                id: result.lastInsertRowid,
                org_id, name, email, role, department,
                skills: skills || [],
                wallet_address: wallet_address || null,
                is_active: 1
            }
        });
    } catch (err) {
        console.error('Create employee error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// List all employees
exports.getAll = (req, res) => {
    try {
        const org_id = req.org.id;
        const employees = db.prepare('SELECT * FROM employees WHERE org_id = ? ORDER BY created_at DESC').all(org_id);

        // Parse skills JSON
        const parsed = employees.map(emp => ({
            ...emp,
            skills: JSON.parse(emp.skills || '[]')
        }));

        res.json({ employees: parsed });
    } catch (err) {
        console.error('Get employees error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Get single employee
exports.getOne = (req, res) => {
    try {
        const { id } = req.params;
        const org_id = req.org.id;
        const employee = db.prepare('SELECT * FROM employees WHERE id = ? AND org_id = ?').get(id, org_id);

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found.' });
        }

        employee.skills = JSON.parse(employee.skills || '[]');
        res.json({ employee });
    } catch (err) {
        console.error('Get employee error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Update employee
exports.update = (req, res) => {
    try {
        const { id } = req.params;
        const org_id = req.org.id;
        const { name, email, role, department, skills, wallet_address, is_active } = req.body;

        const existing = db.prepare('SELECT * FROM employees WHERE id = ? AND org_id = ?').get(id, org_id);
        if (!existing) {
            return res.status(404).json({ error: 'Employee not found.' });
        }

        db.prepare(`
      UPDATE employees SET 
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        role = COALESCE(?, role),
        department = COALESCE(?, department),
        skills = COALESCE(?, skills),
        wallet_address = COALESCE(?, wallet_address),
        is_active = COALESCE(?, is_active)
      WHERE id = ? AND org_id = ?
    `).run(
            name || null, email || null, role || null, department || null,
            skills ? JSON.stringify(skills) : null,
            wallet_address !== undefined ? wallet_address : null,
            is_active !== undefined ? (is_active ? 1 : 0) : null,
            id, org_id
        );

        const updated = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
        updated.skills = JSON.parse(updated.skills || '[]');

        res.json({ message: 'Employee updated successfully.', employee: updated });
    } catch (err) {
        console.error('Update employee error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Delete employee
exports.remove = (req, res) => {
    try {
        const { id } = req.params;
        const org_id = req.org.id;

        const existing = db.prepare('SELECT * FROM employees WHERE id = ? AND org_id = ?').get(id, org_id);
        if (!existing) {
            return res.status(404).json({ error: 'Employee not found.' });
        }

        db.prepare('DELETE FROM employees WHERE id = ? AND org_id = ?').run(id, org_id);

        res.json({ message: 'Employee deleted successfully.' });
    } catch (err) {
        console.error('Delete employee error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

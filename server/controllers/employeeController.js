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

// List all employees (with search, pagination)
exports.getAll = (req, res) => {
    try {
        const org_id = req.org.id;
        const { search, page, limit: lim } = req.query;
        const page_num = Math.max(1, parseInt(page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(lim) || 50));
        const offset = (page_num - 1) * limit;

        let countQuery = 'SELECT COUNT(*) as total FROM employees WHERE org_id = ?';
        let query = 'SELECT * FROM employees WHERE org_id = ?';
        const params = [org_id];

        if (search) {
            const searchClause = " AND (name LIKE ? OR role LIKE ? OR department LIKE ? OR email LIKE ?)";
            const searchParam = `%${search}%`;
            countQuery += searchClause;
            query += searchClause;
            params.push(searchParam, searchParam, searchParam, searchParam);
        }

        const total = db.prepare(countQuery).get(...params).total;

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        const employees = db.prepare(query).all(...params, limit, offset);

        // Parse skills JSON
        const parsed = employees.map(emp => ({
            ...emp,
            skills: JSON.parse(emp.skills || '[]')
        }));

        res.json({
            employees: parsed,
            pagination: {
                page: page_num,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
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

// Export employees as CSV
exports.exportCsv = (req, res) => {
    try {
        const org_id = req.org.id;
        const employees = db.prepare('SELECT * FROM employees WHERE org_id = ? ORDER BY name').all(org_id);

        const header = 'Name,Email,Role,Department,Skills,Wallet Address,Status';
        const rows = employees.map(e => {
            const skills = JSON.parse(e.skills || '[]').join('; ');
            const wallet = e.wallet_address || 'N/A';
            const status = e.is_active ? 'Active' : 'Inactive';
            return `"${e.name}","${e.email}","${e.role}","${e.department}","${skills}","${wallet}","${status}"`;
        });

        const csv = [header, ...rows].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=employees.csv');
        res.send(csv);
    } catch (err) {
        console.error('Export CSV error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

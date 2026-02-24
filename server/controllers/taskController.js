const db = require('../config/db');

// Create task
exports.create = (req, res) => {
    try {
        const { employee_id, title, description, deadline } = req.body;
        const org_id = req.org.id;

        if (!employee_id || !title) {
            return res.status(400).json({ error: 'Employee ID and title are required.' });
        }

        // Verify employee belongs to this org
        const employee = db.prepare('SELECT id FROM employees WHERE id = ? AND org_id = ?').get(employee_id, org_id);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found in your organization.' });
        }

        // Validate deadline is not in the past (if provided)
        if (deadline) {
            const deadlineDate = new Date(deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (deadlineDate < today) {
                return res.status(400).json({ error: 'Deadline cannot be in the past.' });
            }
        }

        const result = db.prepare(
            'INSERT INTO tasks (org_id, employee_id, title, description, deadline) VALUES (?, ?, ?, ?, ?)'
        ).run(org_id, employee_id, title, description || null, deadline || null);

        res.status(201).json({
            message: 'Task assigned successfully.',
            task: {
                id: result.lastInsertRowid,
                org_id, employee_id, title,
                description: description || null,
                status: 'assigned',
                deadline: deadline || null,
                tx_hash: null
            }
        });
    } catch (err) {
        console.error('Create task error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// List tasks (filterable with pagination)
exports.getAll = (req, res) => {
    try {
        const org_id = req.org.id;
        const { employee_id, status, page, limit: lim } = req.query;
        const page_num = Math.max(1, parseInt(page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(lim) || 50));
        const offset = (page_num - 1) * limit;

        let countQuery = 'SELECT COUNT(*) as total FROM tasks t WHERE t.org_id = ?';
        let query = 'SELECT t.*, e.name as employee_name FROM tasks t JOIN employees e ON t.employee_id = e.id WHERE t.org_id = ?';
        const params = [org_id];

        if (employee_id) {
            countQuery += ' AND t.employee_id = ?';
            query += ' AND t.employee_id = ?';
            params.push(employee_id);
        }
        if (status) {
            countQuery += ' AND t.status = ?';
            query += ' AND t.status = ?';
            params.push(status);
        }

        const total = db.prepare(countQuery).get(...params).total;

        query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
        const tasks = db.prepare(query).all(...params, limit, offset);

        res.json({
            tasks,
            pagination: {
                page: page_num,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('Get tasks error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Update task status
exports.updateStatus = (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const org_id = req.org.id;

        const validStatuses = ['assigned', 'in_progress', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be: assigned, in_progress, or completed.' });
        }

        const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND org_id = ?').get(id, org_id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        // Status transition validation
        const transitions = {
            'assigned': ['in_progress'],
            'in_progress': ['completed', 'assigned'],
            'completed': []
        };

        if (!transitions[task.status].includes(status)) {
            return res.status(400).json({
                error: `Cannot transition from '${task.status}' to '${status}'.`
            });
        }

        const completed_at = status === 'completed' ? new Date().toISOString() : null;

        db.prepare(
            'UPDATE tasks SET status = ?, completed_at = COALESCE(?, completed_at) WHERE id = ? AND org_id = ?'
        ).run(status, completed_at, id, org_id);

        const updated = db.prepare('SELECT t.*, e.name as employee_name FROM tasks t JOIN employees e ON t.employee_id = e.id WHERE t.id = ?').get(id);

        res.json({ message: 'Task status updated.', task: updated });
    } catch (err) {
        console.error('Update task status error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Store transaction hash (Web3)
exports.storeTxHash = (req, res) => {
    try {
        const { id } = req.params;
        const { tx_hash } = req.body;
        const org_id = req.org.id;

        if (!tx_hash) {
            return res.status(400).json({ error: 'Transaction hash is required.' });
        }

        const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND org_id = ?').get(id, org_id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        db.prepare('UPDATE tasks SET tx_hash = ? WHERE id = ?').run(tx_hash, id);

        res.json({ message: 'Transaction hash stored.', tx_hash });
    } catch (err) {
        console.error('Store tx hash error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

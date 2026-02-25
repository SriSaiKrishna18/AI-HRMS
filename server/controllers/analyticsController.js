const db = require('../config/db');

// GET /api/analytics — single endpoint returning all analytics data
exports.getAnalytics = (req, res) => {
    try {
        const org_id = req.org.id;

        // 1. Task completion trend — last 14 days
        const trend = db.prepare(`
            SELECT DATE(completed_at) as date, COUNT(*) as count
            FROM tasks
            WHERE org_id = ? AND status = 'completed'
              AND completed_at >= DATE('now', '-14 days')
            GROUP BY DATE(completed_at)
            ORDER BY date ASC
        `).all(org_id);

        // 2. Department productivity — completion rate per dept
        const departments = db.prepare(`
            SELECT e.department,
                COUNT(DISTINCT e.id) as employees,
                COUNT(t.id) as total_tasks,
                SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
            FROM employees e
            LEFT JOIN tasks t ON e.id = t.employee_id
            WHERE e.org_id = ?
            GROUP BY e.department
            ORDER BY employees DESC
        `).all(org_id);

        // 3. Task status distribution
        const statusDist = db.prepare(`
            SELECT status, COUNT(*) as count
            FROM tasks
            WHERE org_id = ?
            GROUP BY status
        `).all(org_id);

        // 4. Top skills across all employees
        const allEmployees = db.prepare('SELECT skills FROM employees WHERE org_id = ?').all(org_id);
        const skillMap = {};
        allEmployees.forEach(emp => {
            try {
                const skills = JSON.parse(emp.skills || '[]');
                skills.forEach(s => { skillMap[s] = (skillMap[s] || 0) + 1; });
            } catch (e) { /* skip malformed */ }
        });
        const skills = Object.entries(skillMap)
            .map(([skill, count]) => ({ skill, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);

        // 5. Employee performance ranking
        const performers = db.prepare(`
            SELECT e.id, e.name, e.role, e.department,
                COUNT(t.id) as total,
                SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed
            FROM employees e
            LEFT JOIN tasks t ON e.id = t.employee_id
            WHERE e.org_id = ?
            GROUP BY e.id
            HAVING total > 0
            ORDER BY completed DESC
        `).all(org_id);

        res.json({ trend, departments, statusDist, skills, performers });
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ error: 'Analytics query failed.' });
    }
};

const db = require('../config/db');

// Dashboard statistics — comprehensive org analytics
exports.getStats = (req, res) => {
  try {
    const org_id = req.org.id;

    // ── Core Stats ────────────────────────────────────────────
    const totalEmployees = db.prepare('SELECT COUNT(*) as count FROM employees WHERE org_id = ?').get(org_id).count;
    const activeEmployees = db.prepare(
      "SELECT COUNT(DISTINCT employee_id) as count FROM tasks WHERE org_id = ? AND status = 'in_progress'"
    ).get(org_id).count;
    const totalTasks = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE org_id = ?').get(org_id).count;
    const assignedTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE org_id = ? AND status = 'assigned'").get(org_id).count;
    const inProgressTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE org_id = ? AND status = 'in_progress'").get(org_id).count;
    const completedTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE org_id = ? AND status = 'completed'").get(org_id).count;
    const productivityRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // ── Overdue Tasks (deadline < now AND not completed) ─────
    const overdueTasks = db.prepare(`
      SELECT t.id, t.title, t.deadline, t.status, e.name as employee_name
      FROM tasks t JOIN employees e ON t.employee_id = e.id
      WHERE t.org_id = ? AND t.deadline < datetime('now') AND t.status != 'completed'
      ORDER BY t.deadline ASC
    `).all(org_id);

    // ── Department Stats (employees + tasks per dept) ────────
    const departmentStats = db.prepare(`
      SELECT e.department,
        COUNT(DISTINCT e.id) as employees,
        COUNT(t.id) as totalTasks,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completedTasks
      FROM employees e
      LEFT JOIN tasks t ON e.id = t.employee_id
      WHERE e.org_id = ?
      GROUP BY e.department
      ORDER BY employees DESC
    `).all(org_id);

    // ── Skill Distribution (top skills across org) ───────────
    const allEmployees = db.prepare('SELECT skills FROM employees WHERE org_id = ?').all(org_id);
    const skillMap = {};
    allEmployees.forEach(emp => {
      try {
        const skills = JSON.parse(emp.skills || '[]');
        skills.forEach(s => { skillMap[s] = (skillMap[s] || 0) + 1; });
      } catch (e) { /* skip malformed */ }
    });
    const skillDistribution = Object.entries(skillMap)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);

    // ── Recent Activity (last 10 tasks with relative time) ───
    const recentTasks = db.prepare(`
      SELECT t.*, e.name as employee_name 
      FROM tasks t JOIN employees e ON t.employee_id = e.id 
      WHERE t.org_id = ? ORDER BY t.created_at DESC LIMIT 10
    `).all(org_id);

    // ── Top Performers ───────────────────────────────────────
    const topPerformers = db.prepare(`
      SELECT e.id, e.name, e.role, e.department,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed,
        COUNT(t.id) as total
      FROM employees e
      LEFT JOIN tasks t ON e.id = t.employee_id
      WHERE e.org_id = ?
      GROUP BY e.id
      HAVING total > 0
      ORDER BY completed DESC
      LIMIT 5
    `).all(org_id);

    // ── Department List ──────────────────────────────────────
    const departments = db.prepare(`
      SELECT department, COUNT(*) as count 
      FROM employees WHERE org_id = ? 
      GROUP BY department
    `).all(org_id);

    // ── Task Trend (last 14 days — completed + assigned per day) ──
    const taskTrend = db.prepare(`
      SELECT DATE(created_at) as date,
        COUNT(CASE WHEN status = 'assigned' THEN 1 END) as assigned,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
      FROM tasks WHERE org_id = ? AND created_at >= datetime('now', '-14 days')
      GROUP BY DATE(created_at) ORDER BY date ASC
    `).all(org_id);

    // ── Department Distribution (for pie chart) ─────────────
    const departmentDistribution = departments.map(d => ({
      name: d.department,
      count: d.count
    }));

    res.json({
      stats: {
        totalEmployees,
        activeEmployees,
        totalTasks,
        assignedTasks,
        inProgressTasks,
        completedTasks,
        productivityRate
      },
      overdueTasks,
      departmentStats,
      skillDistribution,
      recentTasks,
      topPerformers,
      departments,
      taskTrend,
      departmentDistribution
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

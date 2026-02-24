const db = require('../config/db');

// Dashboard statistics
exports.getStats = (req, res) => {
  try {
    const org_id = req.org.id;

    const totalEmployees = db.prepare('SELECT COUNT(*) as count FROM employees WHERE org_id = ?').get(org_id).count;
    const activeEmployees = db.prepare(
      "SELECT COUNT(DISTINCT employee_id) as count FROM tasks WHERE org_id = ? AND status = 'in_progress'"
    ).get(org_id).count;
    const totalTasks = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE org_id = ?').get(org_id).count;
    const assignedTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE org_id = ? AND status = 'assigned'").get(org_id).count;
    const inProgressTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE org_id = ? AND status = 'in_progress'").get(org_id).count;
    const completedTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE org_id = ? AND status = 'completed'").get(org_id).count;

    const productivityRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Recent activity (last 5 tasks)
    const recentTasks = db.prepare(`
      SELECT t.*, e.name as employee_name 
      FROM tasks t JOIN employees e ON t.employee_id = e.id 
      WHERE t.org_id = ? ORDER BY t.created_at DESC LIMIT 5
    `).all(org_id);

    // Top performers
    const topPerformers = db.prepare(`
      SELECT e.id, e.name, e.role, e.department,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed,
        COUNT(t.id) as total
      FROM employees e
      LEFT JOIN tasks t ON e.id = t.employee_id
      WHERE e.org_id = ?
      GROUP BY e.id
      ORDER BY completed DESC
      LIMIT 5
    `).all(org_id);

    // Department breakdown
    const departments = db.prepare(`
      SELECT department, COUNT(*) as count 
      FROM employees WHERE org_id = ? 
      GROUP BY department
    `).all(org_id);

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
      recentTasks,
      topPerformers,
      departments
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

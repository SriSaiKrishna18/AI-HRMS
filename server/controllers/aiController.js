const db = require('../config/db');

// Productivity Score
exports.getProductivityScore = (req, res) => {
    try {
        const { employeeId } = req.params;
        const org_id = req.org.id;

        const employee = db.prepare('SELECT * FROM employees WHERE id = ? AND org_id = ?').get(employeeId, org_id);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found.' });
        }

        // Get task stats
        const totalTasks = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE employee_id = ?').get(employeeId).count;
        const completedTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE employee_id = ? AND status = 'completed'").get(employeeId).count;

        // Handle zero tasks gracefully
        if (totalTasks === 0) {
            return res.json({
                employeeId: parseInt(employeeId),
                employeeName: employee.name,
                score: 0,
                rating: 'No data',
                trend: 'stable',
                message: 'No tasks assigned yet. Assign tasks to generate a productivity score.',
                details: { totalTasks: 0, completedTasks: 0, completionRate: 0, deadlineAdherence: 0, onTimeTasks: 0, tasksWithDeadline: 0 }
            });
        }

        // Calculate deadline adherence — tasks completed before deadline
        const onTimeTasks = db.prepare(`
      SELECT COUNT(*) as count FROM tasks 
      WHERE employee_id = ? AND status = 'completed' 
      AND deadline IS NOT NULL AND completed_at <= deadline
    `).get(employeeId).count;

        const tasksWithDeadline = db.prepare(`
      SELECT COUNT(*) as count FROM tasks 
      WHERE employee_id = ? AND status = 'completed' AND deadline IS NOT NULL
    `).get(employeeId).count;

        // Base completion rate
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Deadline adherence factor (1.0 if no deadlines set)
        const deadlineAdherence = tasksWithDeadline > 0 ? onTimeTasks / tasksWithDeadline : 1.0;

        // Weighted score: 70% completion + 30% deadline adherence
        const score = Math.round((completionRate * 0.7) + (deadlineAdherence * 100 * 0.3));
        const clampedScore = Math.min(100, Math.max(0, score));

        // Rating label
        let rating;
        if (clampedScore >= 85) rating = 'Excellent';
        else if (clampedScore >= 70) rating = 'High';
        else if (clampedScore >= 50) rating = 'Medium';
        else rating = 'Low';

        // Trend — compare last 30 days vs previous 30 days
        const now = new Date().toISOString();
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();

        const recentCompleted = db.prepare(`
      SELECT COUNT(*) as count FROM tasks 
      WHERE employee_id = ? AND status = 'completed' AND completed_at >= ?
    `).get(employeeId, thirtyDaysAgo).count;

        const previousCompleted = db.prepare(`
      SELECT COUNT(*) as count FROM tasks 
      WHERE employee_id = ? AND status = 'completed' AND completed_at >= ? AND completed_at < ?
    `).get(employeeId, sixtyDaysAgo, thirtyDaysAgo).count;

        let trend = 'stable';
        if (recentCompleted > previousCompleted) trend = 'improving';
        else if (recentCompleted < previousCompleted) trend = 'declining';

        res.json({
            employeeId: parseInt(employeeId),
            employeeName: employee.name,
            score: clampedScore,
            rating,
            trend,
            details: {
                totalTasks,
                completedTasks,
                completionRate: Math.round(completionRate),
                deadlineAdherence: Math.round(deadlineAdherence * 100),
                onTimeTasks,
                tasksWithDeadline
            }
        });
    } catch (err) {
        console.error('Productivity score error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Skill Gap Detection
exports.getSkillGap = (req, res) => {
    try {
        const { employeeId } = req.params;
        const org_id = req.org.id;

        const employee = db.prepare('SELECT * FROM employees WHERE id = ? AND org_id = ?').get(employeeId, org_id);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found.' });
        }

        const employeeSkills = JSON.parse(employee.skills || '[]').map(s => s.toLowerCase());

        // Get role requirements
        const roleReq = db.prepare('SELECT * FROM role_requirements WHERE LOWER(role) = LOWER(?)').get(employee.role);

        if (!roleReq) {
            return res.json({
                employeeId: parseInt(employeeId),
                employeeName: employee.name,
                role: employee.role,
                currentSkills: JSON.parse(employee.skills || '[]'),
                requiredSkills: [],
                missingSkills: [],
                matchPercentage: 100,
                suggestedCourses: [],
                message: 'No role requirements defined for this role.'
            });
        }

        const requiredSkills = JSON.parse(roleReq.required_skills || '[]');
        const suggestedCourses = JSON.parse(roleReq.suggested_courses || '[]');

        // Find missing skills (case-insensitive comparison)
        const missingSkills = requiredSkills.filter(
            skill => !employeeSkills.includes(skill.toLowerCase())
        );

        const matchedSkills = requiredSkills.filter(
            skill => employeeSkills.includes(skill.toLowerCase())
        );

        const matchPercentage = requiredSkills.length > 0
            ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
            : 100;

        // Skill level assessment
        let level;
        if (matchPercentage >= 90) level = 'Expert';
        else if (matchPercentage >= 70) level = 'Advanced';
        else if (matchPercentage >= 50) level = 'Intermediate';
        else level = 'Beginner';

        res.json({
            employeeId: parseInt(employeeId),
            employeeName: employee.name,
            role: employee.role,
            currentSkills: JSON.parse(employee.skills || '[]'),
            requiredSkills,
            matchedSkills,
            missingSkills,
            matchPercentage,
            level,
            suggestedCourses: missingSkills.length > 0 ? suggestedCourses : []
        });
    } catch (err) {
        console.error('Skill gap error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

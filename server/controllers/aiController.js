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

// Smart Task Assignment — Suggest best employee for a task
exports.suggestAssignment = (req, res) => {
    try {
        const org_id = req.org.id;
        const { skills, title } = req.query;

        if (!skills) {
            return res.status(400).json({ error: 'Please provide required skills as a comma-separated query parameter.' });
        }

        const requiredSkills = skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
        const employees = db.prepare('SELECT * FROM employees WHERE org_id = ? AND is_active = 1').all(org_id);

        if (employees.length === 0) {
            return res.json({ suggestions: [], message: 'No active employees found.' });
        }

        const scored = employees.map(emp => {
            const empSkills = JSON.parse(emp.skills || '[]').map(s => s.toLowerCase());

            // 1. Skill match score (0-100) — weight: 50%
            const matchedSkills = requiredSkills.filter(s => empSkills.includes(s));
            const skillScore = requiredSkills.length > 0
                ? (matchedSkills.length / requiredSkills.length) * 100
                : 50; // neutral if no skills specified

            // 2. Workload score (0-100, lower workload = higher score) — weight: 30%
            const activeTasks = db.prepare(
                "SELECT COUNT(*) as count FROM tasks WHERE employee_id = ? AND status IN ('assigned', 'in_progress')"
            ).get(emp.id).count;
            const workloadScore = Math.max(0, 100 - (activeTasks * 25)); // 0 active = 100, 4+ active = 0

            // 3. Productivity score (0-100) — weight: 20%
            const totalTasks = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE employee_id = ?').get(emp.id).count;
            const completedTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE employee_id = ? AND status = 'completed'").get(emp.id).count;
            const productivityScore = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 50;

            // Weighted composite score
            const compositeScore = Math.round(
                (skillScore * 0.50) + (workloadScore * 0.30) + (productivityScore * 0.20)
            );

            // Generate reasoning
            const reasons = [];
            if (matchedSkills.length > 0) reasons.push(`Matches ${matchedSkills.length}/${requiredSkills.length} required skills (${matchedSkills.join(', ')})`);
            if (matchedSkills.length === 0) reasons.push('No matching skills');
            if (activeTasks === 0) reasons.push('No active tasks — fully available');
            else if (activeTasks <= 2) reasons.push(`Low workload (${activeTasks} active task${activeTasks > 1 ? 's' : ''})`);
            else reasons.push(`High workload (${activeTasks} active tasks)`);
            if (productivityScore >= 80) reasons.push('Excellent track record');
            else if (productivityScore >= 60) reasons.push('Good track record');

            return {
                employeeId: emp.id,
                name: emp.name,
                role: emp.role,
                department: emp.department,
                skills: JSON.parse(emp.skills || '[]'),
                matchedSkills,
                activeTasks,
                compositeScore,
                skillScore: Math.round(skillScore),
                workloadScore: Math.round(workloadScore),
                productivityScore: Math.round(productivityScore),
                reasons
            };
        });

        // Sort by composite score descending, return top 3
        scored.sort((a, b) => b.compositeScore - a.compositeScore);
        const top3 = scored.slice(0, 3);

        res.json({
            requiredSkills: skills.split(',').map(s => s.trim()),
            totalCandidates: employees.length,
            suggestions: top3,
            algorithm: {
                description: 'Weighted scoring: 50% skill match + 30% workload availability + 20% productivity history',
                weights: { skillMatch: 0.5, workloadAvailability: 0.3, productivityHistory: 0.2 }
            }
        });
    } catch (err) {
        console.error('Smart assignment error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Performance Trend — 4-week rolling completion analysis
exports.getPerformanceTrend = (req, res) => {
    try {
        const org_id = req.org.id;
        const { employeeId } = req.params;

        const employee = db.prepare('SELECT id, name FROM employees WHERE id = ? AND org_id = ?').get(employeeId, org_id);
        if (!employee) return res.status(404).json({ error: 'Employee not found.' });

        // Get tasks completed in the last 4 weeks, grouped by week
        const weeks = [];
        for (let i = 3; i >= 0; i--) {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
            const weekEnd = new Date();
            weekEnd.setDate(weekEnd.getDate() - i * 7);

            const count = db.prepare(`
                SELECT COUNT(*) as count FROM tasks
                WHERE employee_id = ? AND org_id = ? AND status = 'completed'
                AND completed_at >= ? AND completed_at < ?
            `).get(employeeId, org_id, weekStart.toISOString(), weekEnd.toISOString());

            weeks.push({
                week: `Week ${4 - i}`,
                startDate: weekStart.toISOString().split('T')[0],
                completed: count.count
            });
        }

        // Calculate trend direction
        const recentAvg = (weeks[2].completed + weeks[3].completed) / 2;
        const olderAvg = (weeks[0].completed + weeks[1].completed) / 2;
        const delta = recentAvg - olderAvg;

        let trend = 'stable';
        if (delta > 0.5) trend = 'improving';
        else if (delta < -0.5) trend = 'declining';

        res.json({
            employeeId: parseInt(employeeId),
            name: employee.name,
            weeks,
            trend,
            delta: Math.round(delta * 10) / 10,
            summary: trend === 'improving'
                ? `${employee.name} is completing more tasks recently — great momentum!`
                : trend === 'declining'
                    ? `${employee.name}'s output has decreased — consider checking workload.`
                    : `${employee.name} has steady consistent performance.`
        });
    } catch (err) {
        console.error('Performance trend error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

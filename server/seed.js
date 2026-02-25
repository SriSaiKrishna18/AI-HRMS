/**
 * Seed script — populates the database with realistic demo data.
 * Run: node seed.js
 * Creates a demo org, 15 employees across 6 departments, and 30 tasks with varied statuses.
 * Also auto-called on server start if database is empty (Render ephemeral FS).
 */
const bcrypt = require('bcryptjs');
const db = require('./config/db');

function runSeed() {
    // Clear existing data for clean seed
    db.exec('DELETE FROM tasks');
    db.exec('DELETE FROM employees');
    db.exec('DELETE FROM organizations');

    // Create demo organization
    const orgPassword = bcrypt.hashSync('demo123', 10);
    const org = db.prepare('INSERT INTO organizations (name, email, password_hash) VALUES (?, ?, ?)').run(
        'RizeTech Solutions', 'admin@rizetech.com', orgPassword
    );
    const orgId = org.lastInsertRowid;

    // ── 15 Employees across 6 departments ──────────────────────
    const insertEmp = db.prepare('INSERT INTO employees (org_id, name, email, role, department, skills, wallet_address) VALUES (?, ?, ?, ?, ?, ?, ?)');

    const employees = [
        // Engineering — 5 devs
        { name: 'Priya Sharma', email: 'priya@rizetech.com', role: 'Frontend Developer', dept: 'Engineering', skills: ['React', 'JavaScript', 'CSS', 'TypeScript'], wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28' },
        { name: 'Arjun Patel', email: 'arjun@rizetech.com', role: 'Frontend Developer', dept: 'Engineering', skills: ['React', 'JavaScript'], wallet: null },
        { name: 'Sneha Reddy', email: 'sneha@rizetech.com', role: 'Backend Developer', dept: 'Engineering', skills: ['Node.js', 'Express', 'PostgreSQL', 'Docker', 'Redis'], wallet: '0x53d284357ec70cE289D6D64134DfAc8E511c8a3D' },
        { name: 'Rahul Kumar', email: 'rahul@rizetech.com', role: 'Backend Developer', dept: 'Engineering', skills: ['Node.js', 'Express'], wallet: null },
        { name: 'Deepak Joshi', email: 'deepak@rizetech.com', role: 'Full Stack Developer', dept: 'Engineering', skills: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'TypeScript', 'AWS'], wallet: '0xAb5801a7D398351b8bE11C439e05C5b3259aeC9B' },

        // Infrastructure — 2
        { name: 'Ananya Gupta', email: 'ananya@rizetech.com', role: 'DevOps Engineer', dept: 'Infrastructure', skills: ['Docker', 'AWS', 'Linux', 'Terraform'], wallet: null },
        { name: 'Siddharth Rao', email: 'siddharth@rizetech.com', role: 'DevOps Engineer', dept: 'Infrastructure', skills: ['Kubernetes', 'AWS', 'CI/CD', 'Linux'], wallet: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },

        // AI/ML — 2
        { name: 'Vikram Singh', email: 'vikram@rizetech.com', role: 'Data Scientist', dept: 'AI/ML', skills: ['Python', 'TensorFlow', 'SQL', 'Pandas'], wallet: null },
        { name: 'Meera Iyer', email: 'meera@rizetech.com', role: 'Data Scientist', dept: 'AI/ML', skills: ['Python', 'Scikit-learn', 'Statistics', 'SQL', 'Pandas'], wallet: null },

        // Design — 2
        { name: 'Kavya Nair', email: 'kavya@rizetech.com', role: 'UI/UX Designer', dept: 'Design', skills: ['Figma', 'Adobe XD', 'CSS', 'Prototyping'], wallet: null },
        { name: 'Aditya Menon', email: 'aditya@rizetech.com', role: 'UI/UX Designer', dept: 'Design', skills: ['Figma', 'User Research', 'Design Systems'], wallet: null },

        // Product — 2
        { name: 'Rohan Mehta', email: 'rohan@rizetech.com', role: 'Project Manager', dept: 'Product', skills: ['Agile', 'Scrum', 'JIRA', 'Communication'], wallet: null },
        { name: 'Nisha Kapoor', email: 'nisha@rizetech.com', role: 'Project Manager', dept: 'Product', skills: ['Agile', 'Stakeholder Management', 'Risk Management'], wallet: null },

        // Marketing — 2 (NEW department)
        { name: 'Tanvi Desai', email: 'tanvi@rizetech.com', role: 'Marketing Lead', dept: 'Marketing', skills: ['SEO', 'Content Strategy', 'Analytics', 'Social Media'], wallet: null },
        { name: 'Karan Bhatt', email: 'karan@rizetech.com', role: 'Growth Analyst', dept: 'Marketing', skills: ['SQL', 'Google Analytics', 'A/B Testing', 'Python'], wallet: '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8' },
    ];

    const empIds = [];
    const insertEmps = db.transaction(() => {
        for (const emp of employees) {
            const result = insertEmp.run(orgId, emp.name, emp.email, emp.role, emp.dept, JSON.stringify(emp.skills), emp.wallet);
            empIds.push(result.lastInsertRowid);
        }
    });
    insertEmps();

    // ── 30 Tasks with varied statuses, deadlines, and completions ──
    const insertTask = db.prepare('INSERT INTO tasks (org_id, employee_id, title, description, status, deadline, completed_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

    const now = new Date();
    const daysAgo = (d) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString();
    const daysFromNow = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const tasks = [
        // Priya (0) — 4 tasks (3 completed on-time, 1 in progress) → excellent
        { empIdx: 0, title: 'Design dashboard UI', desc: 'Create responsive dashboard with charts and stats', status: 'completed', deadline: daysFromNow(-5), completed_at: daysAgo(7), created_at: daysAgo(14) },
        { empIdx: 0, title: 'Implement auth screens', desc: 'Login and registration pages with validation', status: 'completed', deadline: daysFromNow(-2), completed_at: daysAgo(4), created_at: daysAgo(10) },
        { empIdx: 0, title: 'Build employee profile page', desc: 'Detailed view with skills and performance', status: 'in_progress', deadline: daysFromNow(5), completed_at: null, created_at: daysAgo(3) },
        { empIdx: 0, title: 'Implement dark mode', desc: 'System-wide dark/light theme toggle', status: 'completed', deadline: daysFromNow(-1), completed_at: daysAgo(2), created_at: daysAgo(8) },

        // Arjun (1) — 3 tasks (1 completed late, 1 in progress, 1 assigned) → medium
        { empIdx: 1, title: 'Fix navigation bugs', desc: 'Sidebar links not highlighting correctly', status: 'completed', deadline: daysFromNow(-10), completed_at: daysAgo(2), created_at: daysAgo(15) },
        { empIdx: 1, title: 'Add dark mode toggle', desc: 'User preference for light/dark theme', status: 'assigned', deadline: daysFromNow(7), completed_at: null, created_at: daysAgo(1) },
        { empIdx: 1, title: 'Responsive table component', desc: 'Tables should scroll horizontally on mobile', status: 'in_progress', deadline: daysFromNow(4), completed_at: null, created_at: daysAgo(3) },

        // Sneha (2) — 4 tasks (4 completed on-time) → top performer
        { empIdx: 2, title: 'Build REST API endpoints', desc: 'CRUD for employees and tasks', status: 'completed', deadline: daysFromNow(-8), completed_at: daysAgo(10), created_at: daysAgo(20) },
        { empIdx: 2, title: 'Set up JWT authentication', desc: 'Middleware with role-based access control', status: 'completed', deadline: daysFromNow(-5), completed_at: daysAgo(7), created_at: daysAgo(15) },
        { empIdx: 2, title: 'Database optimization', desc: 'Add indexes and optimize slow queries', status: 'completed', deadline: daysFromNow(-1), completed_at: daysAgo(3), created_at: daysAgo(8) },
        { empIdx: 2, title: 'Implement rate limiting', desc: 'Protect API from brute force attacks', status: 'completed', deadline: daysFromNow(-2), completed_at: daysAgo(4), created_at: daysAgo(6) },

        // Rahul (3) — 2 tasks (1 in progress, 1 assigned) → low
        { empIdx: 3, title: 'Implement webhooks system', desc: 'Real-time notifications via webhooks', status: 'in_progress', deadline: daysFromNow(3), completed_at: null, created_at: daysAgo(5) },
        { empIdx: 3, title: 'Build caching layer', desc: 'Redis caching for frequent queries', status: 'assigned', deadline: daysFromNow(10), completed_at: null, created_at: daysAgo(1) },

        // Deepak (4) — 3 tasks (2 completed, 1 in progress) → high
        { empIdx: 4, title: 'Full-stack employee module', desc: 'Complete CRUD with frontend and backend', status: 'completed', deadline: daysFromNow(-6), completed_at: daysAgo(8), created_at: daysAgo(18) },
        { empIdx: 4, title: 'API documentation', desc: 'Swagger/OpenAPI docs for all endpoints', status: 'completed', deadline: daysFromNow(-3), completed_at: daysAgo(5), created_at: daysAgo(12) },
        { empIdx: 4, title: 'Microservices migration plan', desc: 'Architecture proposal for service decomposition', status: 'in_progress', deadline: daysFromNow(14), completed_at: null, created_at: daysAgo(3) },

        // Ananya (5) — 2 tasks (1 completed, 1 in progress)
        { empIdx: 5, title: 'CI/CD pipeline setup', desc: 'GitHub Actions for automated deployment', status: 'completed', deadline: daysFromNow(-3), completed_at: daysAgo(5), created_at: daysAgo(12) },
        { empIdx: 5, title: 'Infrastructure monitoring', desc: 'Set up Prometheus + Grafana dashboards', status: 'in_progress', deadline: daysFromNow(7), completed_at: null, created_at: daysAgo(4) },

        // Siddharth (6) — 2 tasks (1 completed, 1 assigned)
        { empIdx: 6, title: 'Kubernetes cluster setup', desc: 'Production-ready K8s cluster on AWS EKS', status: 'completed', deadline: daysFromNow(-4), completed_at: daysAgo(6), created_at: daysAgo(14) },
        { empIdx: 6, title: 'Disaster recovery plan', desc: 'Backup and recovery procedures documentation', status: 'assigned', deadline: daysFromNow(21), completed_at: null, created_at: daysAgo(2) },

        // Vikram (7) — 2 tasks (1 completed, 1 assigned)
        { empIdx: 7, title: 'Build ML prediction model', desc: 'Employee attrition prediction using historical data', status: 'completed', deadline: daysFromNow(-2), completed_at: daysAgo(4), created_at: daysAgo(10) },
        { empIdx: 7, title: 'Sentiment analysis pipeline', desc: 'NLP-based analysis of employee feedback', status: 'assigned', deadline: daysFromNow(14), completed_at: null, created_at: daysAgo(2) },

        // Meera (8) — 1 task (in progress)
        { empIdx: 8, title: 'A/B test analytics dashboard', desc: 'Statistical significance calculator for experiments', status: 'in_progress', deadline: daysFromNow(10), completed_at: null, created_at: daysAgo(5) },

        // Kavya (9) — 2 tasks (1 completed, 1 in progress)
        { empIdx: 9, title: 'Redesign onboarding flow', desc: 'Step-by-step wizard for new user experience', status: 'completed', deadline: daysFromNow(-1), completed_at: daysAgo(3), created_at: daysAgo(7) },
        { empIdx: 9, title: 'Design system components', desc: 'Reusable UI component library in Figma', status: 'in_progress', deadline: daysFromNow(7), completed_at: null, created_at: daysAgo(4) },

        // Aditya (10) — 1 task (assigned)
        { empIdx: 10, title: 'User research interviews', desc: 'Conduct 10 user interviews for feature validation', status: 'assigned', deadline: daysFromNow(14), completed_at: null, created_at: daysAgo(1) },

        // Rohan (11) — 1 task (completed)
        { empIdx: 11, title: 'Sprint planning framework', desc: 'Define agile ceremonies and velocity tracking', status: 'completed', deadline: daysFromNow(-7), completed_at: daysAgo(9), created_at: daysAgo(16) },

        // Nisha (12) — 1 task (in progress)  – OVERDUE to test alerts
        { empIdx: 12, title: 'Q1 OKR definition', desc: 'Define quarterly objectives and key results', status: 'in_progress', deadline: daysFromNow(-2), completed_at: null, created_at: daysAgo(10) },

        // Tanvi (13) — 1 task (completed)
        { empIdx: 13, title: 'SEO audit and optimization', desc: 'Full site SEO audit with recommendations', status: 'completed', deadline: daysFromNow(-3), completed_at: daysAgo(5), created_at: daysAgo(10) },

        // Karan (14) — 1 task (in progress)
        { empIdx: 14, title: 'Growth metrics dashboard', desc: 'Track CAC, LTV, churn, and MRR', status: 'in_progress', deadline: daysFromNow(7), completed_at: null, created_at: daysAgo(3) },
    ];

    const insertTasks = db.transaction(() => {
        for (const t of tasks) {
            insertTask.run(orgId, empIds[t.empIdx], t.title, t.desc, t.status, t.deadline, t.completed_at, t.created_at);
        }
    });
    insertTasks();

    console.log('✅ Seed complete!');
    console.log(`   Organization: RizeTech Solutions (admin@rizetech.com / demo123)`);
    console.log(`   Employees: ${employees.length}`);
    console.log(`   Tasks: ${tasks.length}`);
    console.log(`   Departments: ${[...new Set(employees.map(e => e.dept))].join(', ')}`);
    console.log(`   Statuses: ${tasks.filter(t => t.status === 'completed').length} completed, ${tasks.filter(t => t.status === 'in_progress').length} in progress, ${tasks.filter(t => t.status === 'assigned').length} assigned`);
}

// Run directly via `node seed.js`
if (require.main === module) {
    runSeed();
}

module.exports = { runSeed };

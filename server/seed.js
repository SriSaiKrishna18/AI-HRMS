/**
 * Seed script — populates the database with realistic demo data.
 * Run: node seed.js
 * This will create a demo org, 8 employees, and 12 tasks with varied statuses.
 */
const bcrypt = require('bcryptjs');
const db = require('./config/db');

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

// Seed 8 employees across different roles & departments
const insertEmp = db.prepare('INSERT INTO employees (org_id, name, email, role, department, skills, wallet_address) VALUES (?, ?, ?, ?, ?, ?, ?)');

const employees = [
    { name: 'Priya Sharma', email: 'priya@rizetech.com', role: 'Frontend Developer', dept: 'Engineering', skills: ['React', 'JavaScript', 'CSS', 'TypeScript'], wallet: '0x1234...abcd' },
    { name: 'Arjun Patel', email: 'arjun@rizetech.com', role: 'Frontend Developer', dept: 'Engineering', skills: ['React', 'JavaScript'], wallet: null },
    { name: 'Sneha Reddy', email: 'sneha@rizetech.com', role: 'Backend Developer', dept: 'Engineering', skills: ['Node.js', 'Express', 'PostgreSQL', 'Docker', 'Redis'], wallet: '0x5678...efgh' },
    { name: 'Rahul Kumar', email: 'rahul@rizetech.com', role: 'Backend Developer', dept: 'Engineering', skills: ['Node.js', 'Express'], wallet: null },
    { name: 'Ananya Gupta', email: 'ananya@rizetech.com', role: 'DevOps Engineer', dept: 'Infrastructure', skills: ['Docker', 'AWS', 'Linux'], wallet: null },
    { name: 'Vikram Singh', email: 'vikram@rizetech.com', role: 'Data Scientist', dept: 'AI/ML', skills: ['Python', 'TensorFlow', 'SQL', 'Pandas'], wallet: null },
    { name: 'Kavya Nair', email: 'kavya@rizetech.com', role: 'UI/UX Designer', dept: 'Design', skills: ['Figma', 'Adobe XD', 'CSS'], wallet: null },
    { name: 'Rohan Mehta', email: 'rohan@rizetech.com', role: 'Project Manager', dept: 'Product', skills: ['Agile', 'Scrum', 'JIRA', 'Communication'], wallet: null },
];

const empIds = [];
const insertEmps = db.transaction(() => {
    for (const emp of employees) {
        const result = insertEmp.run(orgId, emp.name, emp.email, emp.role, emp.dept, JSON.stringify(emp.skills), emp.wallet);
        empIds.push(result.lastInsertRowid);
    }
});
insertEmps();

// Seed 12 tasks with varied statuses, deadlines, and completion times
const insertTask = db.prepare('INSERT INTO tasks (org_id, employee_id, title, description, status, deadline, completed_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

const now = new Date();
const daysAgo = (d) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString();
const daysFromNow = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const tasks = [
    // Priya — 3 tasks (2 completed on-time, 1 in progress) → high score
    { empIdx: 0, title: 'Design dashboard UI', desc: 'Create responsive dashboard with charts and stats', status: 'completed', deadline: daysFromNow(-5), completed_at: daysAgo(7), created_at: daysAgo(14) },
    { empIdx: 0, title: 'Implement auth screens', desc: 'Login and registration pages with validation', status: 'completed', deadline: daysFromNow(-2), completed_at: daysAgo(4), created_at: daysAgo(10) },
    { empIdx: 0, title: 'Build employee profile page', desc: 'Detailed view with skills and performance', status: 'in_progress', deadline: daysFromNow(5), completed_at: null, created_at: daysAgo(3) },

    // Arjun — 2 tasks (1 completed late, 1 assigned) → medium score
    { empIdx: 1, title: 'Fix navigation bugs', desc: 'Sidebar links not highlighting correctly', status: 'completed', deadline: daysFromNow(-10), completed_at: daysAgo(2), created_at: daysAgo(15) },
    { empIdx: 1, title: 'Add dark mode toggle', desc: 'User preference for light/dark theme', status: 'assigned', deadline: daysFromNow(7), completed_at: null, created_at: daysAgo(1) },

    // Sneha — 3 tasks (3 completed on-time) → excellent score
    { empIdx: 2, title: 'Build REST API endpoints', desc: 'CRUD for employees and tasks', status: 'completed', deadline: daysFromNow(-8), completed_at: daysAgo(10), created_at: daysAgo(20) },
    { empIdx: 2, title: 'Set up JWT authentication', desc: 'Middleware with role-based access control', status: 'completed', deadline: daysFromNow(-5), completed_at: daysAgo(7), created_at: daysAgo(15) },
    { empIdx: 2, title: 'Database optimization', desc: 'Add indexes and optimize slow queries', status: 'completed', deadline: daysFromNow(-1), completed_at: daysAgo(3), created_at: daysAgo(8) },

    // Rahul — 1 task (in progress) → low score
    { empIdx: 3, title: 'Implement webhooks system', desc: 'Real-time notifications via webhooks', status: 'in_progress', deadline: daysFromNow(3), completed_at: null, created_at: daysAgo(5) },

    // Ananya — 1 task (completed on-time) → good score
    { empIdx: 4, title: 'CI/CD pipeline setup', desc: 'GitHub Actions for automated deployment', status: 'completed', deadline: daysFromNow(-3), completed_at: daysAgo(5), created_at: daysAgo(12) },

    // Vikram — 1 task (assigned, no data yet)
    { empIdx: 5, title: 'Build ML prediction model', desc: 'Employee attrition prediction using historical data', status: 'assigned', deadline: daysFromNow(14), completed_at: null, created_at: daysAgo(2) },

    // Kavya — 1 task (in progress)
    { empIdx: 6, title: 'Redesign onboarding flow', desc: 'Improve new user experience with step-by-step wizard', status: 'in_progress', deadline: daysFromNow(7), completed_at: null, created_at: daysAgo(4) },
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
console.log(`   Statuses: ${tasks.filter(t => t.status === 'completed').length} completed, ${tasks.filter(t => t.status === 'in_progress').length} in progress, ${tasks.filter(t => t.status === 'assigned').length} assigned`);

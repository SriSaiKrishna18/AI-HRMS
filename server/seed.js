/**
 * Seed script — populates the database with realistic demo data.
 * Run: node seed.js
 * Creates a demo org, 40 employees across 8 departments, 80+ tasks, and 45 payroll records.
 * Also auto-called on server start if database is empty (Render ephemeral FS).
 */
const bcrypt = require('bcryptjs');
const db = require('./config/db');

function runSeed() {
    // Clear existing data for clean seed
    db.exec('DELETE FROM payroll_records');
    db.exec('DELETE FROM tasks');
    db.exec('DELETE FROM employees');
    db.exec('DELETE FROM organizations');

    // Create demo organization
    const orgPassword = bcrypt.hashSync('demo123', 10);
    const org = db.prepare('INSERT INTO organizations (name, email, password_hash) VALUES (?, ?, ?)').run(
        'RizeTech Solutions', 'admin@rizetech.com', orgPassword
    );
    const orgId = org.lastInsertRowid;

    // ── 40 Employees across 8 departments ──────────────────────
    const insertEmp = db.prepare('INSERT INTO employees (org_id, name, email, role, department, skills, wallet_address) VALUES (?, ?, ?, ?, ?, ?, ?)');

    const employees = [
        // ─── Engineering (10) ───
        { name: 'Priya Sharma', email: 'priya@rizetech.com', role: 'Senior Frontend Developer', dept: 'Engineering', skills: ['React', 'JavaScript', 'CSS', 'TypeScript', 'Next.js'], wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28' },
        { name: 'Arjun Patel', email: 'arjun@rizetech.com', role: 'Frontend Developer', dept: 'Engineering', skills: ['React', 'JavaScript', 'Tailwind CSS'], wallet: null },
        { name: 'Sneha Reddy', email: 'sneha@rizetech.com', role: 'Senior Backend Developer', dept: 'Engineering', skills: ['Node.js', 'Express', 'PostgreSQL', 'Docker', 'Redis', 'GraphQL'], wallet: '0x53d284357ec70cE289D6D64134DfAc8E511c8a3D' },
        { name: 'Rahul Kumar', email: 'rahul@rizetech.com', role: 'Backend Developer', dept: 'Engineering', skills: ['Node.js', 'Express', 'MongoDB'], wallet: null },
        { name: 'Deepak Joshi', email: 'deepak@rizetech.com', role: 'Full Stack Developer', dept: 'Engineering', skills: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'TypeScript', 'AWS'], wallet: '0xAb5801a7D398351b8bE11C439e05C5b3259aeC9B' },
        { name: 'Aisha Khan', email: 'aisha@rizetech.com', role: 'Frontend Developer', dept: 'Engineering', skills: ['React', 'Vue.js', 'CSS', 'JavaScript'], wallet: null },
        { name: 'Manish Tiwari', email: 'manish@rizetech.com', role: 'Backend Developer', dept: 'Engineering', skills: ['Golang', 'gRPC', 'PostgreSQL', 'Docker'], wallet: null },
        { name: 'Shruti Verma', email: 'shruti@rizetech.com', role: 'QA Engineer', dept: 'Engineering', skills: ['Selenium', 'Cypress', 'Jest', 'Playwright'], wallet: null },
        { name: 'Nikhil Saxena', email: 'nikhil@rizetech.com', role: 'Mobile Developer', dept: 'Engineering', skills: ['React Native', 'Flutter', 'Swift', 'Kotlin'], wallet: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
        { name: 'Pooja Agarwal', email: 'pooja@rizetech.com', role: 'Software Engineer', dept: 'Engineering', skills: ['Python', 'Django', 'REST API', 'PostgreSQL'], wallet: null },

        // ─── Infrastructure (4) ───
        { name: 'Ananya Gupta', email: 'ananya@rizetech.com', role: 'DevOps Engineer', dept: 'Infrastructure', skills: ['Docker', 'AWS', 'Linux', 'Terraform', 'Ansible'], wallet: null },
        { name: 'Siddharth Rao', email: 'siddharth@rizetech.com', role: 'Senior DevOps Engineer', dept: 'Infrastructure', skills: ['Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Helm'], wallet: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
        { name: 'Ravi Shankar', email: 'ravi@rizetech.com', role: 'SRE', dept: 'Infrastructure', skills: ['Prometheus', 'Grafana', 'PagerDuty', 'Linux', 'Python'], wallet: null },
        { name: 'Divya Mishra', email: 'divya@rizetech.com', role: 'Cloud Engineer', dept: 'Infrastructure', skills: ['AWS', 'GCP', 'Terraform', 'CloudFormation'], wallet: null },

        // ─── AI/ML (5) ───
        { name: 'Vikram Singh', email: 'vikram@rizetech.com', role: 'Lead Data Scientist', dept: 'AI/ML', skills: ['Python', 'TensorFlow', 'SQL', 'Pandas', 'MLOps'], wallet: null },
        { name: 'Meera Iyer', email: 'meera@rizetech.com', role: 'Data Scientist', dept: 'AI/ML', skills: ['Python', 'Scikit-learn', 'Statistics', 'SQL', 'Pandas'], wallet: null },
        { name: 'Harsh Pandey', email: 'harsh@rizetech.com', role: 'ML Engineer', dept: 'AI/ML', skills: ['PyTorch', 'ONNX', 'Python', 'Docker', 'FastAPI'], wallet: null },
        { name: 'Priyanka Das', email: 'priyanka@rizetech.com', role: 'NLP Engineer', dept: 'AI/ML', skills: ['Python', 'Hugging Face', 'Transformers', 'spaCy'], wallet: null },
        { name: 'Suresh Babu', email: 'suresh@rizetech.com', role: 'Data Analyst', dept: 'AI/ML', skills: ['SQL', 'Tableau', 'Python', 'Excel', 'Power BI'], wallet: null },

        // ─── Design (4) ───
        { name: 'Kavya Nair', email: 'kavya@rizetech.com', role: 'Lead UI/UX Designer', dept: 'Design', skills: ['Figma', 'Adobe XD', 'CSS', 'Prototyping', 'User Research'], wallet: null },
        { name: 'Aditya Menon', email: 'aditya@rizetech.com', role: 'UI/UX Designer', dept: 'Design', skills: ['Figma', 'User Research', 'Design Systems'], wallet: null },
        { name: 'Ritika Jain', email: 'ritika@rizetech.com', role: 'Visual Designer', dept: 'Design', skills: ['Illustrator', 'Photoshop', 'Figma', 'Motion Graphics'], wallet: null },
        { name: 'Ankit Chawla', email: 'ankit@rizetech.com', role: 'UX Researcher', dept: 'Design', skills: ['User Interviews', 'Usability Testing', 'A/B Testing', 'Miro'], wallet: null },

        // ─── Product (4) ───
        { name: 'Rohan Mehta', email: 'rohan@rizetech.com', role: 'Senior Project Manager', dept: 'Product', skills: ['Agile', 'Scrum', 'JIRA', 'Communication', 'Roadmapping'], wallet: null },
        { name: 'Nisha Kapoor', email: 'nisha@rizetech.com', role: 'Product Manager', dept: 'Product', skills: ['Agile', 'Stakeholder Management', 'Risk Management', 'PRDs'], wallet: null },
        { name: 'Gaurav Sinha', email: 'gaurav@rizetech.com', role: 'Product Analyst', dept: 'Product', skills: ['SQL', 'Mixpanel', 'Amplitude', 'Excel'], wallet: null },
        { name: 'Megha Rathi', email: 'megha@rizetech.com', role: 'Scrum Master', dept: 'Product', skills: ['Scrum', 'SAFe', 'Facilitation', 'JIRA'], wallet: null },

        // ─── Marketing (5) ───
        { name: 'Tanvi Desai', email: 'tanvi@rizetech.com', role: 'Marketing Lead', dept: 'Marketing', skills: ['SEO', 'Content Strategy', 'Analytics', 'Social Media', 'HubSpot'], wallet: null },
        { name: 'Karan Bhatt', email: 'karan@rizetech.com', role: 'Growth Analyst', dept: 'Marketing', skills: ['SQL', 'Google Analytics', 'A/B Testing', 'Python'], wallet: '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8' },
        { name: 'Neha Malhotra', email: 'neha@rizetech.com', role: 'Content Writer', dept: 'Marketing', skills: ['Copywriting', 'SEO Writing', 'WordPress', 'Canva'], wallet: null },
        { name: 'Vivek Chauhan', email: 'vivek@rizetech.com', role: 'Social Media Manager', dept: 'Marketing', skills: ['Instagram', 'LinkedIn', 'Twitter', 'Buffer', 'Canva'], wallet: null },
        { name: 'Swati Pillai', email: 'swati@rizetech.com', role: 'Performance Marketer', dept: 'Marketing', skills: ['Google Ads', 'Facebook Ads', 'Analytics', 'CRO'], wallet: null },

        // ─── Sales (4) ───
        { name: 'Amit Deshpande', email: 'amit@rizetech.com', role: 'Sales Lead', dept: 'Sales', skills: ['CRM', 'Salesforce', 'Negotiation', 'Pipeline Management'], wallet: null },
        { name: 'Lakshmi Venkat', email: 'lakshmi@rizetech.com', role: 'Account Executive', dept: 'Sales', skills: ['B2B Sales', 'Cold Outreach', 'HubSpot', 'Demo Skills'], wallet: null },
        { name: 'Rajesh Nair', email: 'rajesh@rizetech.com', role: 'SDR', dept: 'Sales', skills: ['Prospecting', 'LinkedIn Sales Nav', 'Email Outreach', 'CRM'], wallet: null },
        { name: 'Sunita Sharma', email: 'sunita@rizetech.com', role: 'Customer Success Manager', dept: 'Sales', skills: ['Onboarding', 'Retention', 'Intercom', 'Communication'], wallet: null },

        // ─── HR & Operations (4) ───
        { name: 'Pallavi Kulkarni', email: 'pallavi@rizetech.com', role: 'HR Manager', dept: 'HR & Operations', skills: ['Recruitment', 'Employee Relations', 'HRIS', 'Compliance'], wallet: null },
        { name: 'Sanjay Mohan', email: 'sanjay@rizetech.com', role: 'Operations Lead', dept: 'HR & Operations', skills: ['Process Optimization', 'Vendor Management', 'Budgeting'], wallet: null },
        { name: 'Isha Bhandari', email: 'isha@rizetech.com', role: 'Recruiter', dept: 'HR & Operations', skills: ['Talent Acquisition', 'ATS', 'Sourcing', 'LinkedIn'], wallet: null },
        { name: 'Varun Kapil', email: 'varun@rizetech.com', role: 'Finance Analyst', dept: 'HR & Operations', skills: ['Excel', 'Financial Modeling', 'SAP', 'Budgeting'], wallet: null },
    ];

    const empIds = [];
    const insertEmps = db.transaction(() => {
        for (const emp of employees) {
            const result = insertEmp.run(orgId, emp.name, emp.email, emp.role, emp.dept, JSON.stringify(emp.skills), emp.wallet);
            empIds.push(result.lastInsertRowid);
        }
    });
    insertEmps();

    // ── 80 Tasks with varied statuses, deadlines, and completions ──
    const insertTask = db.prepare('INSERT INTO tasks (org_id, employee_id, title, description, status, deadline, completed_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

    const now = new Date();
    const daysAgo = (d) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString();
    const daysFromNow = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const tasks = [
        // ─── Priya (0) — 5 tasks (4 completed, 1 in progress) → top performer ───
        { empIdx: 0, title: 'Design dashboard UI', desc: 'Create responsive dashboard with charts and stats', status: 'completed', deadline: daysFromNow(-5), completed_at: daysAgo(7), created_at: daysAgo(14) },
        { empIdx: 0, title: 'Implement auth screens', desc: 'Login and registration pages with validation', status: 'completed', deadline: daysFromNow(-2), completed_at: daysAgo(4), created_at: daysAgo(10) },
        { empIdx: 0, title: 'Build employee profile page', desc: 'Detailed view with skills and performance', status: 'in_progress', deadline: daysFromNow(5), completed_at: null, created_at: daysAgo(3) },
        { empIdx: 0, title: 'Implement dark mode', desc: 'System-wide dark/light theme toggle', status: 'completed', deadline: daysFromNow(-1), completed_at: daysAgo(2), created_at: daysAgo(8) },
        { empIdx: 0, title: 'Build notification panel', desc: 'Real-time notification dropdown with unread count', status: 'completed', deadline: daysFromNow(-3), completed_at: daysAgo(5), created_at: daysAgo(12) },

        // ─── Arjun (1) — 4 tasks (1 completed late, 2 in progress, 1 assigned) → medium ───
        { empIdx: 1, title: 'Fix navigation bugs', desc: 'Sidebar links not highlighting correctly', status: 'completed', deadline: daysFromNow(-10), completed_at: daysAgo(2), created_at: daysAgo(15) },
        { empIdx: 1, title: 'Add dark mode toggle', desc: 'User preference for light/dark theme', status: 'assigned', deadline: daysFromNow(7), completed_at: null, created_at: daysAgo(1) },
        { empIdx: 1, title: 'Responsive table component', desc: 'Tables should scroll horizontally on mobile', status: 'in_progress', deadline: daysFromNow(4), completed_at: null, created_at: daysAgo(3) },
        { empIdx: 1, title: 'Implement search filters', desc: 'Add department and role filters to employee list', status: 'in_progress', deadline: daysFromNow(6), completed_at: null, created_at: daysAgo(2) },

        // ─── Sneha (2) — 5 tasks (5 completed on-time) → star performer ───
        { empIdx: 2, title: 'Build REST API endpoints', desc: 'CRUD for employees and tasks', status: 'completed', deadline: daysFromNow(-8), completed_at: daysAgo(10), created_at: daysAgo(20) },
        { empIdx: 2, title: 'Set up JWT authentication', desc: 'Middleware with role-based access control', status: 'completed', deadline: daysFromNow(-5), completed_at: daysAgo(7), created_at: daysAgo(15) },
        { empIdx: 2, title: 'Database optimization', desc: 'Add indexes and optimize slow queries', status: 'completed', deadline: daysFromNow(-1), completed_at: daysAgo(3), created_at: daysAgo(8) },
        { empIdx: 2, title: 'Implement rate limiting', desc: 'Protect API from brute force attacks', status: 'completed', deadline: daysFromNow(-2), completed_at: daysAgo(4), created_at: daysAgo(6) },
        { empIdx: 2, title: 'Build analytics aggregation API', desc: 'Efficient queries for dashboard charts', status: 'completed', deadline: daysFromNow(-1), completed_at: daysAgo(2), created_at: daysAgo(7) },

        // ─── Rahul (3) — 3 tasks (1 in progress, 1 assigned, 1 completed) → low ───
        { empIdx: 3, title: 'Implement webhooks system', desc: 'Real-time notifications via webhooks', status: 'in_progress', deadline: daysFromNow(3), completed_at: null, created_at: daysAgo(5) },
        { empIdx: 3, title: 'Build caching layer', desc: 'Redis caching for frequent queries', status: 'assigned', deadline: daysFromNow(10), completed_at: null, created_at: daysAgo(1) },
        { empIdx: 3, title: 'Write unit tests for auth', desc: 'Jest test suite for login/register endpoints', status: 'completed', deadline: daysFromNow(-4), completed_at: daysAgo(6), created_at: daysAgo(11) },

        // ─── Deepak (4) — 4 tasks (3 completed, 1 in progress) → high ───
        { empIdx: 4, title: 'Full-stack employee module', desc: 'Complete CRUD with frontend and backend', status: 'completed', deadline: daysFromNow(-6), completed_at: daysAgo(8), created_at: daysAgo(18) },
        { empIdx: 4, title: 'API documentation', desc: 'Swagger/OpenAPI docs for all endpoints', status: 'completed', deadline: daysFromNow(-3), completed_at: daysAgo(5), created_at: daysAgo(12) },
        { empIdx: 4, title: 'Microservices migration plan', desc: 'Architecture proposal for service decomposition', status: 'in_progress', deadline: daysFromNow(14), completed_at: null, created_at: daysAgo(3) },
        { empIdx: 4, title: 'Build GraphQL gateway', desc: 'Unified API gateway for frontend consumption', status: 'completed', deadline: daysFromNow(-2), completed_at: daysAgo(4), created_at: daysAgo(9) },

        // ─── Aisha (5) — 3 tasks (2 completed, 1 in progress) ───
        { empIdx: 5, title: 'Build modal components', desc: 'Reusable modal system with animations', status: 'completed', deadline: daysFromNow(-4), completed_at: daysAgo(6), created_at: daysAgo(11) },
        { empIdx: 5, title: 'Implement form validation', desc: 'Client-side validation with error messages', status: 'completed', deadline: daysFromNow(-2), completed_at: daysAgo(3), created_at: daysAgo(8) },
        { empIdx: 5, title: 'Build chart components', desc: 'Recharts integrations for analytics pages', status: 'in_progress', deadline: daysFromNow(5), completed_at: null, created_at: daysAgo(2) },

        // ─── Manish (6) — 3 tasks (2 completed, 1 assigned) ───
        { empIdx: 6, title: 'Build gRPC services', desc: 'High-performance internal service communication', status: 'completed', deadline: daysFromNow(-5), completed_at: daysAgo(7), created_at: daysAgo(13) },
        { empIdx: 6, title: 'Database migration tool', desc: 'Automated schema versioning and rollback', status: 'completed', deadline: daysFromNow(-3), completed_at: daysAgo(5), created_at: daysAgo(10) },
        { empIdx: 6, title: 'Build event queue', desc: 'BullMQ-based async task processing pipeline', status: 'assigned', deadline: daysFromNow(12), completed_at: null, created_at: daysAgo(1) },

        // ─── Shruti (7) — 3 tasks (2 completed, 1 in progress) ───
        { empIdx: 7, title: 'E2E test suite', desc: 'Cypress tests for critical user flows', status: 'completed', deadline: daysFromNow(-3), completed_at: daysAgo(5), created_at: daysAgo(10) },
        { empIdx: 7, title: 'API integration tests', desc: 'Test all REST endpoints with edge cases', status: 'completed', deadline: daysFromNow(-1), completed_at: daysAgo(2), created_at: daysAgo(7) },
        { empIdx: 7, title: 'Performance testing', desc: 'Load test with k6 for 1000 concurrent users', status: 'in_progress', deadline: daysFromNow(5), completed_at: null, created_at: daysAgo(3) },

        // ─── Nikhil (8) — 2 tasks (1 completed, 1 in progress) ───
        { empIdx: 8, title: 'Build mobile app MVP', desc: 'React Native app with auth and dashboard', status: 'completed', deadline: daysFromNow(-5), completed_at: daysAgo(7), created_at: daysAgo(16) },
        { empIdx: 8, title: 'Push notifications', desc: 'Firebase FCM integration for mobile alerts', status: 'in_progress', deadline: daysFromNow(8), completed_at: null, created_at: daysAgo(4) },

        // ─── Pooja (9) — 2 tasks (1 completed, 1 assigned) ───
        { empIdx: 9, title: 'Build Python ETL pipeline', desc: 'Data ingestion from CSV/Excel to DB', status: 'completed', deadline: daysFromNow(-2), completed_at: daysAgo(4), created_at: daysAgo(9) },
        { empIdx: 9, title: 'Reporting API', desc: 'Generate PDF/CSV reports for payroll and tasks', status: 'assigned', deadline: daysFromNow(10), completed_at: null, created_at: daysAgo(2) },

        // ─── Ananya (10) — 3 tasks (2 completed, 1 in progress) ───
        { empIdx: 10, title: 'CI/CD pipeline setup', desc: 'GitHub Actions for automated deployment', status: 'completed', deadline: daysFromNow(-3), completed_at: daysAgo(5), created_at: daysAgo(12) },
        { empIdx: 10, title: 'Infrastructure monitoring', desc: 'Set up Prometheus + Grafana dashboards', status: 'in_progress', deadline: daysFromNow(7), completed_at: null, created_at: daysAgo(4) },
        { empIdx: 10, title: 'Terraform modules', desc: 'Reusable IaC modules for staging/prod environments', status: 'completed', deadline: daysFromNow(-6), completed_at: daysAgo(8), created_at: daysAgo(15) },

        // ─── Siddharth (11) — 3 tasks (2 completed, 1 assigned) ───
        { empIdx: 11, title: 'Kubernetes cluster setup', desc: 'Production-ready K8s cluster on AWS EKS', status: 'completed', deadline: daysFromNow(-4), completed_at: daysAgo(6), created_at: daysAgo(14) },
        { empIdx: 11, title: 'Disaster recovery plan', desc: 'Backup and recovery procedures documentation', status: 'assigned', deadline: daysFromNow(21), completed_at: null, created_at: daysAgo(2) },
        { empIdx: 11, title: 'Helm chart authoring', desc: 'Package all services as Helm charts', status: 'completed', deadline: daysFromNow(-2), completed_at: daysAgo(4), created_at: daysAgo(9) },

        // ─── Ravi (12) — 2 tasks (1 completed, 1 in progress) ───
        { empIdx: 12, title: 'Alerting rules setup', desc: 'PagerDuty integration with escalation policies', status: 'completed', deadline: daysFromNow(-1), completed_at: daysAgo(3), created_at: daysAgo(7) },
        { empIdx: 12, title: 'Runbook documentation', desc: 'Incident response playbooks for all services', status: 'in_progress', deadline: daysFromNow(10), completed_at: null, created_at: daysAgo(5) },

        // ─── Divya (13) — 2 tasks (1 completed, 1 assigned) ───
        { empIdx: 13, title: 'Multi-region deployment', desc: 'Deploy to AWS us-east-1 and ap-south-1', status: 'completed', deadline: daysFromNow(-3), completed_at: daysAgo(5), created_at: daysAgo(12) },
        { empIdx: 13, title: 'Cost optimization audit', desc: 'Reduce AWS spend by 30% through right-sizing', status: 'assigned', deadline: daysFromNow(14), completed_at: null, created_at: daysAgo(3) },

        // ─── Vikram (14) — 3 tasks (2 completed, 1 assigned) ───
        { empIdx: 14, title: 'Build ML prediction model', desc: 'Employee attrition prediction using historical data', status: 'completed', deadline: daysFromNow(-2), completed_at: daysAgo(4), created_at: daysAgo(10) },
        { empIdx: 14, title: 'Sentiment analysis pipeline', desc: 'NLP-based analysis of employee feedback', status: 'assigned', deadline: daysFromNow(14), completed_at: null, created_at: daysAgo(2) },
        { empIdx: 14, title: 'Model versioning system', desc: 'MLflow setup for experiment tracking', status: 'completed', deadline: daysFromNow(-4), completed_at: daysAgo(6), created_at: daysAgo(13) },

        // ─── Meera (15) — 2 tasks (1 completed, 1 in progress) ───
        { empIdx: 15, title: 'A/B test analytics dashboard', desc: 'Statistical significance calculator for experiments', status: 'in_progress', deadline: daysFromNow(10), completed_at: null, created_at: daysAgo(5) },
        { empIdx: 15, title: 'Churn prediction model', desc: 'Logistic regression model for customer churn', status: 'completed', deadline: daysFromNow(-3), completed_at: daysAgo(5), created_at: daysAgo(11) },

        // ─── Harsh (16) — 2 tasks (1 completed, 1 in progress) ───
        { empIdx: 16, title: 'Deploy ML model to production', desc: 'FastAPI endpoint with model inference', status: 'completed', deadline: daysFromNow(-2), completed_at: daysAgo(4), created_at: daysAgo(8) },
        { empIdx: 16, title: 'Build recommendation engine', desc: 'Collaborative filtering for task suggestions', status: 'in_progress', deadline: daysFromNow(12), completed_at: null, created_at: daysAgo(3) },

        // ─── Priyanka (17) — 2 tasks (1 completed, 1 assigned) ───
        { empIdx: 17, title: 'Build chatbot prototype', desc: 'LLM-powered HR assistant using RAG', status: 'completed', deadline: daysFromNow(-1), completed_at: daysAgo(3), created_at: daysAgo(9) },
        { empIdx: 17, title: 'Resume parser', desc: 'Extract skills and experience from uploaded resumes', status: 'assigned', deadline: daysFromNow(20), completed_at: null, created_at: daysAgo(1) },

        // ─── Suresh (18) — 2 tasks (1 completed, 1 in progress) ───
        { empIdx: 18, title: 'Executive dashboard reports', desc: 'Weekly automated PDF reports for leadership', status: 'completed', deadline: daysFromNow(-3), completed_at: daysAgo(5), created_at: daysAgo(10) },
        { empIdx: 18, title: 'Data warehouse design', desc: 'Star schema design for analytics queries', status: 'in_progress', deadline: daysFromNow(8), completed_at: null, created_at: daysAgo(4) },

        // ─── Kavya (19) — 3 tasks (2 completed, 1 in progress) ───
        { empIdx: 19, title: 'Redesign onboarding flow', desc: 'Step-by-step wizard for new user experience', status: 'completed', deadline: daysFromNow(-1), completed_at: daysAgo(3), created_at: daysAgo(7) },
        { empIdx: 19, title: 'Design system components', desc: 'Reusable UI component library in Figma', status: 'in_progress', deadline: daysFromNow(7), completed_at: null, created_at: daysAgo(4) },
        { empIdx: 19, title: 'Accessibility audit', desc: 'WCAG 2.1 AA compliance review and fixes', status: 'completed', deadline: daysFromNow(-2), completed_at: daysAgo(4), created_at: daysAgo(10) },

        // ─── Aditya (20) — 2 tasks ───
        { empIdx: 20, title: 'User research interviews', desc: 'Conduct 10 user interviews for feature validation', status: 'assigned', deadline: daysFromNow(14), completed_at: null, created_at: daysAgo(1) },
        { empIdx: 20, title: 'Competitor analysis', desc: 'Analyze top 5 HR tools for feature parity', status: 'completed', deadline: daysFromNow(-4), completed_at: daysAgo(6), created_at: daysAgo(12) },

        // ─── Rohan (23) — 2 tasks ───
        { empIdx: 23, title: 'Sprint planning framework', desc: 'Define agile ceremonies and velocity tracking', status: 'completed', deadline: daysFromNow(-7), completed_at: daysAgo(9), created_at: daysAgo(16) },
        { empIdx: 23, title: 'Quarterly roadmap', desc: 'Q2 2026 product roadmap with milestones', status: 'in_progress', deadline: daysFromNow(10), completed_at: null, created_at: daysAgo(5) },

        // ─── Nisha (24) — 2 tasks ───
        { empIdx: 24, title: 'Q1 OKR definition', desc: 'Define quarterly objectives and key results', status: 'in_progress', deadline: daysFromNow(-2), completed_at: null, created_at: daysAgo(10) },
        { empIdx: 24, title: 'Stakeholder reporting', desc: 'Monthly progress report for board', status: 'completed', deadline: daysFromNow(-5), completed_at: daysAgo(7), created_at: daysAgo(14) },

        // ─── Tanvi (27) — 3 tasks (2 completed, 1 in progress) ───
        { empIdx: 27, title: 'SEO audit and optimization', desc: 'Full site SEO audit with recommendations', status: 'completed', deadline: daysFromNow(-3), completed_at: daysAgo(5), created_at: daysAgo(10) },
        { empIdx: 27, title: 'Content calendar Q2', desc: 'Plan 30 blog posts and 60 social media posts', status: 'in_progress', deadline: daysFromNow(7), completed_at: null, created_at: daysAgo(3) },
        { empIdx: 27, title: 'Email drip campaign', desc: 'Onboarding email sequence for new signups', status: 'completed', deadline: daysFromNow(-1), completed_at: daysAgo(2), created_at: daysAgo(6) },

        // ─── Karan (28) — 2 tasks ───
        { empIdx: 28, title: 'Growth metrics dashboard', desc: 'Track CAC, LTV, churn, and MRR', status: 'in_progress', deadline: daysFromNow(7), completed_at: null, created_at: daysAgo(3) },
        { empIdx: 28, title: 'Attribution model', desc: 'Multi-touch attribution for marketing channels', status: 'completed', deadline: daysFromNow(-2), completed_at: daysAgo(4), created_at: daysAgo(9) },

        // ─── Neha (29) — 2 tasks ───
        { empIdx: 29, title: 'Product launch blog post', desc: 'Comprehensive launch announcement article', status: 'completed', deadline: daysFromNow(-2), completed_at: daysAgo(3), created_at: daysAgo(7) },
        { empIdx: 29, title: 'Case study: pilot customer', desc: 'Success story with metrics from beta user', status: 'assigned', deadline: daysFromNow(14), completed_at: null, created_at: daysAgo(2) },

        // ─── Amit (31) — 2 tasks ───
        { empIdx: 31, title: 'Sales playbook', desc: 'Objection handling and demo scripts', status: 'completed', deadline: daysFromNow(-4), completed_at: daysAgo(6), created_at: daysAgo(12) },
        { empIdx: 31, title: 'Enterprise pipeline', desc: 'Identify and qualify 20 enterprise prospects', status: 'in_progress', deadline: daysFromNow(14), completed_at: null, created_at: daysAgo(5) },

        // ─── Lakshmi (32) — 2 tasks ───
        { empIdx: 32, title: 'Demo deck creation', desc: 'Interactive product demo for sales calls', status: 'completed', deadline: daysFromNow(-3), completed_at: daysAgo(5), created_at: daysAgo(10) },
        { empIdx: 32, title: 'Close 5 pilot deals', desc: 'Convert free trial users to paid plans', status: 'in_progress', deadline: daysFromNow(21), completed_at: null, created_at: daysAgo(7) },

        // ─── Pallavi (35) — 2 tasks ───
        { empIdx: 35, title: 'Onboarding process design', desc: 'New hire onboarding checklist and workflow', status: 'completed', deadline: daysFromNow(-2), completed_at: daysAgo(4), created_at: daysAgo(8) },
        { empIdx: 35, title: 'Performance review cycle', desc: 'Set up quarterly review templates and process', status: 'in_progress', deadline: daysFromNow(14), completed_at: null, created_at: daysAgo(3) },

        // ─── Sanjay (36) — 2 tasks ───
        { empIdx: 36, title: 'Vendor evaluation', desc: 'Compare 5 HRIS vendors for feature parity', status: 'completed', deadline: daysFromNow(-5), completed_at: daysAgo(7), created_at: daysAgo(14) },
        { empIdx: 36, title: 'Office ops automation', desc: 'Automate asset tracking and procurement', status: 'assigned', deadline: daysFromNow(21), completed_at: null, created_at: daysAgo(2) },

        // ─── Varun (38) — 2 tasks ───
        { empIdx: 38, title: 'Budget forecast Q2', desc: 'Department-wise budget projections', status: 'completed', deadline: daysFromNow(-1), completed_at: daysAgo(3), created_at: daysAgo(6) },
        { empIdx: 38, title: 'Expense report automation', desc: 'OCR-based receipt processing workflow', status: 'in_progress', deadline: daysFromNow(10), completed_at: null, created_at: daysAgo(4) },

        // ─── Ritika (21) — 1 task ───
        { empIdx: 21, title: 'Brand guidelines v2', desc: 'Updated brand book with new color palette', status: 'completed', deadline: daysFromNow(-3), completed_at: daysAgo(5), created_at: daysAgo(10) },

        // ─── Gaurav (25) — 1 task ───
        { empIdx: 25, title: 'Feature usage analytics', desc: 'Mixpanel dashboard for feature adoption', status: 'completed', deadline: daysFromNow(-2), completed_at: daysAgo(4), created_at: daysAgo(8) },

        // ─── Vivek (30) — 1 task ───
        { empIdx: 30, title: 'Social media launch campaign', desc: 'Coordinated launch across LinkedIn, Twitter, Instagram', status: 'completed', deadline: daysFromNow(-1), completed_at: daysAgo(2), created_at: daysAgo(5) },

        // ─── Sunita (34) — 1 task ───
        { empIdx: 34, title: 'Customer onboarding toolkit', desc: 'Welcome emails, guides, and video tutorials', status: 'in_progress', deadline: daysFromNow(7), completed_at: null, created_at: daysAgo(4) },
    ];

    const insertTasks = db.transaction(() => {
        for (const t of tasks) {
            insertTask.run(orgId, empIds[t.empIdx], t.title, t.desc, t.status, t.deadline, t.completed_at, t.created_at);
        }
    });
    insertTasks();

    // ── 45 Payroll Records across 3 months ──
    const insertPayroll = db.prepare(
        'INSERT INTO payroll_records (org_id, employee_id, amount, period, notes, tx_hash) VALUES (?, ?, ?, ?, ?, ?)'
    );

    const payrollRecords = [
        // December 2025
        { empIdx: 0, amount: 85000, period: '2025-12', notes: 'Monthly salary' },
        { empIdx: 2, amount: 95000, period: '2025-12', notes: 'Monthly salary' },
        { empIdx: 4, amount: 90000, period: '2025-12', notes: 'Monthly salary' },
        { empIdx: 10, amount: 75000, period: '2025-12', notes: 'Monthly salary' },
        { empIdx: 11, amount: 88000, period: '2025-12', notes: 'Monthly salary' },
        { empIdx: 14, amount: 92000, period: '2025-12', notes: 'Monthly salary' },
        { empIdx: 19, amount: 82000, period: '2025-12', notes: 'Monthly salary' },
        { empIdx: 23, amount: 78000, period: '2025-12', notes: 'Monthly salary' },
        { empIdx: 27, amount: 72000, period: '2025-12', notes: 'Monthly salary' },
        { empIdx: 31, amount: 76000, period: '2025-12', notes: 'Monthly salary' },
        { empIdx: 35, amount: 80000, period: '2025-12', notes: 'Monthly salary' },
        { empIdx: 38, amount: 70000, period: '2025-12', notes: 'Monthly salary' },
        { empIdx: 8, amount: 87000, period: '2025-12', notes: 'Monthly salary' },
        { empIdx: 16, amount: 84000, period: '2025-12', notes: 'Monthly salary' },
        { empIdx: 36, amount: 74000, period: '2025-12', notes: 'Monthly salary' },

        // January 2026
        { empIdx: 0, amount: 85000, period: '2026-01', notes: 'Monthly salary' },
        { empIdx: 1, amount: 65000, period: '2026-01', notes: 'Monthly salary' },
        { empIdx: 2, amount: 95000, period: '2026-01', notes: 'Monthly salary' },
        { empIdx: 3, amount: 62000, period: '2026-01', notes: 'Monthly salary' },
        { empIdx: 4, amount: 95000, period: '2026-01', notes: 'Monthly salary + performance bonus' },
        { empIdx: 5, amount: 63000, period: '2026-01', notes: 'Monthly salary' },
        { empIdx: 6, amount: 68000, period: '2026-01', notes: 'Monthly salary' },
        { empIdx: 7, amount: 58000, period: '2026-01', notes: 'Monthly salary' },
        { empIdx: 10, amount: 75000, period: '2026-01', notes: 'Monthly salary' },
        { empIdx: 11, amount: 88000, period: '2026-01', notes: 'Monthly salary' },
        { empIdx: 14, amount: 92000, period: '2026-01', notes: 'Monthly salary' },
        { empIdx: 15, amount: 78000, period: '2026-01', notes: 'Monthly salary' },
        { empIdx: 19, amount: 82000, period: '2026-01', notes: 'Monthly salary' },
        { empIdx: 23, amount: 78000, period: '2026-01', notes: 'Monthly salary' },
        { empIdx: 27, amount: 72000, period: '2026-01', notes: 'Monthly salary' },

        // February 2026
        { empIdx: 0, amount: 85000, period: '2026-02', notes: 'Monthly salary' },
        { empIdx: 1, amount: 65000, period: '2026-02', notes: 'Monthly salary' },
        { empIdx: 2, amount: 100000, period: '2026-02', notes: 'Monthly salary + promotion raise' },
        { empIdx: 3, amount: 62000, period: '2026-02', notes: 'Monthly salary' },
        { empIdx: 4, amount: 90000, period: '2026-02', notes: 'Monthly salary' },
        { empIdx: 8, amount: 87000, period: '2026-02', notes: 'Monthly salary' },
        { empIdx: 10, amount: 75000, period: '2026-02', notes: 'Monthly salary' },
        { empIdx: 11, amount: 90000, period: '2026-02', notes: 'Monthly salary + on-call bonus' },
        { empIdx: 14, amount: 92000, period: '2026-02', notes: 'Monthly salary' },
        { empIdx: 16, amount: 84000, period: '2026-02', notes: 'Monthly salary' },
        { empIdx: 19, amount: 82000, period: '2026-02', notes: 'Monthly salary' },
        { empIdx: 27, amount: 75000, period: '2026-02', notes: 'Monthly salary + increment' },
        { empIdx: 31, amount: 76000, period: '2026-02', notes: 'Monthly salary' },
        { empIdx: 35, amount: 80000, period: '2026-02', notes: 'Monthly salary' },
        { empIdx: 38, amount: 70000, period: '2026-02', notes: 'Monthly salary' },
    ];

    const insertPayrolls = db.transaction(() => {
        for (const p of payrollRecords) {
            insertPayroll.run(orgId, empIds[p.empIdx], p.amount, p.period, p.notes, null);
        }
    });
    insertPayrolls();

    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const assigned = tasks.filter(t => t.status === 'assigned').length;
    const depts = [...new Set(employees.map(e => e.dept))];

    console.log('✅ Seed complete!');
    console.log(`   Organization: RizeTech Solutions (admin@rizetech.com / demo123)`);
    console.log(`   Employees: ${employees.length} across ${depts.length} departments`);
    console.log(`   Tasks: ${tasks.length} (${completed} completed, ${inProgress} in progress, ${assigned} assigned)`);
    console.log(`   Payroll records: ${payrollRecords.length} across 3 months`);
    console.log(`   Departments: ${depts.join(', ')}`);
}

// Run directly via `node seed.js`
if (require.main === module) {
    runSeed();
}

module.exports = { runSeed };

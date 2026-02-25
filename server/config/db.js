const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'rizeos.db');

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT NOT NULL,
      skills TEXT DEFAULT '[]',
      wallet_address TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER NOT NULL,
      employee_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'assigned' CHECK(status IN ('assigned', 'in_progress', 'completed')),
      deadline DATETIME,
      tx_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payroll_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_id INTEGER NOT NULL,
      employee_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      period TEXT NOT NULL,
      notes TEXT,
      tx_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS role_requirements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT UNIQUE NOT NULL,
      required_skills TEXT DEFAULT '[]',
      suggested_courses TEXT DEFAULT '[]'
    );
  `);

  // Seed role_requirements if empty
  const count = db.prepare('SELECT COUNT(*) as count FROM role_requirements').get();
  if (count.count === 0) {
    const insert = db.prepare('INSERT INTO role_requirements (role, required_skills, suggested_courses) VALUES (?, ?, ?)');
    const roles = [
      ['Frontend Developer', '["React","JavaScript","CSS","HTML","TypeScript","Tailwind"]', '["React Masterclass - Udemy","Advanced CSS - Frontend Masters","TypeScript Deep Dive"]'],
      ['Backend Developer', '["Node.js","Express","PostgreSQL","REST API","Docker","Redis"]', '["Node.js Complete Guide - Udemy","Docker & Kubernetes - Udemy","System Design Primer"]'],
      ['Full Stack Developer', '["React","Node.js","PostgreSQL","Docker","AWS","TypeScript"]', '["Full Stack Open - Helsinki","AWS Cloud Practitioner","Docker Mastery"]'],
      ['DevOps Engineer', '["Docker","Kubernetes","AWS","CI/CD","Terraform","Linux"]', '["AWS Solutions Architect - Udemy","Kubernetes CKA","Terraform Associate"]'],
      ['Data Scientist', '["Python","TensorFlow","SQL","Statistics","Pandas","Scikit-learn"]', '["Machine Learning - Coursera","Deep Learning Specialization","Statistics for DS"]'],
      ['UI/UX Designer', '["Figma","Adobe XD","Prototyping","User Research","CSS","Design Systems"]', '["Google UX Design Certificate","Figma Masterclass","Design Thinking"]'],
      ['Project Manager', '["Agile","Scrum","JIRA","Communication","Risk Management","Stakeholder Management"]', '["PMP Certification Prep","Agile & Scrum Masterclass","Leadership Skills"]'],
      ['Blockchain Developer', '["Solidity","Ethereum","Web3.js","Smart Contracts","Rust","DeFi"]', '["Ethereum & Solidity - Udemy","Blockchain Specialization - Coursera","DeFi Developer"]'],
    ];
    const insertMany = db.transaction((roles) => {
      for (const role of roles) insert.run(...role);
    });
    insertMany(roles);
  }
}

initializeDatabase();

module.exports = db;

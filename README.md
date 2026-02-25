# RizeOS — AI-Powered HRMS with Web3 Integration

<div align="center">

**🚀 An intelligent Human Resource Management System featuring AI workforce analytics, Web3 on-chain task & payroll verification, 5-chart analytics dashboard, and a clean enterprise UI with dark/light themes.**

[Live Demo](https://ai-hrms-iota.vercel.app) · [Backend API](https://ai-hrms-50sy.onrender.com/api/health) · [Architecture](./ARCHITECTURE.md) · [GTM Strategy](./GTM_STRATEGY.md)

</div>

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js 19 + Vite 7 + CSS Custom Properties (theming) |
| **Backend** | Node.js + Express.js |
| **Database** | SQLite (better-sqlite3 with WAL mode) |
| **Charting** | Recharts (5 visualizations) |
| **Blockchain** | Ethereum Sepolia Testnet + ethers.js + Solidity |
| **Wallet** | MetaMask |
| **AI/ML** | Custom scoring logic (no external API dependency) |
| **Auth** | JWT (JSON Web Tokens) + bcrypt |
| **Security** | Helmet, CORS, rate limiting, express-validator |

---

## ✨ Features

### Core HRMS
- 🔐 **Organization Authentication** — Register & login with JWT-based auth
- 👥 **Employee Management** — Full CRUD with roles, departments, skill tags, wallet addresses
- 📋 **Task Management** — Assign tasks, track status (assigned → in_progress → completed), deadline tracking
- 📊 **Dashboard** — Real-time stats, department performance, skill distribution, overdue alerts, top performers, activity feed
- 🔎 **Search & Filter** — Real-time employee search by name/role/department/email + department filter
- 📃 **CSV Export** — One-click employee data export to CSV
- 📄 **Pagination** — Server-side pagination on employees and tasks

### Advanced Analytics (Recharts)
- 📈 **Task Completion Trend** — 14-day line chart with daily granularity
- 📊 **Department Productivity** — Bar chart comparing completion rates across departments
- 🍩 **Task Status Distribution** — Donut chart (assigned / in_progress / completed)
- 🔠 **Skill Coverage** — Horizontal bar chart showing top 8 skills by frequency
- 🏆 **Performance Leaderboard** — Ranked table with color-coded progress bars

### AI Workforce Intelligence (4 Features)
- 📈 **Productivity Scoring** — Weighted formula: 40% completion rate + 30% deadline adherence + 20% activity recency + 10% volume bonus
  - Returns score (0–100) + rating (Exceptional / Strong / Average / Low / Needs Improvement)
- 🧩 **Skill Gap Detection** — Compares employee skills vs role requirements
  - Missing skills + match percentage + suggested courses (8 role profiles seeded)
- ⚡ **Smart Task Assignment** — AI-powered employee recommendation for new tasks
  - 50% skill match + 30% workload availability + 20% productivity history
  - Returns top 3 candidates with composite scores and reasoning
- 📉 **Performance Trend** — Dedicated 4-week rolling window analysis per employee
  - Weekly completion counts → `improving` / `stable` / `declining` trend with delta
  - Shows ↑ / → / ↓ indicators on employee table
- 🟢🟡🔴 **Workload Indicators** — Per-employee workload status (Available / Busy / Overloaded) with dashboard widget

### Web3 Integration
- 🦊 **MetaMask Wallet Connect** — One-click connection with Sepolia auto-switching
- ⛓️ **On-Chain Task Logging** — Task completion events logged to Ethereum Sepolia testnet
- 💰 **Payroll Proof On-Chain** — Mark payroll per employee per period, store tx hash, Etherscan links
- 🔗 **Etherscan Links** — Transaction hashes displayed on completed tasks and payroll records
- 📝 **Smart Contract** — `TaskLogger.sol` for permanent task completion + payroll records

### UI/UX
- 🌗 **Dark / Light Theme Toggle** — Top-right header toggle, persists via localStorage
- 🎨 **Custom Design System** — CSS custom properties, stat cards, badges, modals, progress bars
- 📱 **Responsive Layout** — Fixed sidebar + mobile hamburger menu
- 🔔 **Toast Notifications** — Real-time feedback for all actions
- 💥 **Error Boundary** — Graceful crash recovery
- 🔍 **404 Page** — Styled not-found page
- 👤 **Employee Profiles** — Detail panel with AI score, trend chart, weekly performance bars, payroll history, wallet link

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask browser extension (for Web3 features)

### 1. Clone the repository
```bash
git clone https://github.com/SriSaiKrishna18/AI-HRMS.git
cd AI-HRMS
```

### 2. Set up the backend
```bash
cd server
cp .env.example .env    # Edit JWT_SECRET if desired
npm install
npm start               # Starts on http://localhost:5000
```

> The server auto-seeds demo data on first run if the database is empty.

### 3. Set up the frontend
```bash
cd client
npm install
npm run dev             # Starts on http://localhost:5173
```

### 4. Open the app
Navigate to `http://localhost:5173`. Login with `admin@rizetech.com` / `demo123` or register a new organization.

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new organization |
| POST | `/api/auth/login` | Login & get JWT token |

### Employees
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/employees` | Add employee (validated) |
| GET | `/api/employees` | List employees (search, pagination) |
| GET | `/api/employees/:id` | Get single employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Remove employee |
| GET | `/api/employees/export/csv` | Export employees to CSV |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/tasks` | Assign task to employee |
| GET | `/api/tasks` | List tasks (filter by employee/status, paginated) |
| PUT | `/api/tasks/:id/status` | Update task status (validated transitions) |
| PUT | `/api/tasks/:id/tx-hash` | Store blockchain tx hash |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Organization-wide statistics |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics` | All analytics data (5 chart datasets) |

### AI Intelligence
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/ai/productivity/:id` | Productivity score (0-100) |
| GET | `/api/ai/skill-gap/:id` | Skill gap analysis + courses |
| GET | `/api/ai/suggest-assignment?skills=X,Y` | Smart task assignment — top 3 candidates |
| GET | `/api/ai/trend/:id` | 4-week performance trend |
| GET | `/api/ai/workload` | Team workload (Available/Busy/Overloaded) |

### Payroll
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/payroll` | Create payroll record |
| GET | `/api/payroll/:employeeId` | Get employee payroll history |
| PUT | `/api/payroll/:id/tx` | Store payroll tx hash |

### System
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check with uptime + memory diagnostics |

---

## 🧠 AI Logic Explained

### Productivity Score
```
Completion Rate    = (completed / total_tasks) × 100              [weight: 40%]
Deadline Adherence = (on_time / tasks_with_deadline) × 100        [weight: 30%]
Recency Bonus      = days_since_last_completion < 7 ? 100 : decay [weight: 20%]
Volume Bonus       = min(total_tasks × 10, 100)                   [weight: 10%]

Final Score = (Completion × 0.4) + (Deadline × 0.3) + (Recency × 0.2) + (Volume × 0.1)
```

- **Exceptional** (85–100): Consistently delivers on time
- **Strong** (70–84): Strong performance
- **Average** (50–69): Meeting expectations
- **Low** (30–49): Needs attention
- **Needs Improvement** (0–29): Urgent intervention needed

### Skill Gap Detection
- Maintains a `role_requirements` table with required skills per role (8 roles seeded)
- Compares employee skills (case-insensitive) against role requirements
- Returns **match percentage**, **missing skills**, and **suggested courses**

### Smart Task Assignment
```
Skill Score     = (matched_skills / required_skills) × 100   [weight: 50%]
Workload Score  = max(0, 100 - active_tasks × 25)            [weight: 30%]
Productivity    = (completed / total_tasks) × 100             [weight: 20%]

Composite = (Skill × 0.5) + (Workload × 0.3) + (Productivity × 0.2)
```

### Performance Trend
- 4-week rolling window with weekly completion counts
- Computes delta between recent and older weeks
- delta > 0 → `improving`, delta = 0 → `stable`, delta < 0 → `declining`

### Workload Assessment
- Counts active tasks (assigned + in_progress) per employee
- ≥ 4 tasks → 🔴 Overloaded, 2-3 tasks → 🟡 Busy, 0-1 tasks → 🟢 Available

---

## ⛓️ Web3 Integration Explained

### Architecture
1. **MetaMask Connection** — Frontend connects via ethers.js
2. **Sepolia Network** — Auto-switches to Sepolia testnet (chain ID: 11155111)
3. **On-Chain Logging** — Task completion + payroll proof logged as transaction data
4. **Tx Hash Storage** — Stored in database, displayed with Etherscan links

### Smart Contract
Located at `contracts/TaskLogger.sol`:
- `logTaskCompletion(address employee, uint taskId)` — Emits `TaskCompleted` event
- `logPayroll(address employee, uint amount)` — Emits `PayrollLogged` event
- Deploy via [Remix IDE](https://remix.ethereum.org) to Sepolia

---

## 📁 Project Structure

```
Rise_os/
├── server/                              # Backend API
│   ├── config/db.js                     # SQLite schema + WAL mode + role_requirements
│   ├── middleware/
│   │   ├── auth.js                      # JWT authentication middleware
│   │   └── validate.js                  # express-validator input sanitization
│   ├── controllers/
│   │   ├── authController.js            # Register + Login
│   │   ├── employeeController.js        # Employee CRUD + CSV export
│   │   ├── taskController.js            # Task management + Web3 tx storage
│   │   ├── dashboardController.js       # Dashboard statistics
│   │   ├── aiController.js              # AI: productivity + skill gap + assignment + trend + workload
│   │   ├── analyticsController.js       # Analytics: 5 chart datasets
│   │   └── payrollController.js         # Payroll CRUD + tx hash storage
│   ├── routes/                          # Express route files (auth, employees, tasks, dashboard, ai, analytics, payroll)
│   ├── seed.js                          # Demo data (15 employees, 30 tasks) — auto-runs on empty DB
│   ├── server.js                        # Entry point + middleware chain + auto-seed
│   └── .env.example                     # Environment template
├── client/                              # Frontend SPA
│   ├── src/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # Authentication state
│   │   │   └── ThemeContext.jsx         # Dark/light theme (localStorage)
│   │   ├── services/
│   │   │   ├── api.js                   # Axios + JWT interceptor + production auto-detect
│   │   │   └── web3.js                  # MetaMask + ethers.js + Sepolia integration
│   │   ├── components/
│   │   │   ├── Layout.jsx               # Sidebar nav + top header with theme toggle
│   │   │   ├── WalletConnect.jsx        # MetaMask connect/disconnect UI
│   │   │   └── ErrorBoundary.jsx        # Crash recovery
│   │   └── pages/
│   │       ├── LoginPage.jsx            # Auth UI
│   │       ├── DashboardPage.jsx        # Stats + workload widget + activity feed
│   │       ├── EmployeesPage.jsx        # Employee table + profiles + payroll UI
│   │       ├── TasksPage.jsx            # Task board + Web3 logging
│   │       ├── AnalyticsPage.jsx        # 5 Recharts visualizations
│   │       └── NotFoundPage.jsx         # 404
│   ├── index.html                       # SEO-optimized entry
│   └── vite.config.js                   # Vite config + API proxy
├── contracts/TaskLogger.sol             # Solidity smart contract
├── ARCHITECTURE.md                      # System design document
├── GTM_STRATEGY.md                      # Go-to-Market plan
└── README.md                            # This file
```

---

## 🛡️ Scalability Thinking

> **SQLite** is used intentionally for demo portability — zero-config, self-contained, auto-seeds on startup. See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed scaling rationale.

### Production Migration Path (100K Employees / 1M Task Logs):
- **Database**: PostgreSQL + connection pool (pg-pool), indexes on `employee_id`, `org_id`, `status`
- **Caching**: Redis for dashboard stats (TTL-based invalidation)
- **Search**: Elasticsearch for full-text employee/skill search
- **Queue**: Bull/BullMQ for background Web3 transactions
- **CDN**: Static assets via CloudFront/Vercel Edge
- **Monitoring**: Prometheus + Grafana for API metrics
- **Auth**: Refresh tokens, JWT secret rotation, rate-limited login

---

## ❓ FAQ

**Why 40/30/20/10 weighting for productivity?**
Completion rate (40%) is the primary output signal. Deadline adherence (30%) rewards punctuality. Activity recency (20%) ensures recently active employees score higher. Volume bonus (10%) rewards employees handling larger task loads.

**What happens when an employee has zero tasks?**
The API returns `score: 0`, `rating: 'Needs Improvement'`, and a message: *"No tasks assigned yet."* — no misleading score is generated.

**How is "active employee" defined?**
An employee who currently has at least one task with `status = 'in_progress'`. This is a dynamic measure of who is actively working, not a static database flag.

**What is the JWT expiry?**
24 hours. After expiry, the Axios interceptor automatically redirects to login.

**Why SQLite instead of PostgreSQL?**
Zero-config demo deployment. Auto-seeds on empty DB so evaluators always see data. Production path: PostgreSQL + connection pooling.

**Does the theme persist across refreshes?**
Yes, theme preference is stored in `localStorage` and restored on load.

---

## 📸 Screenshots

| Dashboard | Analytics |
|---|---|
| ![Dashboard](./screenshots/dashboard.png) | ![Analytics](./screenshots/analytics.png) |

| Employees | Tasks |
|---|---|
| ![Employees](./screenshots/employees.png) | ![Tasks](./screenshots/tasks.png) |

> Demo credentials: `admin@rizetech.com` / `demo123`

---

## 📄 License

MIT License — Free for educational and commercial use.

---

## 🔗 Live Links

| Resource | URL |
|---|---|
| **Frontend** | [ai-hrms-iota.vercel.app](https://ai-hrms-iota.vercel.app) |
| **Backend** | [ai-hrms-50sy.onrender.com](https://ai-hrms-50sy.onrender.com/api/health) |
| **GitHub** | [SriSaiKrishna18/AI-HRMS](https://github.com/SriSaiKrishna18/AI-HRMS) |
| **Demo Credentials** | `admin@rizetech.com` / `demo123` |

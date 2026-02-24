# RizeOS — AI-Powered HRMS with Web3 Integration

<div align="center">

**🚀 An intelligent Human Resource Management System featuring AI workforce analytics, Web3 on-chain task verification, and a clean enterprise dark UI.**

[Live Demo](https://ai-hrms-iota.vercel.app) · [Backend API](https://ai-hrms-50sy.onrender.com/api/health) · [GTM Strategy](./GTM_STRATEGY.md)

</div>

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js 19 + Vite 7 + Tailwind CSS v4 |
| **Backend** | Node.js + Express.js |
| **Database** | SQLite (dev) / PostgreSQL (production) |
| **Blockchain** | Ethereum Sepolia Testnet + ethers.js |
| **Wallet** | MetaMask |
| **AI/ML** | Custom scoring logic (no external API dependency) |
| **Auth** | JWT (JSON Web Tokens) + bcrypt |

---

## ✨ Features

### Core HRMS
- 🔐 **Organization Authentication** — Register & login with JWT-based auth
- 👥 **Employee Management** — Full CRUD with roles, departments, and skill tags
- 📋 **Task Management** — Assign tasks, track status (assigned → in_progress → completed)
- 📊 **Dashboard Analytics** — Real-time stats, top performers, department breakdown

### AI Workforce Intelligence
- 📈 **Productivity Scoring** — Weighted formula: 70% completion rate + 30% deadline adherence
  - Returns score (0–100) + rating label (Low / Medium / High / Excellent) + trend analysis
- 🧩 **Skill Gap Detection** — Compares employee skills vs role requirements
  - Returns missing skills + match percentage + suggested courses
  - Seeded with 8 role profiles (Frontend Dev, Backend Dev, DevOps, etc.)
- ⚡ **Smart Task Assignment** — AI-powered employee recommendation for new tasks
  - Ranks all employees by: 50% skill match + 30% workload availability + 20% productivity history
  - Returns top 3 candidates with composite scores and human-readable reasoning

### Web3 Integration
- 🦊 **MetaMask Wallet Connect** — One-click wallet connection with Sepolia auto-switching
- ⛓️ **On-Chain Task Logging** — Task completion events logged to Ethereum Sepolia testnet
- 🔗 **Etherscan Links** — Transaction hashes displayed on completed tasks with explorer links
- 📝 **Smart Contract** — Solidity contract for permanent task completion records

### UI/UX
- 🌑 **Enterprise Dark Theme** — Clean zinc/slate design with subtle borders and minimal animations
- 🎨 **Custom Design System** — Purpose-built CSS with stat cards, badges, modals, and progress bars
- 📱 **Responsive Layout** — Fixed sidebar navigation with Inter font typography
- 🔔 **Toast Notifications** — Real-time feedback for all user actions

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

### 3. Seed demo data (optional)
```bash
cd server
node seed.js             # Creates 8 employees, 12 tasks (admin@rizetech.com / demo123)
```

### 4. Set up the frontend
```bash
cd client
npm install
npm run dev             # Starts on http://localhost:5173
```

### 5. Open the app
Navigate to `http://localhost:5173`. Login with `admin@rizetech.com` / `demo123` (if seeded) or register a new org.

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
| POST | `/api/employees` | Add employee |
| GET | `/api/employees` | List all employees |
| GET | `/api/employees/:id` | Get single employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Remove employee |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/tasks` | Assign task to employee |
| GET | `/api/tasks` | List tasks (filterable by employee/status) |
| PUT | `/api/tasks/:id/status` | Update task status |
| PUT | `/api/tasks/:id/tx-hash` | Store blockchain tx hash |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Organization-wide statistics |

### AI Intelligence
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/ai/productivity/:employeeId` | Productivity score + trend |
| GET | `/api/ai/skill-gap/:employeeId` | Skill gap analysis + courses |
| GET | `/api/ai/suggest-assignment?skills=X,Y` | Smart task assignment — top 3 candidates |

---

## 🧠 AI Logic Explained

### Productivity Score
```
Base Score = (completed_tasks / total_assigned_tasks) × 100

Deadline Adherence = (on_time_completions / tasks_with_deadlines) × 100

Final Score = (Base Score × 0.7) + (Deadline Adherence × 0.3)
```

- **Excellent** (85–100): Consistently delivers on time
- **High** (70–84): Strong performance with room for improvement
- **Medium** (50–69): Average performance
- **Low** (0–49): Needs attention

Includes **30-day trend analysis** (improving / stable / declining).

### Skill Gap Detection
- Maintains a `role_requirements` table with required skills per role
- Compares employee skills (case-insensitive) against role requirements
- Returns **match percentage**, **missing skills**, and **suggested courses**
- Classifies employee as: Expert / Advanced / Intermediate / Beginner

### Smart Task Assignment
```
For each employee:
  Skill Score     = (matched_skills / required_skills) × 100   [weight: 50%]
  Workload Score  = max(0, 100 - active_tasks × 25)             [weight: 30%]
  Productivity    = (completed_tasks / total_tasks) × 100       [weight: 20%]

Composite = (Skill × 0.5) + (Workload × 0.3) + (Productivity × 0.2)
```

Returns top 3 employees ranked by composite score with human-readable reasoning.

---

## ⛓️ Web3 Integration Explained

### Architecture
1. **MetaMask Connection** — Frontend connects to user's wallet using ethers.js
2. **Sepolia Network** — Auto-switches to Sepolia testnet (chain ID: 11155111)
3. **On-Chain Logging** — When a task is marked "completed", the event is encoded as JSON and sent as transaction data to Sepolia
4. **Tx Hash Storage** — The transaction hash is stored in the database and displayed with an Etherscan link

### Smart Contract (Bonus)
Located at `contracts/TaskLogger.sol`:
- `logTaskCompletion(address employee, uint taskId)` — Emits `TaskCompleted` event
- Prevents duplicate logging
- Deploy via [Remix IDE](https://remix.ethereum.org) to Sepolia

---

## 📁 Project Structure

```
Rise_os/
├── server/                          # Backend API
│   ├── config/db.js                 # SQLite database + schema + seed data
│   ├── middleware/auth.js           # JWT authentication middleware
│   ├── controllers/
│   │   ├── authController.js        # Register + Login
│   │   ├── employeeController.js    # Employee CRUD
│   │   ├── taskController.js        # Task management + Web3 tx storage
│   │   ├── dashboardController.js   # Dashboard statistics
│   │   └── aiController.js          # AI productivity + skill gap
│   ├── routes/                      # Express route files
│   ├── server.js                    # Entry point
│   └── .env.example                 # Environment template
├── client/                          # Frontend SPA
│   ├── src/
│   │   ├── context/AuthContext.jsx   # Authentication state
│   │   ├── services/api.js           # Axios + JWT interceptor
│   │   ├── services/web3.js          # MetaMask + ethers.js integration
│   │   ├── components/Layout.jsx     # Sidebar navigation
│   │   ├── components/WalletConnect.jsx  # MetaMask connect UI
│   │   └── pages/                    # Login, Dashboard, Employees, Tasks
│   ├── index.html                   # SEO-optimized entry
│   └── vite.config.js               # Vite + Tailwind + API proxy
├── contracts/TaskLogger.sol          # Solidity smart contract
├── GTM_STRATEGY.md                   # Go-to-Market plan
└── README.md                         # This file
```

---

## 🛡️ Scalability Thinking

### For 100K Employees / 1M Task Logs:
- **Database**: Migrate to PostgreSQL with connection pooling (pg-pool), add indexes on `employee_id`, `org_id`, `status`
- **Caching**: Redis for dashboard stats and frequently accessed data
- **Pagination**: Server-side pagination for employee/task lists
- **Queue Processing**: Bull/BullMQ for background Web3 transactions and email notifications
- **Search**: Elasticsearch for full-text employee/skill search
- **CDN**: Static asset delivery via CloudFront/Vercel Edge
- **Monitoring**: Prometheus + Grafana for API performance metrics

---

## ❓ FAQ

**Why 70/30 weighting for productivity?**
Completion rate (70%) is the primary signal — it directly measures output. Deadline adherence (30%) rewards punctuality without over-penalizing employees whose deadlines may have been unrealistic.

**What happens when an employee has zero tasks?**
The API returns `score: 0`, `rating: 'No data'`, and a helpful message: *"No tasks assigned yet."* — no misleading score is generated.

**How is "active employee" defined?**
Any employee with `is_active = 1` in the database. Deactivation is a soft-delete that preserves task history.

**What is the JWT expiry?**
24 hours. After expiry, the frontend's Axios interceptor automatically redirects to login with the stored token cleared.

**Is this production-ready?**
For demo/assessment purposes, yes. For production: migrate SQLite → PostgreSQL, add rate limiting, input sanitization middleware, and deploy behind HTTPS.

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

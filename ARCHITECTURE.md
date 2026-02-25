# RizeOS Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│  React SPA (Vite) · CSS Variables Theming · React Router    │
│                                                             │
│   LoginPage  DashboardPage  EmployeesPage  TasksPage  Analytics  │
│       ↓            ↓              ↓           ↓          ↓  │
│              axios API service (JWT interceptor)             │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTPS (JSON)
┌──────────────────────────▼──────────────────────────────────┐
│                         SERVER                              │
│  Express.js · Node.js · Port 5000                           │
│                                                             │
│  Middleware Chain:                                           │
│  helmet → CORS → rate-limit → JSON parser → morgan          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Routes Layer                                        │    │
│  │  /api/auth · /api/employees · /api/tasks             │    │
│  │  /api/dashboard · /api/ai · /api/analytics           │    │
│  │  /api/payroll                                        │    │
│  └──────────────────────┬──────────────────────────────┘    │
│                         ↓                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Controllers (business logic)                        │    │
│  │  authController · employeeController · taskController│    │
│  │  dashboardController · aiController                  │    │
│  │  analyticsController · payrollController             │    │
│  └──────────────────────┬──────────────────────────────┘    │
│                         ↓                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Data Access (better-sqlite3 synchronous)            │    │
│  │  WAL mode · Foreign keys · Parameterized queries     │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  SQLite Database (rizeos.db)                                 │
│  organizations · employees · tasks · payroll_records         │
│  role_requirements                                           │
└─────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  Ethereum (Sepolia Testnet)                                  │
│  Smart Contract: TaskLogger.sol                              │
│  Events: TaskCompleted · PayrollLogged                       │
│  Connection: ethers.js via MetaMask (browser wallet)         │
└─────────────────────────────────────────────────────────────┘
```

## Technology Choices

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | React + Vite | Fast HMR, modern JSX, small bundle size |
| Styling | CSS Custom Properties | Theme switching without class-name swapping, zero runtime overhead |
| Charting | Recharts | React-native SVG charts, faster integration than D3 for standard chart types |
| HTTP Client | Axios | Interceptor support for JWT, automatic JSON parsing |
| Backend | Express.js | Minimal, unopinionated, widely adopted |
| Database | better-sqlite3 | Synchronous API (no callback hell), embedded (no external DB setup), WAL for concurrency |
| Auth | JWT (jsonwebtoken) + bcryptjs | Stateless auth, no session storage needed |
| Validation | express-validator | Declarative validation rules, sanitization built in |
| Security | helmet + rate-limiting | HTTP header hardening, brute-force protection |
| Blockchain | Solidity + ethers.js | Industry-standard smart contract language + lightweight Web3 library |

## Request Flow

```
Browser → Axios interceptor (attaches JWT)
  → Express middleware chain
    → helmet (headers)
    → CORS (origin check)
    → rate-limiter (request throttle)
    → JSON parser (body)
    → morgan (logging)
  → Route handler
    → auth middleware (JWT verify → req.org)
    → validate middleware (express-validator sanitize)
    → Controller (business logic + DB queries)
  → JSON response → Axios → React state → UI render
```

## AI Features Architecture

The AI module (`aiController.js`) implements four scoring engines:

1. **Productivity Score** — Weighted formula: completion rate (40%) + deadline adherence (30%) + activity recency (20%) + volume bonus (10%)
2. **Skill Gap Analysis** — Compares employee skills against `role_requirements` table, suggests courses
3. **Smart Task Assignment** — Ranks all employees: skill match (50%) + workload availability (30%) + productivity history (20%)
4. **Performance Trend** — 4-week rolling window, computes week-over-week delta to classify as improving/stable/declining

## Database Schema

```sql
organizations (id, name, email, password_hash, created_at)
employees     (id, org_id FK, name, email, role, department, skills JSON, wallet_address, is_active, created_at)
tasks         (id, org_id FK, employee_id FK, title, description, status CHECK, deadline, tx_hash, created_at, completed_at)
payroll_records (id, org_id FK, employee_id FK, amount, period, notes, tx_hash, created_at)
role_requirements (id, role UNIQUE, required_skills JSON, suggested_courses JSON)
```

## Scaling Strategy

| Component | Current | Scale Path |
|---|---|---|
| Database | SQLite (single file) | Migrate to PostgreSQL + connection pool |
| Backend | Single Node process | PM2 cluster mode → Kubernetes pods |
| Frontend | Vite dev / static build | Vercel/Netlify CDN edge deploy |
| Auth | JWT (stateless) | Already horizontally scalable |
| Blockchain | Sepolia testnet | Mainnet or L2 (Polygon/Base) |

## Trade-offs

- **SQLite vs PostgreSQL**: SQLite chosen for zero-config demo deployment (Render ephemeral FS), auto-seed on empty DB. Trade-off: no concurrent writes at scale.
- **Burn address for Web3**: Uses Sepolia testnet with optional wallet connection. No real assets at risk during development.
- **Synchronous DB**: `better-sqlite3` is synchronous — simplifies code but blocks the event loop on heavy queries. Acceptable for <100 concurrent users.
- **CSS Variables vs CSS-in-JS**: Zero runtime cost, works with SSR, no library dependency. Trade-off: less type-safe than styled-components.

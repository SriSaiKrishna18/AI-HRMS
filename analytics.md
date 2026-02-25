# Analytics Page — Complete Implementation Plan
**Stack: Recharts (not D3) | New backend endpoints | Real DB data only**

---

## Step 0 — Fix Seed Data First (Do This Before Writing Any Chart Code)

Open `server/seed.js` and verify tasks have spread-out timestamps.
Every task needs a realistic `created_at` and `completed_at` spread across the last 14 days.

**What bad seed data looks like:**
```js
created_at: new Date().toISOString() // all tasks same timestamp = flat line chart
```

**What good seed data looks like:**
```js
// Spread tasks across last 14 days
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

// Tasks with realistic timestamps
{ title: 'Design login UI',       created_at: daysAgo(13), completed_at: daysAgo(11), status: 'completed' },
{ title: 'Build auth API',        created_at: daysAgo(12), completed_at: daysAgo(10), status: 'completed' },
{ title: 'Setup PostgreSQL',      created_at: daysAgo(11), completed_at: daysAgo(9),  status: 'completed' },
{ title: 'Dashboard components',  created_at: daysAgo(9),  completed_at: daysAgo(7),  status: 'completed' },
{ title: 'AI scoring engine',     created_at: daysAgo(8),  completed_at: daysAgo(5),  status: 'completed' },
{ title: 'MetaMask integration',  created_at: daysAgo(6),  completed_at: daysAgo(4),  status: 'completed' },
{ title: 'Smart task assignment', created_at: daysAgo(5),  completed_at: null,         status: 'in_progress' },
{ title: 'Write test suite',      created_at: daysAgo(3),  completed_at: null,         status: 'in_progress' },
{ title: 'Deploy to Vercel',      created_at: daysAgo(2),  completed_at: null,         status: 'assigned' },
{ title: 'Record demo video',     created_at: daysAgo(1),  completed_at: null,         status: 'assigned' },
```

**After fixing seed.js:**
- Delete the SQLite DB file locally: `rm server/data/rizeos.db`
- Restart server: `npm start` (auto-seeds with new data)
- Verify tasks have different dates in DB before writing any chart code

---

## Step 1 — New Backend Endpoint: `/api/analytics`

Create `server/controllers/analyticsController.js`:

### Endpoint: `GET /api/analytics`
Returns all data needed for the analytics page in one call (avoid 5 separate requests).

```js
// analyticsController.js
import { db } from '../config/db.js';

export const getAnalytics = (req, res) => {
  const orgId = req.org.id;

  // Run all queries in parallel using Promise.all
  Promise.all([
    // 1. Task completion trend — last 14 days
    new Promise((resolve, reject) => {
      db.all(`
        SELECT DATE(completed_at) as date, COUNT(*) as count
        FROM tasks
        WHERE org_id = ? AND status = 'completed'
        AND completed_at >= DATE('now', '-14 days')
        GROUP BY DATE(completed_at)
        ORDER BY date ASC
      `, [orgId], (err, rows) => err ? reject(err) : resolve(rows));
    }),

    // 2. Department productivity — avg score per dept
    new Promise((resolve, reject) => {
      db.all(`
        SELECT e.department,
          COUNT(t.id) as total_tasks,
          SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
        FROM employees e
        LEFT JOIN tasks t ON e.id = t.employee_id
        WHERE e.org_id = ? AND e.is_active = 1
        GROUP BY e.department
      `, [orgId], (err, rows) => err ? reject(err) : resolve(rows));
    }),

    // 3. Task status distribution
    new Promise((resolve, reject) => {
      db.all(`
        SELECT status, COUNT(*) as count
        FROM tasks
        WHERE org_id = ?
        GROUP BY status
      `, [orgId], (err, rows) => err ? reject(err) : resolve(rows));
    }),

    // 4. Top skills across all employees
    new Promise((resolve, reject) => {
      db.all(`
        SELECT skills FROM employees WHERE org_id = ? AND is_active = 1
      `, [orgId], (err, rows) => {
        if (err) return reject(err);
        // Count skill frequency
        const skillCount = {};
        rows.forEach(row => {
          const skills = JSON.parse(row.skills || '[]');
          skills.forEach(s => {
            skillCount[s] = (skillCount[s] || 0) + 1;
          });
        });
        const sorted = Object.entries(skillCount)
          .map(([skill, count]) => ({ skill, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8); // top 8 skills
        resolve(sorted);
      });
    }),

    // 5. Employee performance ranking
    new Promise((resolve, reject) => {
      db.all(`
        SELECT e.name, e.role, e.department,
          COUNT(t.id) as total,
          SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed
        FROM employees e
        LEFT JOIN tasks t ON e.id = t.employee_id
        WHERE e.org_id = ? AND e.is_active = 1
        GROUP BY e.id
        ORDER BY completed DESC
      `, [orgId], (err, rows) => err ? reject(err) : resolve(rows));
    }),

  ]).then(([trend, departments, statusDist, skills, performers]) => {
    res.json({ trend, departments, statusDist, skills, performers });
  }).catch(err => {
    res.status(500).json({ error: 'Analytics query failed' });
  });
};
```

Add to `server/routes/analytics.js`:
```js
import express from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { verifyToken } from '../middleware/auth.js';
const router = express.Router();
router.get('/', verifyToken, getAnalytics);
export default router;
```

Register in `server.js`:
```js
import analyticsRoutes from './routes/analytics.js';
app.use('/api/analytics', analyticsRoutes);
```

---

## Step 2 — Install Recharts

```bash
cd client
npm install recharts
```

---

## Step 3 — Build the Analytics Page

Create `client/src/pages/AnalyticsPage.jsx`.

### Chart 1: Task Completion Trend (Line Chart)
**What it shows:** Tasks completed per day over last 14 days
**Why it matters:** Shows team velocity over time — real business metric
**Data:** `trend` array from `/api/analytics`

```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Fill missing days with 0 (important — gaps look broken)
const fillMissingDays = (data) => {
  const result = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const found = data.find(r => r.date === dateStr);
    result.push({ date: dateStr.slice(5), count: found ? found.count : 0 });
  }
  return result;
};

<ResponsiveContainer width="100%" height={250}>
  <LineChart data={fillMissingDays(trend)}>
    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
    <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 12 }} />
    <YAxis stroke="#71717a" tick={{ fontSize: 12 }} allowDecimals={false} />
    <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a' }} />
    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
  </LineChart>
</ResponsiveContainer>
```

**Critical:** The `fillMissingDays` function is not optional. Without it, days with 0 completions are skipped and the chart has gaps. That looks broken.

---

### Chart 2: Department Productivity (Bar Chart)
**What it shows:** Completion rate % per department
**Why it matters:** Manager-level insight — which team is underperforming?
**Data:** `departments` array — calculate `(completed/total)*100` per dept

```jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const deptData = departments.map(d => ({
  department: d.department.replace(' ', '\n'), // wrap long names
  score: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0
}));

<ResponsiveContainer width="100%" height={250}>
  <BarChart data={deptData}>
    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
    <XAxis dataKey="department" stroke="#71717a" tick={{ fontSize: 11 }} />
    <YAxis stroke="#71717a" domain={[0, 100]} tickFormatter={v => `${v}%`} />
    <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']}
      contentStyle={{ background: '#18181b', border: '1px solid #27272a' }} />
    <Bar dataKey="score" fill="#22c55e" radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

---

### Chart 3: Task Status Distribution (Pie/Donut Chart)
**What it shows:** % of tasks in each status right now
**Why it matters:** Operational health at a glance
**Data:** `statusDist` array

```jsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  assigned: '#f59e0b',
  in_progress: '#3b82f6',
  completed: '#22c55e'
};

const pieData = statusDist.map(s => ({
  name: s.status.replace('_', ' '),
  value: s.count,
  color: COLORS[s.status] || '#6366f1'
}));

<ResponsiveContainer width="100%" height={250}>
  <PieChart>
    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
      dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
    </Pie>
    <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a' }} />
  </PieChart>
</ResponsiveContainer>
```

---

### Chart 4: Top Skills Heatmap (Horizontal Bar)
**What it shows:** Which skills are most common across the workforce
**Why it matters:** Strategic workforce planning — do you have enough React devs?
**Data:** `skills` array — top 8 skills by frequency

```jsx
<ResponsiveContainer width="100%" height={250}>
  <BarChart data={skills} layout="vertical">
    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
    <XAxis type="number" stroke="#71717a" allowDecimals={false} />
    <YAxis type="category" dataKey="skill" stroke="#71717a" width={100} tick={{ fontSize: 12 }} />
    <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a' }} />
    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
  </BarChart>
</ResponsiveContainer>
```

---

### Chart 5: Employee Performance Leaderboard (NOT a chart — a ranked table)
**What it shows:** Employees ranked by completion rate with visual score bars
**Why it matters:** Managers need to know who their top/bottom performers are

This is NOT a recharts chart — it's a styled table with inline progress bars.
A ranked leaderboard with color-coded scores is more readable than a chart here.

```jsx
{performers.map((emp, i) => {
  const score = emp.total > 0 ? Math.round((emp.completed / emp.total) * 100) : 0;
  return (
    <div key={i} className="flex items-center gap-4 p-3 border-b border-zinc-800">
      <span className="text-zinc-500 w-6">#{i + 1}</span>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="font-medium">{emp.name}</span>
          <span className="text-sm text-zinc-400">{score}%</span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full">
          <div className="h-1.5 rounded-full" 
            style={{ width: `${score}%`, background: score > 70 ? '#22c55e' : score > 40 ? '#f59e0b' : '#ef4444' }} />
        </div>
        <span className="text-xs text-zinc-500">{emp.role} · {emp.department}</span>
      </div>
    </div>
  );
})}
```

---

## Step 4 — Add to Sidebar Navigation

In `Layout.jsx`, add Analytics to nav links:
```jsx
{ path: '/analytics', label: 'Analytics', icon: BarChart2Icon }
```

In your router (App.jsx or wherever routes are defined):
```jsx
<Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
```

---

## Step 5 — Page Layout

```
┌─────────────────────────────────────────────────────┐
│  Analytics                          Last 14 days ▾  │
├──────────────────┬──────────────────────────────────┤
│                  │                                  │
│  Task Completion │    Department Productivity       │
│  Trend (line)    │    (bar chart)                   │
│                  │                                  │
├──────────┬───────┴──────────┬────────────────────── │
│          │                  │                       │
│  Status  │   Top Skills     │  Employee             │
│  Donut   │   (horiz bar)    │  Leaderboard          │
│          │                  │                       │
└──────────┴──────────────────┴───────────────────────┘
```

5 visualizations, 2-row grid layout, all real data from DB.

---

## What NOT to Do

- ❌ Don't use D3 — it'll take 3x longer for identical visual output
- ❌ Don't hardcode any chart data — evaluators will notice numbers never change
- ❌ Don't add animations that delay data rendering — looks flashy but feels slow
- ❌ Don't skip the `fillMissingDays` function — gaps in line chart look broken
- ❌ Don't add more than 5 charts — cluttered analytics pages look unfinished
- ❌ Don't make charts that duplicate dashboard stat card numbers — redundant = lazy

---

## Time Estimate

| Task | Time |
|---|---|
| Fix seed data timestamps | 20 min |
| Backend analytics endpoint | 45 min |
| Install recharts + page scaffold | 15 min |
| Line chart (trend) | 20 min |
| Bar chart (departments) | 15 min |
| Donut chart (status) | 15 min |
| Horizontal bar (skills) | 15 min |
| Leaderboard table | 20 min |
| Add to sidebar + routing | 10 min |
| **Total** | **~2.5 hours** |

---

## Why This Will Impress

1. **Real data** — every chart pulls from live DB queries, numbers change as tasks are completed
2. **Business relevance** — each chart answers a question a real HR manager would ask
3. **Architecture** — single `/api/analytics` endpoint with parallel queries shows backend thinking
4. **`fillMissingDays`** — that one function shows you understand time-series data, not just charting
5. **Leaderboard** — choosing a table over a chart where a table is more appropriate shows product judgment
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { AnimatedCounter } from "../ui/animated-counter";

const stats = [
  {
    title: "Total Employees",
    value: 2543,
    change: "+12.5%",
    icon: Users,
    color: "from-blue-500 to-blue-600",
    shadowColor: "shadow-blue-500/50",
  },
  {
    title: "Present Today",
    value: 2234,
    change: "87.8%",
    icon: UserCheck,
    color: "from-green-500 to-green-600",
    shadowColor: "shadow-green-500/50",
  },
  {
    title: "On Leave",
    value: 156,
    change: "+2.3%",
    icon: UserX,
    color: "from-orange-500 to-orange-600",
    shadowColor: "shadow-orange-500/50",
  },
  {
    title: "New Hires (MTD)",
    value: 48,
    change: "+18.2%",
    icon: TrendingUp,
    color: "from-purple-500 to-purple-600",
    shadowColor: "shadow-purple-500/50",
  },
];

const attendanceData = [
  { month: "Jan", present: 2100, absent: 150, leave: 100 },
  { month: "Feb", present: 2200, absent: 120, leave: 130 },
  { month: "Mar", present: 2300, absent: 100, leave: 150 },
  { month: "Apr", present: 2250, absent: 140, leave: 160 },
  { month: "May", present: 2400, absent: 90, leave: 140 },
  { month: "Jun", present: 2350, absent: 110, leave: 170 },
];

const departmentData = [
  { name: "Engineering", value: 680, color: "#3b82f6" },
  { name: "Sales", value: 520, color: "#10b981" },
  { name: "Marketing", value: 340, color: "#f59e0b" },
  { name: "HR", value: 180, color: "#8b5cf6" },
  { name: "Finance", value: 220, color: "#ec4899" },
  { name: "Operations", value: 603, color: "#6366f1" },
];

const recentActivities = [
  {
    name: "Sarah Johnson",
    action: "submitted leave request",
    time: "5 min ago",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    name: "Michael Chen",
    action: "completed onboarding",
    time: "1 hour ago",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    name: "Emily Davis",
    action: "updated performance review",
    time: "2 hours ago",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
  {
    name: "James Wilson",
    action: "marked attendance",
    time: "3 hours ago",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  },
];

const upcomingLeaves = [
  { name: "Alex Martinez", department: "Engineering", date: "Feb 26 - Feb 28", days: 3 },
  { name: "Lisa Anderson", department: "Sales", date: "Mar 01 - Mar 05", days: 5 },
  { name: "David Kim", department: "Marketing", date: "Mar 03 - Mar 04", days: 2 },
  { name: "Rachel Brown", department: "Finance", date: "Mar 10 - Mar 15", days: 6 },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function Dashboard() {
  return (
    <motion.div 
      className="space-y-8"
      initial="hidden"
      animate="show"
      variants={container}
    >
      <motion.div variants={item}>
        <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={container}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={item}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">
                      <AnimatedCounter value={stat.value} suffix={stat.title === "Present Today" ? "" : ""} />
                    </p>
                    <motion.p 
                      className="text-sm text-green-600 mt-2 font-medium"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      {stat.change}
                    </motion.p>
                  </div>
                  <motion.div 
                    className={`bg-gradient-to-br ${stat.color} p-4 rounded-xl shadow-lg ${stat.shadowColor}`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <stat.icon className="w-7 h-7 text-white" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={container}
      >
        {/* Attendance Trend */}
        <motion.div variants={item}>
          <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <motion.div 
                  className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"
                  animate={{ height: [24, 32, 24] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                Attendance Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }} 
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="present"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Present"
                    dot={{ fill: '#10b981', r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="leave"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    name="On Leave"
                    dot={{ fill: '#f59e0b', r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="absent"
                    stroke="#ef4444"
                    strokeWidth={3}
                    name="Absent"
                    dot={{ fill: '#ef4444', r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Department Distribution */}
        <motion.div variants={item}>
          <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <motion.div 
                  className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"
                  animate={{ height: [24, 32, 24] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                Department Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Bottom Section */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={container}
      >
        {/* Recent Activities */}
        <motion.div variants={item}>
          <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <motion.div 
                  className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"
                  animate={{ height: [24, 32, 24] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50/80 transition-colors duration-200 cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <Avatar className="ring-2 ring-blue-100">
                      <AvatarImage src={activity.avatar} />
                      <AvatarFallback>{activity.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">{activity.name}</span>{" "}
                        <span className="text-gray-600">{activity.action}</span>
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Leaves */}
        <motion.div variants={item}>
          <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <motion.div 
                  className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"
                  animate={{ height: [24, 32, 24] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                />
                Upcoming Leaves
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingLeaves.map((leave, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50/80 transition-colors duration-200"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ x: -5 }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{leave.name}</p>
                      <p className="text-xs text-gray-500">{leave.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 mb-1">{leave.date}</p>
                      <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-none">
                        {leave.days} {leave.days === 1 ? "day" : "days"}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

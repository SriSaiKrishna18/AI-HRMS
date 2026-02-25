import { DollarSign, TrendingUp, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const monthlyData = [
  { month: "Jan", total: 2850000, bonuses: 180000, deductions: 120000 },
  { month: "Feb", total: 2920000, bonuses: 200000, deductions: 115000 },
  { month: "Mar", total: 2980000, bonuses: 220000, deductions: 125000 },
  { month: "Apr", total: 2900000, bonuses: 190000, deductions: 118000 },
  { month: "May", total: 3100000, bonuses: 250000, deductions: 130000 },
  { month: "Jun", total: 3050000, bonuses: 230000, deductions: 122000 },
];

const recentPayrolls = [
  {
    name: "Sarah Johnson",
    month: "February 2026",
    gross: "$8,500",
    deductions: "$1,200",
    net: "$7,300",
    status: "Paid",
    date: "Feb 28, 2026",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    name: "Michael Chen",
    month: "February 2026",
    gross: "$9,200",
    deductions: "$1,350",
    net: "$7,850",
    status: "Paid",
    date: "Feb 28, 2026",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    name: "Emily Davis",
    month: "February 2026",
    gross: "$6,800",
    deductions: "$950",
    net: "$5,850",
    status: "Paid",
    date: "Feb 28, 2026",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
  {
    name: "James Wilson",
    month: "February 2026",
    gross: "$7,500",
    deductions: "$1,100",
    net: "$6,400",
    status: "Processing",
    date: "Pending",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  },
  {
    name: "Lisa Anderson",
    month: "February 2026",
    gross: "$7,200",
    deductions: "$1,050",
    net: "$6,150",
    status: "Paid",
    date: "Feb 28, 2026",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
  },
];

const stats = [
  {
    label: "Total Payroll (MTD)",
    value: "$2.98M",
    change: "+5.2%",
    icon: DollarSign,
    color: "bg-green-500",
  },
  {
    label: "Average Salary",
    value: "$7,456",
    change: "+2.1%",
    icon: TrendingUp,
    color: "bg-blue-500",
  },
  {
    label: "Employees Paid",
    value: "2,543",
    change: "100%",
    icon: Users,
    color: "bg-purple-500",
  },
  {
    label: "Next Payroll",
    value: "Mar 31",
    change: "6 days",
    icon: Calendar,
    color: "bg-orange-500",
  },
];

export function Payroll() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Payroll</h1>
          <p className="text-gray-500 mt-1">Manage employee salaries and compensation</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">Process Payroll</Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payroll Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Trend (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => `$${Number(value).toLocaleString()}`}
              />
              <Legend />
              <Bar dataKey="total" fill="#3b82f6" name="Total Payroll" />
              <Bar dataKey="bonuses" fill="#10b981" name="Bonuses" />
              <Bar dataKey="deductions" fill="#ef4444" name="Deductions" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Payroll Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payroll Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPayrolls.map((payroll, index) => (
              <div
                key={index}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={payroll.avatar} />
                    <AvatarFallback>
                      {payroll.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{payroll.name}</p>
                    <p className="text-sm text-gray-500">{payroll.month}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Gross Salary</p>
                    <p className="font-medium text-gray-900">{payroll.gross}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Deductions</p>
                    <p className="font-medium text-gray-900">{payroll.deductions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Net Salary</p>
                    <p className="font-medium text-green-600">{payroll.net}</p>
                  </div>
                  <div className="flex flex-col items-start sm:items-end">
                    <Badge
                      className={
                        payroll.status === "Paid"
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                      }
                    >
                      {payroll.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{payroll.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

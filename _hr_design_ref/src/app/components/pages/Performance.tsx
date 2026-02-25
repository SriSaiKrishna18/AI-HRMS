import { TrendingUp, Star, Target, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

const performanceData = [
  { metric: "Communication", value: 85 },
  { metric: "Teamwork", value: 92 },
  { metric: "Technical Skills", value: 88 },
  { metric: "Problem Solving", value: 90 },
  { metric: "Leadership", value: 78 },
  { metric: "Time Management", value: 85 },
];

const employeePerformance = [
  {
    name: "Sarah Johnson",
    department: "Engineering",
    rating: 4.8,
    goals: { completed: 8, total: 10 },
    lastReview: "Jan 15, 2026",
    status: "Outstanding",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    name: "Michael Chen",
    department: "Sales",
    rating: 4.5,
    goals: { completed: 12, total: 15 },
    lastReview: "Jan 20, 2026",
    status: "Exceeds Expectations",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    name: "Emily Davis",
    department: "Marketing",
    rating: 4.2,
    goals: { completed: 6, total: 8 },
    lastReview: "Feb 01, 2026",
    status: "Meets Expectations",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
  {
    name: "James Wilson",
    department: "Engineering",
    rating: 4.7,
    goals: { completed: 9, total: 10 },
    lastReview: "Jan 28, 2026",
    status: "Outstanding",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  },
  {
    name: "Lisa Anderson",
    department: "Finance",
    rating: 4.3,
    goals: { completed: 7, total: 9 },
    lastReview: "Feb 05, 2026",
    status: "Exceeds Expectations",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
  },
];

const stats = [
  {
    label: "Avg. Performance Rating",
    value: "4.5",
    subtext: "Out of 5.0",
    icon: Star,
    color: "bg-yellow-500",
  },
  {
    label: "Reviews Completed",
    value: "1,845",
    subtext: "This year",
    icon: TrendingUp,
    color: "bg-green-500",
  },
  {
    label: "Goals Achieved",
    value: "78%",
    subtext: "Overall completion",
    icon: Target,
    color: "bg-blue-500",
  },
  {
    label: "Top Performers",
    value: "234",
    subtext: "Outstanding rating",
    icon: Award,
    color: "bg-purple-500",
  },
];

export function Performance() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Outstanding":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "Exceeds Expectations":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "Meets Expectations":
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Performance</h1>
          <p className="text-gray-500 mt-1">Track and manage employee performance reviews</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">Schedule Review</Button>
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
                  <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Metrics Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Average Team Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={performanceData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Performance"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Employee Performance List */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employeePerformance.map((employee, index) => (
              <div
                key={index}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={employee.avatar} />
                    <AvatarFallback>
                      {employee.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{employee.name}</p>
                    <p className="text-sm text-gray-500">{employee.department}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium text-gray-900">{employee.rating}</span>
                    <span className="text-sm text-gray-500">/ 5.0</span>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Goals Progress</span>
                      <span className="text-sm font-medium text-gray-900">
                        {employee.goals.completed}/{employee.goals.total}
                      </span>
                    </div>
                    <Progress
                      value={(employee.goals.completed / employee.goals.total) * 100}
                      className="h-2"
                    />
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    <Badge className={getStatusColor(employee.status)}>
                      {employee.status}
                    </Badge>
                    <p className="text-xs text-gray-500">Last: {employee.lastReview}</p>
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

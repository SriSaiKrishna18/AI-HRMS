import { useState } from "react";
import { Plus, Filter, Calendar, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const leaveRequests = [
  {
    id: "LR001",
    name: "Sarah Johnson",
    type: "Vacation",
    startDate: "Mar 15, 2026",
    endDate: "Mar 20, 2026",
    days: 6,
    status: "Pending",
    reason: "Family vacation to Hawaii",
    appliedOn: "Feb 20, 2026",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    id: "LR002",
    name: "Michael Chen",
    type: "Sick Leave",
    startDate: "Feb 26, 2026",
    endDate: "Feb 27, 2026",
    days: 2,
    status: "Approved",
    reason: "Medical appointment",
    appliedOn: "Feb 24, 2026",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    id: "LR003",
    name: "Emily Davis",
    type: "Personal",
    startDate: "Mar 01, 2026",
    endDate: "Mar 01, 2026",
    days: 1,
    status: "Pending",
    reason: "Personal matters",
    appliedOn: "Feb 23, 2026",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
  {
    id: "LR004",
    name: "James Wilson",
    type: "Vacation",
    startDate: "Apr 10, 2026",
    endDate: "Apr 17, 2026",
    days: 8,
    status: "Approved",
    reason: "Trip to Europe",
    appliedOn: "Feb 18, 2026",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  },
  {
    id: "LR005",
    name: "David Kim",
    type: "Sick Leave",
    startDate: "Feb 25, 2026",
    endDate: "Feb 25, 2026",
    days: 1,
    status: "Rejected",
    reason: "Not feeling well",
    appliedOn: "Feb 25, 2026",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
  },
];

const stats = [
  { label: "Pending Requests", value: "24", color: "bg-yellow-500" },
  { label: "Approved This Month", value: "142", color: "bg-green-500" },
  { label: "On Leave Today", value: "156", color: "bg-blue-500" },
  { label: "Avg. Leave Days/Employee", value: "12.5", color: "bg-purple-500" },
];

export function Leave() {
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredRequests = leaveRequests.filter((request) => {
    if (statusFilter === "all") return true;
    return request.status.toLowerCase() === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
      case "Rejected":
        return "bg-red-100 text-red-700 hover:bg-red-100";
      default:
        return "";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Vacation":
        return "bg-blue-100 text-blue-700";
      case "Sick Leave":
        return "bg-purple-100 text-purple-700";
      case "Personal":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Leave Management</h1>
          <p className="text-gray-500 mt-1">Manage employee leave requests and approvals</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Leave Request
        </Button>
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
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-lg`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leave Requests */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Leave Requests</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1">
                  <Avatar>
                    <AvatarImage src={request.avatar} />
                    <AvatarFallback>
                      {request.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium text-gray-900">{request.name}</p>
                      <Badge variant="outline" className={getTypeColor(request.type)}>
                        {request.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{request.reason}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {request.startDate} - {request.endDate}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {request.days} {request.days === 1 ? "day" : "days"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                  {request.status === "Pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Approve
                      </Button>
                      <Button size="sm" variant="outline">
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

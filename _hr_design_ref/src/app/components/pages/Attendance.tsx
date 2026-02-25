import { useState } from "react";
import { Calendar as CalendarIcon, Download, Clock } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";

const todayAttendance = [
  {
    name: "Sarah Johnson",
    checkIn: "08:45 AM",
    checkOut: "05:30 PM",
    status: "Present",
    hours: "8h 45m",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    name: "Michael Chen",
    checkIn: "09:00 AM",
    checkOut: "06:00 PM",
    status: "Present",
    hours: "9h 00m",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    name: "Emily Davis",
    checkIn: "08:30 AM",
    checkOut: "05:15 PM",
    status: "Present",
    hours: "8h 45m",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
  {
    name: "James Wilson",
    checkIn: "09:15 AM",
    checkOut: "06:30 PM",
    status: "Present",
    hours: "9h 15m",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  },
  {
    name: "Lisa Anderson",
    checkIn: "-",
    checkOut: "-",
    status: "On Leave",
    hours: "-",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
  },
  {
    name: "David Kim",
    checkIn: "08:50 AM",
    checkOut: "In Progress",
    status: "Present",
    hours: "In Progress",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
  },
  {
    name: "Rachel Brown",
    checkIn: "-",
    checkOut: "-",
    status: "Absent",
    hours: "-",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
  },
  {
    name: "Alex Martinez",
    checkIn: "08:55 AM",
    checkOut: "05:45 PM",
    status: "Present",
    hours: "8h 50m",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop",
  },
];

const stats = [
  { label: "Present", value: 2234, percentage: "87.8%", color: "from-green-500 to-emerald-600" },
  { label: "Absent", value: 153, percentage: "6.0%", color: "from-red-500 to-rose-600" },
  { label: "On Leave", value: 156, percentage: "6.2%", color: "from-orange-500 to-amber-600" },
  { label: "Late Arrivals", value: 42, percentage: "1.7%", color: "from-yellow-500 to-yellow-600" },
];

export function Attendance() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Attendance</h1>
          <p className="text-gray-500 mt-1">Track employee attendance and working hours</p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="border-gray-200 hover:border-blue-500 transition-all duration-300">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
          <Button variant="outline" className="border-gray-200 hover:border-blue-500 transition-all duration-300">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.percentage}</p>
                  </div>
                  <div className={`bg-gradient-to-br ${stat.color} w-14 h-14 rounded-xl shadow-lg`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Today's Attendance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <motion.div 
                className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"
                animate={{ height: [24, 32, 24] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              Today's Attendance - {format(new Date(), "MMMM dd, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayAttendance.map((record, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  whileHover={{ x: 5, backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-200/50 rounded-xl transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="ring-2 ring-blue-100">
                      <AvatarImage src={record.avatar} />
                      <AvatarFallback>
                        {record.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{record.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={
                            record.status === "Present"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : record.status === "On Leave"
                              ? "bg-orange-50 text-orange-700 border-orange-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }
                        >
                          {record.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Check In</p>
                      <p className="font-medium text-gray-900 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {record.checkIn}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Check Out</p>
                      <p className="font-medium text-gray-900 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {record.checkOut}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Total Hours</p>
                      <p className="font-medium text-gray-900">{record.hours}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

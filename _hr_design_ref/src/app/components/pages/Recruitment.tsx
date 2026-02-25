import { Plus, Users, Briefcase, UserCheck, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

const jobOpenings = [
  {
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "New York, NY",
    type: "Full-time",
    posted: "5 days ago",
    applicants: 48,
    interviews: 12,
    offers: 2,
    status: "Active",
  },
  {
    title: "Product Manager",
    department: "Product",
    location: "San Francisco, CA",
    type: "Full-time",
    posted: "2 weeks ago",
    applicants: 67,
    interviews: 18,
    offers: 3,
    status: "Active",
  },
  {
    title: "UX Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    posted: "1 week ago",
    applicants: 92,
    interviews: 25,
    offers: 1,
    status: "Active",
  },
  {
    title: "Data Analyst",
    department: "Analytics",
    location: "Austin, TX",
    type: "Contract",
    posted: "3 days ago",
    applicants: 34,
    interviews: 8,
    offers: 0,
    status: "Active",
  },
];

const recentCandidates = [
  {
    name: "Alex Thompson",
    position: "Senior Software Engineer",
    stage: "Final Interview",
    score: 92,
    appliedDate: "Feb 20, 2026",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop",
  },
  {
    name: "Jessica Lee",
    position: "Product Manager",
    stage: "Technical Round",
    score: 88,
    appliedDate: "Feb 18, 2026",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
  },
  {
    name: "Marcus Johnson",
    position: "UX Designer",
    stage: "Portfolio Review",
    score: 85,
    appliedDate: "Feb 22, 2026",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
  },
  {
    name: "Sophia Chen",
    position: "Data Analyst",
    stage: "Phone Screening",
    score: 78,
    appliedDate: "Feb 24, 2026",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
  },
  {
    name: "Robert Williams",
    position: "Senior Software Engineer",
    stage: "Offer Extended",
    score: 95,
    appliedDate: "Feb 15, 2026",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  },
];

const stats = [
  {
    label: "Open Positions",
    value: "24",
    subtext: "Across departments",
    icon: Briefcase,
    color: "bg-blue-500",
  },
  {
    label: "Total Applicants",
    value: "642",
    subtext: "This month",
    icon: Users,
    color: "bg-purple-500",
  },
  {
    label: "Interviews Scheduled",
    value: "89",
    subtext: "Upcoming",
    icon: Clock,
    color: "bg-orange-500",
  },
  {
    label: "Offers Extended",
    value: "18",
    subtext: "Pending acceptance",
    icon: UserCheck,
    color: "bg-green-500",
  },
];

export function Recruitment() {
  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Phone Screening":
        return "bg-blue-100 text-blue-700";
      case "Technical Round":
        return "bg-purple-100 text-purple-700";
      case "Portfolio Review":
        return "bg-yellow-100 text-yellow-700";
      case "Final Interview":
        return "bg-orange-100 text-orange-700";
      case "Offer Extended":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Recruitment</h1>
          <p className="text-gray-500 mt-1">Manage job openings and candidate pipeline</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Post New Job
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

      {/* Job Openings */}
      <Card>
        <CardHeader>
          <CardTitle>Active Job Openings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobOpenings.map((job, index) => (
              <div
                key={index}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-sm text-gray-600">{job.department}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{job.location}</span>
                        <Badge variant="outline">{job.type}</Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Posted {job.posted}</p>
                </div>

                <div className="grid grid-cols-3 gap-6 lg:gap-8">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Applicants</p>
                    <p className="text-lg font-semibold text-gray-900">{job.applicants}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Interviews</p>
                    <p className="text-lg font-semibold text-gray-900">{job.interviews}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Offers</p>
                    <p className="text-lg font-semibold text-green-600">{job.offers}</p>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="lg:ml-4">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Candidates */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCandidates.map((candidate, index) => (
              <div
                key={index}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={candidate.avatar} />
                    <AvatarFallback>
                      {candidate.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{candidate.name}</p>
                    <p className="text-sm text-gray-500">{candidate.position}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                  <Badge variant="outline" className={getStageColor(candidate.stage)}>
                    {candidate.stage}
                  </Badge>

                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Match Score</span>
                      <span className="text-sm font-medium text-gray-900">
                        {candidate.score}%
                      </span>
                    </div>
                    <Progress value={candidate.score} className="h-2" />
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500">Applied {candidate.appliedDate}</p>
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

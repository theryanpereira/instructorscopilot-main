import { BookOpen, Users, FileText, TrendingUp, Sparkles, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentCourses } from "@/components/dashboard/RecentCourses";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-hero rounded-xl p-8 text-white shadow-glow">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-2">Welcome back to Masterplan!</h1>
          <p className="text-white/90 mb-6">
            Your AI-powered copilot for creating engaging educational content. 
            Let's build something amazing together.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white/80">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm">AI-Enhanced</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Clock className="h-4 w-4" />
              <span className="text-sm">50% Time Saved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Courses"
          value={12}
          description="3 published, 2 in draft"
          icon={<BookOpen className="h-6 w-6" />}
          trend={{ value: 25, label: "vs last month", positive: true }}
        />
        <StatCard
          title="Active Students"
          value={142}
          description="Across all courses"
          icon={<Users className="h-6 w-6" />}
          trend={{ value: 12, label: "new this week", positive: true }}
        />
        <StatCard
          title="Content Generated"
          value="2.4k"
          description="Lessons, quizzes, slides"
          icon={<FileText className="h-6 w-6" />}
          trend={{ value: 35, label: "vs last month", positive: true }}
        />
        <StatCard
          title="Time Saved"
          value="127h"
          description="Through AI assistance"
          icon={<TrendingUp className="h-6 w-6" />}
          trend={{ value: 8, label: "this month", positive: true }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>

        {/* Recent Courses */}
        <div className="lg:col-span-2">
          <RecentCourses />
        </div>
      </div>
    </div>
  );
}
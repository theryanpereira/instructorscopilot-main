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

      {/* Quick Actions Full Width */}
      <QuickActions />
    </div>
  );
}
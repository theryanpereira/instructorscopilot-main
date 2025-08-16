import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  X, 
  Home, 
  Sparkles, 
  BookOpen, 
  Users, 
  Settings,
  ArrowRight,
  Play
} from "lucide-react";

export function UserGuide() {
  const [isOpen, setIsOpen] = useState(false);

  const navigationSteps = [
    {
      icon: Home,
      title: "Dashboard",
      description: "Overview of your courses, stats, and quick actions",
      path: "/",
      color: "text-blue-500"
    },
    {
      icon: Sparkles,
      title: "Course Creator",
      description: "AI-powered content generation with your teaching style",
      path: "/create",
      color: "text-purple-500"
    },
    {
      icon: BookOpen,
      title: "My Courses",
      description: "Manage and view all your course content",
      path: "/courses",
      color: "text-green-500"
    },
    {
      icon: Users,
      title: "Students",
      description: "Track student progress and create intake forms",
      path: "/students",
      color: "text-orange-500"
    },
    {
      icon: Settings,
      title: "Settings",
      description: "Configure your profile, teaching style, and integrations",
      path: "/settings",
      color: "text-gray-500"
    }
  ];

  const workflow = [
    "Upload tone sample in Settings",
    "Create course in Course Creator",
    "Generate AI content with prompts",
    "Review and edit content",
    "Export to Google Docs/Drive"
  ];

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-50"
        onClick={() => setIsOpen(true)}
      >
        <HelpCircle className="h-5 w-5 text-foreground" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-foreground" />
              Navigation Guide
            </CardTitle>
            <CardDescription>
              Learn how to navigate and use Masterplan effectively
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4 text-foreground" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Navigation Overview */}
          <div>
            <h3 className="font-semibold mb-3">Main Navigation</h3>
            <div className="space-y-3">
              {navigationSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  <step.icon className="h-5 w-5 mt-0.5 text-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">{step.title}</div>
                    <div className="text-sm text-muted-foreground">{step.description}</div>
                    <Badge variant="outline" className="mt-1 text-xs">{step.path}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Workflow */}
          <div>
            <h3 className="font-semibold mb-3">Recommended Workflow</h3>
            <div className="space-y-2">
              {workflow.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm">{step}</span>
                  {index < workflow.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-foreground ml-auto" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div>
            <h3 className="font-semibold mb-3">Quick Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Use the home button (🏠) in the top-left to return to dashboard</li>
              <li>• Access settings via the profile dropdown in the top-right</li>
              <li>• Quick actions on dashboard provide shortcuts to common tasks</li>
              <li>• Sidebar navigation works on all pages for easy access</li>
              <li>• Connect to Supabase for full backend functionality</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={() => setIsOpen(false)} className="flex-1">
              Got it!
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
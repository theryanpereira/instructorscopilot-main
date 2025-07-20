import { Sparkles, Mic, Users, FileText, Download, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

const actions = [
  {
    title: "Generate Course",
    shortTitle: "🧠 Generate",
    description: "Create courses and lessons with AI",
    icon: Sparkles,
    variant: "ai" as const,
    action: "create-course",
  },
  {
    title: "Upload Tone Sample",
    shortTitle: "🎤 Upload Tone",
    description: "Train AI with your teaching style",
    icon: Mic,
    variant: "outline" as const,
    action: "upload-tone",
  },
  {
    title: "Student Intake",
    shortTitle: "🧑‍🎓 Students",
    description: "Create personalized learning forms",
    icon: Users,
    variant: "secondary" as const,
    action: "student-intake",
  },
  {
    title: "Content Library",
    shortTitle: "📚 Library",
    description: "Browse your existing materials",
    icon: FileText,
    variant: "outline" as const,
    action: "library",
  },
  {
    title: "Export to Google",
    shortTitle: "📤 Export",
    description: "Send content to Google Docs",
    icon: Download,
    variant: "outline" as const,
    action: "export-google",
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    switch (action) {
      case "create-course":
      case "quick-generate":
        navigate("/create");
        break;
      case "upload-tone":
        navigate("/settings");
        break;
      case "student-intake":
        navigate("/students");
        break;
      case "library":
        navigate("/courses");
        break;
      case "export-google":
        navigate("/settings");
        break;
      default:
        console.log("Action not implemented:", action);
    }
  };

  return (
    <Card className="bg-gradient-card shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Jump-start your course creation with these common tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
            {actions.map((action) => (
              <Tooltip key={action.action}>
                <TooltipTrigger asChild>
                  <Button
                    variant={action.variant}
                    className="h-auto flex-col gap-2 p-4 text-left min-h-[80px] justify-start transition-smooth hover:scale-[1.02]"
                    onClick={() => handleAction(action.action)}
                  >
                    <div className="flex w-full items-center justify-center gap-2 flex-col">
                      <action.icon className="h-5 w-5 flex-shrink-0" />
                      <div className="font-medium text-xs leading-tight text-center truncate w-full">
                        {action.shortTitle}
                      </div>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{action.title}</p>
                  <p className="text-sm opacity-80">{action.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
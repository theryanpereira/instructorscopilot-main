import { Sparkles, Mic, Users, FileText, Download, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

const actions = [
  {
    title: "Generate Course",
    shortTitle: "Generate",
    description: "Create courses and lessons with AI",
    icon: Sparkles,
    variant: "default" as const,
    action: "create-course",
  },
  {
    title: "Upload Tone Sample",
    shortTitle: "Upload Tone",
    description: "Train AI with your teaching style",
    icon: Mic,
    variant: "default" as const,
    action: "upload-tone",
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
          <Zap className="h-5 w-5 text-foreground" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Jump-start your course creation with these common tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div
            className="flex gap-2 justify-center sm:justify-start overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:gap-3 sm:overflow-visible"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {actions.map((action) => (
              <div key={action.action} className="flex-shrink-0 w-24 sm:w-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={action.variant}
                      className="flex flex-col items-center justify-center gap-1 px-2 py-4 w-full h-auto min-h-[72px] sm:min-h-[80px] text-xs font-medium"
                      onClick={() => handleAction(action.action)}
                    >
                      <action.icon className="h-6 w-6 mb-1 text-foreground" />
                      <span className="truncate text-center w-full">{action.shortTitle}</span>
                    </Button>
                  </TooltipTrigger>
                  {/* Show tooltip only on desktop */}
                  <TooltipContent className="hidden sm:block">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm opacity-80">{action.description}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
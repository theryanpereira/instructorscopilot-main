import { Calendar, Users, FileText, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Course {
  id: string;
  title: string;
  description: string;
  status: "draft" | "published" | "archived";
  students: number;
  modules: number;
  lastModified: string;
  progress: number;
}

const sampleCourses: Course[] = [
  {
    id: "1",
    title: "Introduction to React Development",
    description: "Learn the fundamentals of React including components, hooks, and state management",
    status: "published",
    students: 24,
    modules: 8,
    lastModified: "2 days ago",
    progress: 100,
  },
  {
    id: "2",
    title: "Advanced JavaScript Concepts",
    description: "Deep dive into closures, async/await, and advanced patterns",
    status: "draft",
    students: 0,
    modules: 5,
    lastModified: "1 week ago",
    progress: 65,
  },
  {
    id: "3",
    title: "UI/UX Design Principles",
    description: "Master the principles of user interface and experience design",
    status: "published",
    students: 18,
    modules: 12,
    lastModified: "3 days ago",
    progress: 100,
  },
];

function getStatusColor(status: Course["status"]) {
  switch (status) {
    case "published":
      return "bg-secondary text-secondary-foreground";
    case "draft":
      return "bg-muted text-muted-foreground";
    case "archived":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function RecentCourses() {
  const navigate = useNavigate();

  const handleAction = (action: string, courseId: string) => {
    switch (action) {
      case "view":
      case "edit":
        navigate("/courses");
        break;
      case "delete":
        console.log("Delete course:", courseId);
        // TODO: Implement delete functionality
        break;
      default:
        console.log("Course action:", action, courseId);
    }
  };

  return (
    <Card className="bg-gradient-card shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Recent Courses
        </CardTitle>
        <CardDescription>
          Your latest course projects and their current status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sampleCourses.map((course) => (
            <div
              key={course.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border bg-background/50 hover:bg-background/80 transition-colors"
            >
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium truncate">{course.title}</h3>
                  <Badge className={getStatusColor(course.status)}>
                    {course.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {course.students} students
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {course.modules} modules
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {course.lastModified}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-right mr-4">
                  <div className="text-sm font-medium">{course.progress}%</div>
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleAction("view", course.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Course
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction("edit", course.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Course
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleAction("delete", course.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Course
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => navigate("/courses")}>
            View All Courses
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
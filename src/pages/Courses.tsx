import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "@/lib/config";

type CourseCard = {
  slug: string;
  title: string;
  updated: string;
  categories: { [k: string]: number };
};

const Courses = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [waiting, setWaiting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const waitForGeneration = async () => {
      // poll /generation/status until completed
      try {
        for (let i = 0; i < 60; i++) { // up to ~60s
          const res = await fetch(`${API_BASE}/generation/status`);
          const j = res.ok ? await res.json() : { completed: true };
          if (j.completed) return true;
          await new Promise(r => setTimeout(r, 1000));
        }
      } catch {}
      return true; // fail-open to avoid blocking UI forever
    };
    const load = async () => {
      setWaiting(true);
      await waitForGeneration();
      if (cancelled) return;
      setWaiting(false);
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/courses`);
        if (!res.ok) throw new Error("Failed to load courses");
        const data = await res.json();
        if (!cancelled) setCourses(data.courses || []);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Failed to load courses");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
            <p className="text-muted-foreground">Manage and track your course content</p>
          </div>
          <Button onClick={() => navigate("/create")}>
            <Plus className="w-4 h-4 mr-2" />
            New Course
          </Button>
        </div>

        {waiting ? (
          <div className="text-muted-foreground text-sm">Waiting for generation to complete...</div>
        ) : loading ? (
          <div className="text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/> Loading courses...</div>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.slug} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/courses/${course.slug}`)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <Badge variant="secondary">Updated {new Date(course.updated).toLocaleDateString()}</Badge>
                  </div>
                  <CardDescription>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><BookOpen className="w-4 h-4"/>CM {course.categories?.["course-material"] ?? 0}</span>
                      <span>Quizzes {course.categories?.quizzes ?? 0}</span>
                      <span>PPTs {course.categories?.ppts ?? 0}</span>
                      <span>Flashcards {course.categories?.flashcards ?? 0}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Updated {new Date(course.updated).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
            {courses.length === 0 && (
              <p className="text-sm text-muted-foreground">No courses yet. Generate content to see your courses here.</p>
            )}
          </div>
        )}
    </div>
  );
};

export default Courses;
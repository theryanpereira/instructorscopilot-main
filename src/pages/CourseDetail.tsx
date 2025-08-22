import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, ArrowLeft } from "lucide-react";
import { API_BASE } from "@/lib/config";

type FileItem = {
  name: string;
  size: number;
  modified: string;
  ext?: string;
  download_url: string;
};

type CourseDetailResponse = {
  slug: string;
  title: string;
  course_material: FileItem[];
  quizzes: FileItem[];
  ppts: FileItem[];
  flashcards: FileItem[];
};

type TabKey = "course_material" | "quizzes" | "ppts" | "flashcards";

export default function CourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<CourseDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<TabKey>("course_material");
  const [waiting, setWaiting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const waitForGeneration = async () => {
      try {
        for (let i = 0; i < 60; i++) {
          const res = await fetch(`${API_BASE}/generation/status`);
          const j = res.ok ? await res.json() : { completed: true };
          if (j.completed) return true;
          await new Promise(r => setTimeout(r, 1000));
        }
      } catch {}
      return true;
    };
    const load = async () => {
      if (!slug) return;
      setWaiting(true);
      await waitForGeneration();
      if (cancelled) return;
      setWaiting(false);
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/courses/${slug}`);
        if (!res.ok) throw new Error("Failed to load course");
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Failed to load course");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [slug]);

  const title = useMemo(() => {
    switch (active) {
      case "course_material": return "Course Material";
      case "quizzes": return "Quizzes";
      case "ppts": return "PPTs";
      case "flashcards": return "Flashcards";
    }
  }, [active]);

  const files: FileItem[] = data ? (data as any)[active] as FileItem[] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-1"/>Back
            </Button>
            {data && (
              <Badge variant="secondary">{data.slug}</Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground">{data?.title || "Course"}</h1>
          <p className="text-muted-foreground text-sm">View all generated content for this course and download assets.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-lg border">
        <div className="flex flex-wrap gap-2 p-2 border-b bg-muted/50">
          <TabButton label="Course Material" active={active === "course_material"} onClick={() => setActive("course_material")} />
          <TabButton label="Quizzes" active={active === "quizzes"} onClick={() => setActive("quizzes")} />
          <TabButton label="PPTs" active={active === "ppts"} onClick={() => setActive("ppts")} />
          <TabButton label="Flashcards" active={active === "flashcards"} onClick={() => setActive("flashcards")} />
        </div>
        <div className="p-4">
          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              {waiting ? (
                <div className="flex items-center gap-2 text-muted-foreground">Waiting for generation to complete...</div>
              ) : loading ? (
                <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
              ) : error ? (
                <p className="text-red-500 text-sm">{error}</p>
              ) : !data ? (
                <p className="text-sm text-muted-foreground">No data.</p>
              ) : files.length === 0 ? (
                <p className="text-sm text-muted-foreground">No files in this category.</p>
              ) : (
                <ul className="divide-y">
                  {files.map((f) => (
                    <li key={`${active}-${f.name}`} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">{f.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(f.modified).toLocaleString()} • {(f.size/1024).toFixed(1)} KB</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={`${API_BASE}${f.download_url}`} target="_blank" rel="noreferrer">
                          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4"/>Download</Button>
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <Button
      variant={active ? "default" : "ghost"}
      size="sm"
      className={active ? "" : "text-foreground/70"}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Users, FileText, TrendingUp, Sparkles, Clock, Loader2, Download } from "lucide-react";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type TabKey = "course-material" | "quizzes" | "ppts" | "flashcards";

interface ListedFile {
  name: string;
  size: number;
  modified: string;
  ext?: string;
}

const API_BASE = "https://instructorscopilot-main.onrender.com";

export default function Dashboard() {
  const [active, setActive] = useState<TabKey>("course-material");
  const [files, setFiles] = useState<Record<TabKey, ListedFile[]>>({
    "course-material": [],
    quizzes: [],
    ppts: [],
    flashcards: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchFiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/files/${active}`);
        if (!res.ok) throw new Error(`Failed to fetch ${active} files`);
        const data = await res.json();
        if (!cancelled) {
          setFiles(prev => ({ ...prev, [active]: data.files || [] }));
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Failed to load files");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchFiles();
    return () => { cancelled = true; };
  }, [active]);

  const title = useMemo(() => {
    switch (active) {
      case "course-material": return "Course Material";
      case "quizzes": return "Quizzes";
      case "ppts": return "PPTs";
      case "flashcards": return "Flashcards";
    }
  }, [active]);

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

      {/* Quick Actions */}
      <QuickActions />

      {/* Tabs */}
      <div className="rounded-lg border">
        <div className="flex flex-wrap gap-2 p-2 border-b bg-muted/50">
          <TabButton label="Course Material" active={active === "course-material"} onClick={() => setActive("course-material")} />
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
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
              ) : error ? (
                <p className="text-red-500 text-sm">{error}</p>
              ) : files[active].length === 0 ? (
                <p className="text-sm text-muted-foreground">No files available yet.</p>
              ) : (
                <ul className="divide-y">
                  {files[active].map((f) => (
                    <li key={`${active}-${f.name}`} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">{f.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(f.modified).toLocaleString()} • {(f.size/1024).toFixed(1)} KB</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={`${API_BASE}/download/${active}/${encodeURIComponent(f.name)}`} target="_blank" rel="noreferrer">
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
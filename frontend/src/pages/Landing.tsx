import { useState } from "react";
import { ArrowRight, BookOpen, Brain, Users, FileText, Play, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/layout/Footer";

const Landing = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Content Generation",
      description: "Generate lesson plans, slides, video scripts, and quizzes in minutes, not hours."
    },
    {
      icon: Users,
      title: "Personalized Learning Paths",
      description: "Adapt content to each student's interests and learning style automatically."
    },
    {
      icon: FileText,
      title: "Seamless Export",
      description: "Push outputs directly to Google Docs, Slides, and LMS-friendly formats."
    },
    {
      icon: BookOpen,
      title: "Tone Alignment",
      description: "Maintain your unique teaching voice with AI that learns from your past content."
    }
  ];

  const handleGetStarted = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Masterplan</h1>
              <p className="text-xs text-muted-foreground">AI Copilot for Instructors</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Sign In
            </Button>
            <Button onClick={handleGetStarted}>
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary">
              AI-Powered Course Creation
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Reduce Course Creation Time by{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                50%
              </span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground md:text-2xl">
              Build personalized courses, generate content, and maintain your unique teaching voice 
              with our AI copilot designed specifically for educators.
            </p>
            
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <div className="flex w-full max-w-sm items-center space-x-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button onClick={handleGetStarted}>
                  Start Free
                </Button>
              </div>
            </div>
            
            <p className="mt-4 text-sm text-muted-foreground">
              Free during MVP phase • No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="mx-auto max-w-4xl text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything you need to create better courses</h2>
            <p className="text-lg text-muted-foreground">
              Powerful AI tools designed specifically for solo course creators and educators
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container px-4">
          <div className="mx-auto max-w-4xl text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How it works</h2>
            <p className="text-lg text-muted-foreground">
              From prompt to published course in just a few steps
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Your Tone</h3>
              <p className="text-muted-foreground">
                Share a sample of your past content so AI learns your unique teaching style
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Generate Content</h3>
              <p className="text-muted-foreground">
                Use simple prompts to create lesson plans, slides, quizzes, and video scripts
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Export & Teach</h3>
              <p className="text-muted-foreground">
                Export directly to Google Docs, Slides, or your favorite LMS
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to transform your course creation?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join educators who are saving hours every week with AI-powered course creation
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={handleGetStarted}
              className="bg-background text-foreground hover:bg-background/90"
            >
              Start Creating for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
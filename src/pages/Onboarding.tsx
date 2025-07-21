import { useState } from "react";
import { ArrowRight, Upload, FileText, BookOpen, CheckCircle, Play, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    teachingSubject: "",
    experience: "",
    toneSample: "",
    goals: []
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const goals = [
    { id: "speed", label: "Speed up content creation", icon: "⚡" },
    { id: "personalize", label: "Personalize learning paths", icon: "🎯" },
    { id: "tone", label: "Maintain my teaching voice", icon: "🎨" },
    { id: "quizzes", label: "Generate quizzes & assessments", icon: "📝" }
  ];

  const handleGoalToggle = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      toast({
        title: "Welcome to Masterplan!",
        description: "Your account is all set up. Let's start creating amazing courses.",
      });
      navigate("/dashboard");
    }
  };

  const handleSkip = () => {
    toast({
      title: "Setup skipped",
      description: "You can complete this setup anytime in Settings.",
    });
    navigate("/dashboard");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                Tell us about your teaching
              </CardTitle>
              <CardDescription>
                Help us understand your teaching background so we can personalize your experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">What subject do you teach?</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Web Development, Data Science, Marketing"
                  value={formData.teachingSubject}
                  onChange={(e) => setFormData(prev => ({ ...prev, teachingSubject: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Teaching experience</Label>
                <select 
                  id="experience"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                >
                  <option value="">Select your experience level</option>
                  <option value="beginner">Beginner  (0 - 3 yrs)</option>
                  <option value="intermediate">Intermediate  (4 - 9 yrs)</option>
                  <option value="advanced">Advanced (10+ yrs)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Share your teaching style
              </CardTitle>
              <CardDescription>
                Upload a sample of your past content or describe your teaching style so our AI can match your voice.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Upload a sample lesson or content (optional)</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop files here, or click to browse
                  </p>
                  <Button variant="outline" size="sm">
                    Choose Files
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Only PDF files accepted
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="toneSample">Or describe your teaching style</Label>
                <Textarea
                  id="toneSample"
                  placeholder="e.g., I use lots of real-world examples, keep things conversational, and break down complex topics into simple steps..."
                  rows={4}
                  value={formData.toneSample}
                  onChange={(e) => setFormData(prev => ({ ...prev, toneSample: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-primary" />
                What are your goals?
              </CardTitle>
              <CardDescription>
                Select what you want to achieve with Masterplan. You can change these anytime.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.goals.includes(goal.id)
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    }`}
                    onClick={() => handleGoalToggle(goal.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{goal.icon}</span>
                      <span className="font-medium">{goal.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Set Up Student Intake (optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <p className="text-muted-foreground">
                Upload a .csv file with student information to personalize content for each student.
              </p>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop a .csv file here, or click to upload
                </p>
                <Button variant="outline">
                  Upload CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Masterplan</h1>
              <p className="text-xs text-muted-foreground">Setup your account</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleSkip}>
            Skip setup
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container max-w-2xl py-8 px-4">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          <Button onClick={handleNext}>
            {currentStep === totalSteps ? "Get Started" : "Next"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
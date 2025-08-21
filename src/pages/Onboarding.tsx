import { useState, useEffect } from "react";
import { ArrowRight, BookOpen, CheckCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { userAPI } from "@/lib/api";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [formData, setFormData] = useState({
    teachingSubject: "",
    fullName: "", // New field for full name
    experience: "",
    toneSample: "",
    goals: []
  });

  // Check if user already has a profile and redirect to dashboard
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (user?.id) {
        try {
          const profile = await userAPI.getProfile(user.id);
          if (profile && profile.full_name) {
            // User has already completed onboarding, redirect to dashboard
            toast({
              title: "Welcome back!",
              description: "You're all set up. Taking you to your dashboard.",
            });
            navigate("/dashboard", { replace: true });
            return;
          }
        } catch (error) {
          console.error("Error checking user profile:", error);
        }
      }
      setIsCheckingProfile(false);
    };

    checkExistingProfile();
  }, [user, navigate, toast]);

  // Pre-fill name from Google OAuth if available
  useEffect(() => {
    if (user && user.user_metadata?.full_name) {
      setFormData(prev => ({
        ...prev,
        fullName: user.user_metadata.full_name
      }));
    }
  }, [user]);

  // Save user profile to Supabase
  const saveUserProfile = async (fullName: string, teachingSubject: string, experience: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User session not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      await userAPI.upsertProfile({
        user_id: user.id,
        full_name: fullName,
        subject_areas: teachingSubject ? [teachingSubject] : [],
        role: experience, // Store experience level in role field
      });

      console.log("User profile saved successfully.");
    } catch (error) {
      console.error("Error saving user profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const totalSteps = 1;
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

  const handleNext = async () => { // Made handleNext async
    if (formData.fullName.trim() === "" || formData.experience.trim() === "") {
      toast({
        title: "Missing Information",
        description: "Please enter input in mandatory fields marked with a *",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save the user profile to Supabase
      await saveUserProfile(formData.fullName, formData.teachingSubject, formData.experience);

      // Complete onboarding and go directly to dashboard
      toast({
        title: "Welcome to Masterplan!",
        description: "Your account is all set up. Let's start creating amazing courses.",
      });
      navigate("/dashboard");
    } catch (error) {
      // Error toast is already shown in saveUserProfile
      console.error("Error during onboarding completion:", error);
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
                Tell us about yourself
              </CardTitle>
              <CardDescription>
                Help us understand your teaching background so we can personalize your experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Please enter your full name <span className="text-red-500">*</span></Label>
                <Input
                  id="fullName"
                  placeholder="e.g., John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                />
              </div>
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
                <Label htmlFor="experience">Teaching experience <span className="text-red-500">*</span></Label>
                <select 
                  id="experience"
                  title="Select your teaching experience level"
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

      default:
        return null;
    }
  };

  // Show loading while checking profile
  if (isCheckingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking your profile...</p>
        </div>
      </div>
    );
  }

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
        <div className="flex justify-end">
          <Button onClick={handleNext}>
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Onboarding;
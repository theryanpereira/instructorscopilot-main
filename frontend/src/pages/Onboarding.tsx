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
import { Footer } from "@/components/layout/Footer";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    teachingSubject: "",
    fullName: "", // New field for full name
    experience: "",
    toneSample: "",
    goals: []
  });

  // Async function to save user name to the backend
  const saveUserNameToBackend = async (fullName: string) => {
    // Retrieve user_id from localStorage
    const user_id = localStorage.getItem('user_id');
    if (!user_id) {
      console.error("Error: user_id not found in localStorage. Cannot save user name.");
      toast({
        title: "Error",
        description: "User session not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        user_id: user_id,
        user_name: fullName,
      };

      // TEST CODE: Log payload before sending
      console.log("TEST CODE: Sending payload to /save-user-name:", payload);

      const response = await fetch('/save-user-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("User name saved to backend successfully.");
        // TEST CODE: Log successful response
        console.log("TEST CODE: /save-user-name success response:", await response.json());
      } else {
        const errorData = await response.json();
        console.error("Failed to save user name to backend.", errorData);
        // TEST CODE: Log error response
        console.error("TEST CODE: /save-user-name error response:", errorData);
      }
    } catch (error) {
      console.error("Error sending user name to backend:", error);
      // TEST CODE: Log catch error
      console.error("TEST CODE: Error in saveUserNameToBackend catch block:", error);
    }
  };

  // File validation handler
  const handleFileChange = (e, allowedTypes, label) => {
    const file = e.target.files?.[0];
    if (file && !allowedTypes.some(type => file.name.toLowerCase().endsWith(type))) {
      toast({
        title: 'Invalid file type',
        description: `Please upload a valid ${label} file (${allowedTypes.join(', ')})`,
        variant: 'destructive',
      });
      e.target.value = '';
    }
  };

  const totalSteps = 1; // Changed from 2 to 1 to make it a single-step onboarding followed by redirection

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

    // If currently on Step 1, save the full name to the backend
    if (currentStep === 1) {
      await saveUserNameToBackend(formData.fullName);
      // After saving user name, redirect directly to the create page
      navigate("/create"); // Redirect to the create page after step 1
      return; // Exit the function after navigation
    }

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

      case 2: // Commenting out Step 2 of 2
        return (
          // <Card>
          //   <CardHeader>
          //     <CardTitle className="flex items-center gap-2">
          //       <Users className="h-6 w-6 text-primary" />
          //       Set Up Student Intake (optional)
          //     </CardTitle>
          //   </CardHeader>
          //   <CardContent className="space-y-4">
          //      <p className="text-muted-foreground">
          //       Upload a .csv file with student information to personalize content for each student.
          //     </p>
          //     <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          //       <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          //       <p className="text-sm text-muted-foreground mb-2">
          //         Drag and drop a .csv file here, or click to upload
          //       </p>
          //       <Button variant="outline" onClick={() => document.getElementById('onboarding-csv-upload')?.click()}>
          //         Upload CSV
          //       </Button>
          //       <Input id="onboarding-csv-upload" type="file" accept=".csv" className="hidden" onChange={e => handleFileChange(e, ['.csv'], 'CSV')} />
          //     </div>
          //   </CardContent>
          // </Card>
          null // Render nothing for case 2, effectively hiding it
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
      <Footer />
    </div>
  );
};

export default Onboarding;
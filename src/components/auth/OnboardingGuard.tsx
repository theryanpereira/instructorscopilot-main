import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { userAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export const OnboardingGuard = ({ children }: OnboardingGuardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  useEffect(() => {
    const checkProfileStatus = async () => {
      if (user?.id) {
        try {
          const profile = await userAPI.getProfile(user.id);
          if (profile && profile.full_name) {
            // User already has a profile, redirect to dashboard
            toast({
              title: "Welcome back!",
              description: "You're already set up. Taking you to your dashboard.",
            });
            setShouldShowOnboarding(false);
          } else {
            // User needs onboarding
            setShouldShowOnboarding(true);
          }
        } catch (error) {
          console.error("Error checking profile in OnboardingGuard:", error);
          // Default to showing onboarding if we can't check
          setShouldShowOnboarding(true);
        }
      }
      setIsChecking(false);
    };

    checkProfileStatus();
  }, [user, toast]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking your profile...</p>
        </div>
      </div>
    );
  }

  if (!shouldShowOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

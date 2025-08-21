import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Processing OAuth callback...");
        console.log("Current URL:", window.location.href);
        
        // Handle OAuth callback from URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          setError(error.message);
          // Redirect to login page with error
          setTimeout(() => navigate("/login?error=auth_failed"), 2000);
          return;
        }

        if (data.session) {
          console.log("User authenticated successfully:", data.session.user);
          
          // Check if user exists and has profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error("Profile fetch error:", profileError);
          }

          // Redirect to onboarding if no profile, otherwise dashboard
          if (!profile) {
            console.log("New user - redirecting to onboarding");
            navigate("/onboarding");
          } else {
            console.log("Existing user - redirecting to dashboard");
            navigate("/dashboard");
          }
        } else {
          console.log("No session found, redirecting to login");
          navigate("/login");
        }
      } catch (err) {
        console.error("Unexpected error during auth callback:", err);
        setError("Authentication failed. Please try again.");
        setTimeout(() => navigate("/login"), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold mb-2">Authentication Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold mb-2">Welcome to Instructors Copilot!</h2>
        <p className="text-muted-foreground">Setting up your account...</p>
        {isLoading && (
          <div className="mt-4">
            <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
              <div className="bg-primary h-2 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;

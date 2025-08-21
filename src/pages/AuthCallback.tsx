import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const AuthCallback = () => {
  const { user } = useAuth();

  useEffect(() => {
    // The AuthContext will handle the redirect automatically
    // This page just needs to exist for the OAuth callback
    if (user) {
      // AuthContext onAuthStateChange will handle the redirect
      console.log("User authenticated, AuthContext will handle redirect");
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Setting up your account...</p>
      </div>
    </div>
  );
};

export default AuthCallback;

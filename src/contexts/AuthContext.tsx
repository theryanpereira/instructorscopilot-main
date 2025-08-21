import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthError, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { userAPI } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error?: AuthError }>;
  checkUserProfileAndRedirect: (userId: string) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN' && session?.user) {
          // Check if we're on login or auth callback page to handle redirect
          const currentPath = window.location.pathname;
          if (currentPath === '/login' || currentPath === '/auth/callback') {
            try {
              const profile = await userAPI.getProfile(session.user.id);
              if (profile && profile.full_name) {
                // Existing user - redirect to dashboard
                toast({
                  title: "Welcome back!",
                  description: "Taking you to your dashboard.",
                });
                window.location.href = '/dashboard';
              } else {
                // New user - redirect to onboarding
                toast({
                  title: "Welcome!",
                  description: "Let's set up your profile.",
                });
                window.location.href = '/onboarding';
              }
            } catch (error) {
              console.error("Error checking profile during sign in:", error);
              // Default to onboarding if profile check fails
              window.location.href = '/onboarding';
            }
          } else {
            toast({
              title: "Welcome!",
              description: "You've been successfully signed in.",
            });
          }
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out",
            description: "You've been successfully signed out.",
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      return {};
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: "Sign In Failed",
        description: authError.message,
        variant: "destructive",
      });
      return { error: authError };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });

      return {};
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: "Sign Up Failed",
        description: authError.message,
        variant: "destructive",
      });
      return { error: authError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast({
          title: "Google Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      return {};
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: "Google Sign In Failed",
        description: authError.message,
        variant: "destructive",
      });
      return { error: authError };
    }
  };

  const checkUserProfileAndRedirect = async (userId: string): Promise<string> => {
    try {
      const profile = await userAPI.getProfile(userId);
      if (profile && profile.full_name) {
        // User has completed onboarding, go to dashboard
        return "/dashboard";
      } else {
        // User needs to complete onboarding
        return "/onboarding";
      }
    } catch (error) {
      console.error("Error checking user profile:", error);
      // Default to onboarding if we can't check profile
      return "/onboarding";
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    checkUserProfileAndRedirect,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

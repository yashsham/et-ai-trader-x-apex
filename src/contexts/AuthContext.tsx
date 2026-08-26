import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for errors in the URL query parameters (commonly from OAuth failures)
    const queryParams = new URLSearchParams(window.location.search);
    const error = queryParams.get('error');
    const errorCode = queryParams.get('error_code');
    const errorDescription = queryParams.get('error_description');

    if (error || errorCode) {
      import('sonner').then(({ toast }) => {
        toast.error(`${errorDescription || errorCode || "Authentication error"}`);
      });
      // Clear the query params from the URL to avoid repeated alerts
      const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    // Fallback timer: ensure loading state never hangs indefinitely
    const fallbackTimer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    // Check active sessions and sets the user
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        clearTimeout(fallbackTimer);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((err) => {
        clearTimeout(fallbackTimer);
        console.error("Failed to get session:", err);
        setLoading(false);
      });

    // Listen for changes on auth state (logged in, signed out, etc.)
    let subscription: any = null;
    try {
      const authListener = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });
      subscription = authListener?.data?.subscription;
    } catch (err) {
      console.error("Failed to subscribe to auth state changes:", err);
      setLoading(false);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signOut = async () => {
    sessionStorage.removeItem("has_seen_onboarding_session");
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

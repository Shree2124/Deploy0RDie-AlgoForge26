"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types/types";
import {
  signUpWithEmail as supabaseSignUp,
  signInWithEmail as supabaseSignIn,
  signInWithGoogle as supabaseSignInWithGoogle,
  signOutUser,
  sendPasswordResetEmail as supabaseSendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  getCurrentUser,
  AuthUser
} from "@/lib/supabase/auth";
import { supabase } from "@/lib/supabase/client"; // Added DB client

interface AuthContextType {
  user: any | null; // Using any to extend standard User with verification fields
  loading: boolean;
  error: string | null;
  emailVerified: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>; // Added to refresh state after verification
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);

  const transformSupabaseUser = (supabaseUser: any): User => {
    const metadata = supabaseUser?.user_metadata || {};
    const isAdmin = metadata.role === 'admin' || !!supabaseUser.isAdmin;

    return {
      id: supabaseUser.id || supabaseUser.uid || "",
      name: metadata.full_name || supabaseUser.displayName || (isAdmin ? "Super Admin" : "Citizen User"),
      email: supabaseUser.email || "",
      avatarUrl: metadata.avatar_url || supabaseUser.photoURL || undefined,
      role: isAdmin ? "Admin" : "Citizen",
    };
  };

  const fetchProfileAndSetUser = async (sessionUser: any) => {
    const baseUser = transformSupabaseUser(sessionUser);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', baseUser.id)
        .single();
        
      setUser({
        ...baseUser,
        verification_status: profile?.verification_status || 'Unverified',
        aadhar_number: profile?.aadhar_number,
        phone: profile?.phone,
        rejection_reason: profile?.rejection_reason
      });
    } catch (e) {
      setUser(baseUser);
    }
  };

  const refreshUser = async () => {
    const currentUser = await getCurrentUser();
    if (currentUser) await fetchProfileAndSetUser(currentUser);
  };

  useEffect(() => {
    const adminSession = localStorage.getItem("admin_session");
    if (adminSession) {
      try {
        const adminUser = JSON.parse(adminSession);
        setUser(transformSupabaseUser(adminUser));
        setEmailVerified(true);
        setLoading(false);
        return;
      } catch (err) {
        localStorage.removeItem("admin_session");
      }
    }

    const unsubscribe = onAuthStateChanged(async (sessionUser, session) => {
      if (sessionUser) {
        await fetchProfileAndSetUser(sessionUser);
        setEmailVerified(!!sessionUser.email_confirmed_at);
      } else {
        setUser(null);
        setEmailVerified(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      await supabaseSignUp(email, password, name);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      try {
        const adminCheckResponse = await fetch("/api/auth/check-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (adminCheckResponse.ok) {
          const adminUser = await adminCheckResponse.json();
          setUser(transformSupabaseUser(adminUser));
          setEmailVerified(true);
          localStorage.setItem("admin_session", JSON.stringify(adminUser));
          return;
        }
      } catch (adminCheckError) {
        console.debug("Not admin credentials, trying regular sign in");
      }
      await supabaseSignIn(email, password);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (redirectTo?: string) => {
    setLoading(true);
    setError(null);
    try {
      await supabaseSignInWithGoogle(redirectTo);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      const adminSession = localStorage.getItem("admin_session");
      if (adminSession) {
        localStorage.removeItem("admin_session");
        setUser(null);
        setEmailVerified(false);
      } else {
        await signOutUser();
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await supabaseSendPasswordResetEmail(email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const resendVerification = async () => {
    setError(null);
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser || !currentUser.email) {
        throw new Error("No user logged in to resend verification");
      }
      await sendEmailVerification(currentUser.email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user, loading, error, emailVerified,
    signUp, signIn, signInWithGoogle, signOut, resetPassword, resendVerification, clearError, refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/auth/LoadingScreen";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, emailVerified, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user && emailVerified) {
        // User is authenticated and verified, redirect to dashboard
        router.replace("/dashboard");
      }
    }
  }, [user, emailVerified, loading, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  // If user is authenticated and verified, don't render auth pages
  // (router.replace above will handle redirect)
  if (user && emailVerified) {
    return null;
  }

  return <>{children}</>;
}

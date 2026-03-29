"use client";

import React, { useEffect, useState, lazy, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/auth/LoadingScreen";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import SiteHeader from "@/components/layouts/SiteHeader";
import DashboardSidebar from "@/components/layouts/DashboardSidebar";
import DashboardPage from "@/app/(site)/dashboard/page";
import { ChatBot } from "@/components/LandingPage/ChatBot";
import { AccessibilityWidget } from "@/components/ui/AccessibilityWidget";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, emailVerified, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isTestSession, setIsTestSession] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Check for test session on client side only
  useEffect(() => {
    const testSession = localStorage.getItem("test_session_user");
    const adminSession = localStorage.getItem("admin_session");
    setIsTestSession(!!(testSession || adminSession));
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace(`/login?redirect=${pathname}`);
      } else if (user.role === "Admin") {
        router.replace("/admin/dashboard");
      } else if (!emailVerified) {
        if (isTestSession) {
          router.replace("/dashboard");
        } else {
          router.replace("/verify-email");
        }
      }
    }
  }, [user, emailVerified, loading, router, pathname, isTestSession]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user || (!emailVerified && !isTestSession) || user.role === "Admin") {
    return null;
  }

  const isDashboard = pathname === "/dashboard";

  return (
    <>
      <EmailVerificationBanner />
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <SiteHeader user={user} onMenuClick={() => setIsMobileNavOpen(true)} />
          <main className="flex-1 overflow-hidden">
            {isDashboard ? (
              <DashboardPage activeTab={activeTab} onTabChange={setActiveTab} isMobileNavOpen={isMobileNavOpen} setIsMobileNavOpen={setIsMobileNavOpen} />
            ) : (
              <div className="h-full overflow-y-auto w-full relative">
                {children}
              </div>
            )}
          </main>
        </div>
      </div>
      <ChatBot />
      <AccessibilityWidget />
    </>
  );
}


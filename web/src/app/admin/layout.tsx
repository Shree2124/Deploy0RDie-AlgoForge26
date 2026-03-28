"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/auth/LoadingScreen";
import AdminSidebar from "@/components/layouts/AdminSidebar";
import AdminHeader from "@/components/layouts/AdminHeader";
import AdminDashboardPage from "@/app/admin/dashboard/page";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isTestSession, setIsTestSession] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Check for test session on client side only
  useEffect(() => {
    const testSession = localStorage.getItem("test_session_user");
    const adminSession = localStorage.getItem("admin_session");
    setIsTestSession(!!(testSession || adminSession));
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated, redirect to login
        router.replace(`/login?redirect=${pathname}`);
      } else if (user.role !== "Admin" && !isTestSession) {
        // Not admin and not test session, redirect to regular dashboard
        router.replace("/dashboard");
      }
    }
  }, [user, loading, router, pathname, isTestSession]);

  if (loading) {
    return <LoadingScreen />;
  }

  // If not admin and not test session, don't render
  if (!user || (user.role !== "Admin" && !isTestSession)) {
    return null;
  }

  const isDashboard = pathname === "/admin/dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={user} activeTab={activeTab} />
        <main className="flex-1 overflow-hidden">
          {isDashboard ? (
            <AdminDashboardPage activeTab={activeTab} />
          ) : (
            <div className="h-full overflow-y-auto w-full relative">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

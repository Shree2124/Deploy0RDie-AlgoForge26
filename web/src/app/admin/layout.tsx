"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/auth/LoadingScreen";
import AdminSidebar from "@/components/layouts/AdminSidebar";
import AdminHeader from "@/components/layouts/AdminHeader";
import AdminDashboardPage from "@/app/admin/dashboard/page";

// Dynamically import project/vendor tabs (they use Leaflet which requires SSR=false)
const ProjectsTab = dynamic(() => import("@/components/dashboard/ProjectsTab"), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-center font-medium" style={{ color: "#57737a" }}>Loading Projects...</div>
  ),
});

const VendorsTab = dynamic(() => import("@/components/dashboard/VendorsTab"), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-center font-medium" style={{ color: "#57737a" }}>Loading Vendors...</div>
  ),
});

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

  // Determine what to render in the main area
  const renderContent = () => {
    if (!isDashboard) {
      return (
        <div className="h-full overflow-y-auto w-full relative">
          {children}
        </div>
      );
    }

    // Dashboard tabs - projects and vendors render as inline tabs
    if (activeTab === "projects") {
      return (
        <div className="h-full overflow-y-auto p-4 lg:p-8" style={{ backgroundColor: "#f4feff" }}>
          <div className="max-w-7xl mx-auto">
            <ProjectsTab />
          </div>
        </div>
      );
    }

    if (activeTab === "vendors") {
      return (
        <div className="h-full overflow-y-auto p-4 lg:p-8" style={{ backgroundColor: "#f4feff" }}>
          <div className="max-w-7xl mx-auto">
            <VendorsTab />
          </div>
        </div>
      );
    }

    return <AdminDashboardPage activeTab={activeTab} />;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={user} activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-hidden">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

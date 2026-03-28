"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell as BellIcon,
  User as UserIcon,
  LogOut,
  Plus as PlusIcon,
  Download as DownloadIcon,
  Menu as MenuIcon
} from "lucide-react";
import { User } from "@/types/types";
import { useAuth } from "@/hooks/useAuth";
import { LanguageSelector } from "@/components/ui/LanguageSelector";

interface AdminHeaderProps {
  user?: User;
  activeTab?: string;
  onExport?: () => void;
  isExporting?: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  user,
  activeTab = "overview",
  onExport,
  isExporting = false
}) => {
  const router = useRouter();
  const { signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const hasNotifications = true;

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
      setIsLoggingOut(false);
    }
  };

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case "overview": return "Overview";
      case "issues": return "Issues & Risk";
      case "rti": return "RTI Requests";
      case "contractors": return "Contractors";
      case "system": return "System Admin";
      default: return activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    }
  };

  return (
    <header
      className="text-white z-[90] sticky top-0 shrink-0"
      style={{
        backgroundColor: "#57737a",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="px-6 py-3 flex justify-between items-center">
        {/* Left: Mobile Nav Toggle + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors">
            <MenuIcon size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="hidden md:flex items-center gap-2">
            <span
              className="text-[14px] font-medium"
              style={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              Admin / {getBreadcrumbTitle()}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector />
          {/* Export Button */}
          {onExport && (
            <button
              onClick={onExport}
              disabled={isExporting}
              className="hidden sm:flex px-3 py-1.5 rounded-lg items-center gap-2 text-[14px] font-bold transition-all border border-white/20 hover:bg-white/10 disabled:opacity-50"
              style={{ color: "#ffffff" }}
            >
              {isExporting ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <DownloadIcon size={14} />
              )}
              {isExporting ? "Exporting..." : "Export"}
            </button>
          )}

          {/* New Project CTA */}
          <Link href="/admin/projects/new" aria-label="New Project">
            <div
              className="px-3 py-1.5 rounded-lg flex items-center gap-2 text-[14px] font-bold transition-all shadow-sm"
              style={{
                backgroundColor: "#040f0f",
                color: "#c2fcf7",
              }}
            >
              <PlusIcon size={14} />
              <span className="hidden sm:inline">Project</span>
            </div>
          </Link>

          {/* Alerts */}
          <div
            className="relative p-2 rounded-lg transition-all duration-300 hover:bg-white/10 cursor-pointer"
            style={{ color: "#ffffff" }}
          >
            <BellIcon size={18} />
            {hasNotifications && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: "#c2fcf7" }}
                ></span>
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{
                    backgroundColor: "#c2fcf7",
                    border: "1px solid #57737a",
                  }}
                ></span>
              </span>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              aria-label="Profile Menu"
              className="p-0.5 rounded-full transition-all"
              style={{ border: showDropdown ? "2px solid #c2fcf7" : "2px solid transparent" }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon size={16} style={{ color: "#ffffff" }} />
                )}
              </div>
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-[100]"
                  onClick={() => setShowDropdown(false)}
                />
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl py-2 z-[110]"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #b0d8db",
                  }}
                >
                  <div
                    className="px-4 py-3"
                    style={{ borderBottom: "1px solid #e0f7f9" }}
                  >
                    <p
                      className="text-[14px] font-semibold truncate"
                      style={{ color: "#040f0f" }}
                    >
                      {user?.name || "Admin User"}
                    </p>
                    <p
                      className="text-[12px] truncate capitalize"
                      style={{ color: "#57737a" }}
                    >
                      {user?.role || "System Admin"}
                    </p>
                  </div>

                  <button
                    onClick={handleSignOut}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                    style={{ color: "#b91c1c" }}
                  >
                    <LogOut size={16} />
                    {isLoggingOut ? "Signing Out..." : "Sign Out"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

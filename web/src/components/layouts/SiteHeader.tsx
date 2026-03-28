"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell as BellIcon,
  User as UserIcon,
  LogOut,
  Camera as CameraIcon,
  Menu as MenuIcon,
} from "lucide-react";
import { User } from "@/types/types";
import { useAuth } from "@/hooks/useAuth";
import { LanguageSelector } from "@/components/ui/LanguageSelector";

interface DashboardHeaderProps {
  user?: User;
  onMenuClick?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, onMenuClick }) => {
  const pathname = usePathname();
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

  return (
    <header
      className="text-white z-[90] sticky top-0 shrink-0"
      style={{
        backgroundColor: "#57737a",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="px-6 py-3 flex justify-between items-center">
        {/* Left: Hamburger (mobile only) + Logo (mobile only) + breadcrumb */}
        <div className="flex items-center gap-3">
          <button 
            className="md:hidden p-2 rounded-lg text-white transition-colors"
            onClick={onMenuClick}
          >
            <MenuIcon size={20} />
          </button>
          <Link href="/dashboard" className="md:hidden flex items-center">
            <img
              src="/mainlogo.svg"
              alt="logo"
              className="h-9 w-auto object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </Link>

          {/* Breadcrumb */}
          <div className="hidden md:flex items-center gap-2">
            <span
              className="text-[14px] font-medium"
              style={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              {pathname === "/dashboard"
                ? "Dashboard"
                : pathname === "/mapview"
                  ? "Map View"
                  : pathname === "/alertview"
                    ? "Alerts"
                    : pathname === "/reportissue"
                      ? "New Audit"
                      : pathname === "/profileview"
                        ? "Profile"
                        : "Dashboard"}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector />
          {/* Alerts */}
          <Link href="/alertview" aria-label="Alerts">
            <div
              className="relative p-2 rounded-lg transition-all duration-300"
              style={{
                backgroundColor:
                  pathname === "/alertview"
                    ? "rgba(255, 255, 255, 0.18)"
                    : "transparent",
                color: "#ffffff",
              }}
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
          </Link>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              aria-label="Profile Menu"
              className="p-0.5 rounded-full transition-all"
              style={{
                border:
                  pathname === "/profileview"
                    ? "2px solid #c2fcf7"
                    : "2px solid transparent",
              }}
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
                      {user?.name || "User"}
                    </p>
                    <p
                      className="text-[12px] truncate"
                      style={{ color: "#57737a" }}
                    >
                      {user?.email || ""}
                    </p>
                  </div>

                  <Link
                    href="/profileview"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[14px] transition-colors"
                    style={{ color: "#040f0f" }}
                  >
                    <UserIcon size={16} />
                    View Profile
                  </Link>

                  <button
                    onClick={handleSignOut}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export const SiteHeader = DashboardHeader;
export default DashboardHeader;

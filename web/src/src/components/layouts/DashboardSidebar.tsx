"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  MapPin,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
}

const sidebarItems: SidebarItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "reports", label: "My Reports", icon: ClipboardList },
  { id: "rti", label: "RTI & Docs", icon: FileText },
  { id: "mapview", label: "Map View", icon: MapPin, href: "/mapview" },
];

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function DashboardSidebar({ activeTab, onTabChange }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="hidden md:flex flex-col h-screen sticky top-0 z-[100] shrink-0 overflow-hidden"
      style={{
        backgroundColor: "#57737a",
        borderRight: "1px solid rgba(255, 255, 255, 0.12)",
      }}
    >
      {/* Logo + Collapse */}
      <div
        className="flex items-center justify-between px-4 py-5 shrink-0"
        style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}
      >
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <img
                src="/mainlogo.svg"
                alt="Civic.ai"
                className="h-10 w-auto object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg transition-colors"
          style={{
            color: "#e8f9fa",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <AnimatePresence>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 mb-3 text-[12px] font-bold uppercase tracking-widest"
              style={{ color: "rgba(255, 255, 255, 0.5)" }}
            >
              Navigation
            </motion.p>
          )}
        </AnimatePresence>

        {sidebarItems.map((item) => {
          const isMapViewActive = item.id === "mapview" && pathname === "/mapview";
          const isTabActive = item.id !== "mapview" && activeTab === item.id && pathname === "/dashboard";
          const isActive = isMapViewActive || isTabActive;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.href) {
                  router.push(item.href);
                } else {
                  if (pathname !== "/dashboard") {
                    router.push("/dashboard");
                  }
                  onTabChange(item.id);
                }
              }}
              className={`w-full flex items-center gap-3 rounded-xl text-[14px] font-medium transition-all duration-200 group relative ${
                collapsed ? "px-0 py-3 justify-center" : "px-4 py-3"
              }`}
              style={{
                backgroundColor: isActive
                  ? "rgba(255, 255, 255, 0.18)"
                  : "transparent",
                color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.75)",
              }}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebarActive"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                  style={{ backgroundColor: "#c2fcf7" }}
                  transition={{ duration: 0.2 }}
                />
              )}
              <item.icon size={20} className="shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      {/* User Info + Sign Out */}
      <div
        className="shrink-0 px-3 py-4"
        style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}
      >
        {!collapsed && user && (
          <div className="px-3 mb-3">
            <p
              className="text-[14px] font-semibold truncate"
              style={{ color: "#ffffff" }}
            >
              {user.name || "User"}
            </p>
            <p
              className="text-[12px] truncate"
              style={{ color: "rgba(255, 255, 255, 0.55)" }}
            >
              {user.email}
            </p>
          </div>
        )}
        <button
          onClick={() => signOut()}
          className={`w-full flex items-center gap-3 rounded-xl text-[14px] font-medium transition-all duration-200 ${
            collapsed ? "px-0 py-3 justify-center" : "px-4 py-3"
          }`}
          style={{ color: "#fecaca" }}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}

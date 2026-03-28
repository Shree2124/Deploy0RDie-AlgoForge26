"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  AlertTriangle,
  FileText,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Building2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  count?: number;
}

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  highRiskCount?: number;
  pendingRtiCount?: number;
}

export default function AdminSidebar({ 
  activeTab, 
  onTabChange,
  highRiskCount = 0,
  pendingRtiCount = 0
}: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const sidebarItems: SidebarItem[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "issues", label: "Issues & Risk", icon: AlertTriangle, count: highRiskCount },
    { id: "rti", label: "RTI Requests", icon: FileText, count: pendingRtiCount },
    { id: "contractors", label: "Contractors", icon: Users },
    { id: "system", label: "System Admin", icon: Settings },
  ];

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
              className="flex items-center gap-3 group shrink-0"
            >
              <div className="bg-[#c2fcf7] p-1.5 rounded-lg flex-shrink-0">
                <Building2 size={24} className="text-[#040f0f]" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <Link href="/">
                  <h1 className="text-lg font-bold font-serif tracking-wide text-white truncate">Civic.ai</h1>
                </Link>
                <p className="text-[10px] uppercase tracking-widest truncate" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                  Admin Console
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg transition-colors flex-shrink-0"
          style={{
            color: "#e8f9fa",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 mb-3 text-[12px] font-bold uppercase tracking-widest shrink-0"
              style={{ color: "rgba(255, 255, 255, 0.5)" }}
            >
              Administration
            </motion.p>
          )}
        </AnimatePresence>

        {sidebarItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 rounded-xl text-[14px] font-medium transition-all duration-200 group relative ${
                collapsed ? "px-0 py-3 justify-center" : "px-4 py-3 justify-between"
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
                  layoutId="adminSidebarActive"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                  style={{ backgroundColor: "#c2fcf7" }}
                  transition={{ duration: 0.2 }}
                />
              )}
              
              <div className="flex items-center gap-3 overflow-hidden">
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
              </div>

              {/* Notification Badges */}
              {!collapsed && item.count !== undefined && item.count > 0 && (
                <span 
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                  style={{ 
                    backgroundColor: isActive ? "#c2fcf7" : "rgba(239, 68, 68, 0.15)", // red-500 tint
                    color: isActive ? "#040f0f" : "#fca5a5", // text-red-300
                    border: isActive ? "none" : "1px solid rgba(239, 68, 68, 0.3)"
                  }}
                >
                  {item.count}
                </span>
              )}
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
              {user.name || "Admin User"}
            </p>
            <p
              className="text-[12px] truncate capitalize"
              style={{ color: "rgba(255, 255, 255, 0.55)" }}
            >
              {user.role || "Super Administrator"}
            </p>
          </div>
        )}
        <button
          onClick={() => signOut()}
          className={`w-full flex items-center gap-3 rounded-xl text-[14px] font-medium transition-all duration-200 hover:bg-red-500/10 ${
            collapsed ? "px-0 py-3 justify-center" : "px-4 py-3"
          }`}
          style={{ color: "#fca5a5" }}
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

"use client";
import React, { useState } from "react";
import {
  LogOut,
  Shield,
  Bell,
  HelpCircle,
  Award,
  TrendingUp,
  Download,
  Fingerprint,
  Share2,
  User as UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const user = {
    name: authUser?.name || "Himanshu Khairnar",
    email: authUser?.email || "user@civic.ai",
    avatarUrl: authUser?.avatarUrl || "",
    role: authUser?.role || "Citizen Auditor",
    joinDate: "23 Nov 2025",
    idHash: "8X99-A2B1-Z990-QW12",
  };

  const stats = {
    totalReports: 42,
    highRiskCount: 8,
    fundsAtRisk: 124500000,
  };

  const getRank = (count: number) => {
    if (count > 50)
      return { title: "National Guardian", color: "bg-orange-600", icon: "👑" };
    if (count > 20)
      return { title: "Senior Auditor", color: "bg-blue-600", icon: "⭐" };
    if (count > 5)
      return { title: "Vigilant Citizen", color: "bg-green-600", icon: "🛡️" };
    return { title: "Active Observer", color: "bg-slate-500", icon: "👀" };
  };

  const rank = getRank(stats.totalReports);
  const nextLevelReports = 20 - (stats.totalReports % 20);
  const progressPercentage = ((stats.totalReports % 20) / 20) * 100;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="container mx-auto max-w-5xl py-12 px-4 sm:px-6">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
            <p className="text-slate-500">
              Manage your citizen identity and audit logs.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Operational
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-[350px] flex-shrink-0">
            <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-700 transition-transform duration-300 hover:-translate-y-1 hover:shadow-orange-500/10 group">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0f172a] to-blue-950"></div>
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.15),transparent_70%)]"></div>

              <div className="relative z-10 p-6 flex flex-col items-center h-full">
                <div className="w-full flex justify-between items-start mb-6">
                  <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full border border-white/10 backdrop-blur-sm">
                    <span className="text-lg">🏛️</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">
                      Govt of India
                    </span>
                    <span className="text-[10px] font-mono border border-white/20 px-2 py-0.5 rounded bg-white/5 text-white backdrop-blur-md mt-1">
                      CITIZEN ID
                    </span>
                  </div>
                </div>

                {/* Profile Image Area */}
                <div className="relative mb-4 group-hover:scale-105 transition-transform duration-300">
                  <div className="w-32 h-32 rounded-2xl border-[3px] border-orange-500/30 p-1 bg-slate-800/50 backdrop-blur-sm">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-xl bg-slate-800"
                      />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-slate-800 flex items-center justify-center">
                        <UserIcon className="w-12 h-12 text-slate-500" />
                      </div>
                    )}
                  </div>
                  {/* Verified Badge */}
                  <div className="absolute -bottom-3 -right-3 bg-green-500 text-white p-1.5 rounded-full border-[4px] border-slate-900 shadow-lg">
                    <Fingerprint size={16} />
                  </div>
                </div>

                {/* User Details */}
                <h2 className="text-2xl font-bold text-white font-serif tracking-wide text-center">
                  {user.name}
                </h2>
                <p className="text-sm text-blue-200/80 font-mono mb-4">
                  {user.email}
                </p>

                <div
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white ${rank.color} shadow-lg ring-1 ring-white/20`}
                >
                  <span>{rank.icon}</span> {rank.title}
                </div>

                {/* Footer Info */}
                <div className="w-full mt-8 pt-6 border-t border-white/10 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Joined</span>
                    <span className="font-mono text-white bg-white/5 px-2 py-1 rounded">
                      {user.joinDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Hash</span>
                    <span className="font-mono text-[10px] text-orange-400 bg-orange-400/10 px-2 py-1 rounded tracking-tight">
                      {user.idHash}
                    </span>
                  </div>

                  <button className="w-full py-3 mt-2 flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-blue-50 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-white/5">
                    <Download size={16} /> Save Identity Card
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: DASHBOARD ================= */}
          <div className="flex-1 space-y-6 w-full">
            {/* 1. Impact Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-2">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <TrendingUp size={20} />
                  </div>
                  Impact Dashboard
                </h3>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  Last sync: 2 mins ago
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Audits Filed
                  </p>
                  <p className="text-3xl font-extrabold text-slate-900">
                    {stats.totalReports}
                  </p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-green-200 transition-colors">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Funds Tracked
                  </p>
                  <p className="text-3xl font-extrabold text-green-600">
                    ₹{(stats.fundsAtRisk / 10000000).toFixed(2)}Cr
                  </p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-orange-200 transition-colors">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                    High Risk
                  </p>
                  <p className="text-3xl font-extrabold text-orange-600">
                    {stats.highRiskCount}
                  </p>
                </div>
              </div>

              {/* Level Progress */}
              <div className="mt-8">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Progress to Senior Auditor
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {nextLevelReports} more reports needed
                    </p>
                  </div>
                  <p className="text-sm font-bold text-blue-600">
                    {Math.round(progressPercentage)}%
                  </p>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 2. Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Notifications */}
              <button className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all text-left group flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors duration-300">
                  <Bell
                    size={24}
                    className="text-blue-600 group-hover:text-white"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    Notifications
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">
                    3 unread updates on your reports
                  </p>
                </div>
              </button>

              {/* Privacy */}
              <button className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-orange-300 transition-all text-left group flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-orange-500 transition-colors duration-300">
                  <Shield
                    size={24}
                    className="text-orange-600 group-hover:text-white"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-orange-700 transition-colors">
                    Privacy
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Anonymity:{" "}
                    <span className="text-green-600 font-bold">Active</span>
                  </p>
                </div>
              </button>

              {/* Achievements */}
              <button className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-purple-300 transition-all text-left group flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-purple-600 transition-colors duration-300">
                  <Award
                    size={24}
                    className="text-purple-600 group-hover:text-white"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                    Achievements
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">4 Badges earned</p>
                </div>
              </button>

              {/* Invite */}
              <button className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-teal-300 transition-all text-left group flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-teal-600 transition-colors duration-300">
                  <Share2
                    size={24}
                    className="text-teal-600 group-hover:text-white"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    Referral
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Invite other citizens
                  </p>
                </div>
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={async () => {
                setIsLoggingOut(true);
                try {
                  await signOut();
                  router.push("/");
                } catch (error) {
                  console.error("Sign out error:", error);
                  setIsLoggingOut(false);
                }
              }}
              disabled={isLoggingOut}
              className="w-full py-4 rounded-xl cursor-pointer border-2 border-red-100 bg-red-50 text-red-600 font-bold hover:bg-red-100 hover:border-red-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut size={20} />
              {isLoggingOut ? "Signing Out..." : "Sign Out Securely"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center border-t border-slate-200 pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-xs text-slate-600 shadow-sm cursor-pointer hover:border-blue-400 hover:text-blue-600 transition-colors">
            <HelpCircle size={14} /> Need help? Contact Grievance Officer
          </div>
          <p className="text-[11px] text-slate-400 mt-4 font-mono uppercase tracking-wide">
            Civic.ai • Version 2.4.0 • Secured by GovChain
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  FileText
} from "lucide-react";

// Updated Mock Data: Added clear 'title', specific 'description', and highly relevant infrastructure images
const MOCK_AUDITS = [
  {
    id: "AUD-2024-089",
    category: "Roadways",
    title: "Andheri East Road Expansion Phase 2",
    description: "Budget allocated for 5km road, but on-ground visual evidence shows only 2km completed. Missing work detected.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1pLF2bhoom6Ei9_JoXvGjOHzqogcQtiQBlg&s", // Asphalt/Road damage
    location: "Andheri East, Mumbai",
    risk: "High Risk",
    aiScore: 98,
    time: "10 mins ago",
  },
  {
    id: "AUD-2024-090",
    category: "Sanitation",
    title: "Dadar Main Drainage Desilting",
    description: "Sanitation pipeline repair matches official records. Before/after citizen images verify work completion.",
    image: "https://images.unsplash.com/photo-1727703435736-d3b5f2cc113c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Pipes/Drainage
    location: "Dadar, Mumbai",
    risk: "Verified",
    aiScore: 95,
    time: "45 mins ago",
  },
  {
    id: "AUD-2024-091",
    category: "Public Works",
    title: "Pune Central Park Boundary Construction",
    description: "Minor material quality mismatch detected. Standard grade cement used instead of specified high-grade mixture.",
    image: "https://files.propertywala.com/maps/202005/J811901034.jpg", // Brick/Construction
    location: "Pune Central",
    risk: "Medium Risk",
    aiScore: 82,
    time: "2 hours ago",
  },
  {
    id: "AUD-2024-092",
    category: "Infrastructure",
    title: "Thane West Flyover Structural Maintenance",
    description: "Overbilling suspected. Maintenance funds claimed, but no fresh structural work or paint is visible in recent uploads.",
    image: "https://urbanacres.in/wp-content/uploads/2026/02/FLYOVER-MMRDA-1068x580.webp", // Bridge infrastructure
    location: "Thane West",
    risk: "High Risk",
    aiScore: 94,
    time: "5 hours ago",
  },
  {
    id: "AUD-2024-093",
    category: "Electrical",
    title: "Navi Mumbai Highway Illumination",
    description: "Streetlight installation project fully verified. All 50 poles are functional and geocoded exactly as per contractor's claim.",
    image: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Atal_Setu_-_Trans_Harbour_Link_Mumbai.jpg", // Streetlights
    location: "Navi Mumbai",
    risk: "Verified",
    aiScore: 99,
    time: "1 day ago",
  }
];

// Reusable Minimal Stat Card
const StatCard = ({ label, value, trend, trendUp }: any) => (
  <div
    className="p-5 rounded-2xl border bg-white shadow-sm flex flex-col justify-between"
    style={{ borderColor: '#b0d8db' }}
  >
    <div className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: '#57737a' }}>{label}</div>
    <div className="flex items-end justify-between">
      <div className="text-3xl font-black" style={{ color: '#040f0f' }}>{value}</div>
      {trend && (
        <div className={`text-xs font-bold px-2 py-1 rounded-md ${trendUp ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {trend}
        </div>
      )}
    </div>
  </div>
);

export default function AuditDataPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "High Risk", "Medium Risk", "Verified"];

  const filteredAudits = MOCK_AUDITS.filter(audit =>
    activeFilter === "All" ? true : audit.risk === activeFilter
  );

  return (
    <div
      className="min-h-screen py-24 px-4 font-sans relative"
      style={{ backgroundColor: '#f4feff' }}
    >
      <div className="max-w-5xl mx-auto relative z-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <Badge
              variant="outline"
              className="px-3 py-1 shadow-sm border mb-4 rounded-full flex items-center w-max gap-2"
              style={{ backgroundColor: '#ffffff', borderColor: '#b0d8db', color: '#57737a' }}
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Agentic Engine Active
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: '#040f0f' }}>
              OPENLY AVAILABLE DATA
            </h1>
            <p className="mt-3 text-lg" style={{ color: '#57737a' }}>
              Real-time infrastructure reports verified and flagged by AI.
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total Scans" value="1,284" />
          <StatCard label="High Risk" value="142" trend="+3 today" trendUp={true} />
          <StatCard label="Medium Risk" value="89" />
          <StatCard label="Compliant" value="89%" trend="Stable" trendUp={false} />
        </div>

        {/* Search & Filter Bar */}
        <div
          className="p-4 rounded-2xl border bg-white mb-6 flex flex-col sm:flex-row gap-4 shadow-sm sticky top-20 z-20"
          style={{ borderColor: '#b0d8db' }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: '#57737a' }} />
            <input
              type="text"
              placeholder="Search by ID, location, or project title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none transition-colors"
              style={{
                backgroundColor: '#f4feff',
                borderColor: '#b0d8db',
                color: '#040f0f'
              }}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            <div className="p-2 border rounded-lg mr-2" style={{ borderColor: '#b0d8db', color: '#57737a' }}>
              <Filter size={18} />
            </div>
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all border"
                style={{
                  backgroundColor: activeFilter === filter ? '#e0f7f9' : '#ffffff',
                  borderColor: activeFilter === filter ? '#57737a' : '#b0d8db',
                  color: activeFilter === filter ? '#040f0f' : '#57737a'
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Feed List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredAudits.map((audit, idx) => {
              const isHighRisk = audit.risk === "High Risk";
              const isVerified = audit.risk === "Verified";

              const RiskIcon = isHighRisk ? ShieldAlert : isVerified ? ShieldCheck : AlertTriangle;
              const riskColors = isHighRisk
                ? "bg-red-50 text-red-700 border-red-200"
                : isVerified
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-yellow-50 text-yellow-700 border-yellow-200";

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  key={audit.id}
                  className="group p-5 rounded-2xl border bg-white hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row gap-6"
                  style={{ borderColor: '#b0d8db' }}
                >
                  {/* Left: Image & Category */}
                  <div className="w-full sm:w-56 shrink-0 flex flex-col gap-3">
                    <div className="h-36 w-full rounded-xl overflow-hidden border relative" style={{ borderColor: '#e0f7f9' }}>
                      <img src={audit.image} alt={audit.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[10px] font-bold text-white uppercase tracking-wider">
                        {audit.category}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Title & Details */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-600 flex items-center gap-1">
                        <FileText size={12} /> {audit.id}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${riskColors}`}>
                        <RiskIcon size={14} />
                        {audit.risk}
                      </span>
                      <span className="text-xs flex items-center gap-1 ml-auto sm:ml-0" style={{ color: '#57737a' }}>
                        <Clock size={12} /> {audit.time}
                      </span>
                    </div>

                    {/* Project Title */}
                    <h2 className="text-xl font-bold leading-tight mb-2" style={{ color: '#040f0f' }}>
                      {audit.title}
                    </h2>

                    {/* AI Finding / Description */}
                    <p className="text-sm leading-relaxed mb-4" style={{ color: '#57737a' }}>
                      <span className="font-semibold text-slate-700">AI Verdict: </span>
                      {audit.description}
                    </p>

                    <div className="flex items-center gap-2 mt-auto">
                      <MapPin size={16} style={{ color: '#57737a' }} />
                      <span className="text-sm font-medium" style={{ color: '#040f0f' }}>{audit.location}</span>
                    </div>
                  </div>

                  {/* Right: AI Score & Action */}
                  <div
                    className="w-full sm:w-32 sm:border-l pl-0 sm:pl-6 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-4 sm:pt-0 mt-4 sm:mt-0"
                    style={{ borderColor: '#e0f7f9' }}
                  >
                    <div className="text-left sm:text-right">
                      <div className="text-xs uppercase font-bold tracking-wider mb-1" style={{ color: '#57737a' }}>Confidence</div>
                      <div className="text-3xl font-black" style={{ color: '#040f0f' }}>{audit.aiScore}%</div>
                    </div>

                    <button
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-colors mt-0 sm:mt-4 group-hover:bg-[#e0f7f9]"
                      style={{ color: '#57737a' }}
                    >
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredAudits.length === 0 && (
            <div className="text-center py-20">
              <CheckCircle2 size={48} className="mx-auto mb-4 opacity-20" style={{ color: '#57737a' }} />
              <p className="text-lg font-medium" style={{ color: '#57737a' }}>No {activeFilter} reports found.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
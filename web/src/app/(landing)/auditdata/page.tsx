"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, MapPin, Calendar, CheckCircle2, AlertCircle, ChevronRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MOCK_AUDITS = [
  {
    id: "AUD-2024-881",
    location: "Dadar West Flyover, Mumbai",
    type: "Structural Crack",
    date: "Jan 14, 2024",
    status: "Verified",
    severity: "High",
    aiScore: 98,
  },
  {
    id: "AUD-2024-882",
    location: "Sector 42 Road, Gurugram",
    type: "Pothole / Road Damage",
    date: "Jan 12, 2024",
    status: "Pending",
    severity: "Medium",
    aiScore: 85,
  },
  {
    id: "AUD-2024-883",
    location: "Koramangala Drainage, Bangalore",
    type: "Water Leakage",
    date: "Jan 10, 2024",
    status: "Action Taken",
    severity: "Critical",
    aiScore: 99,
  }
];

export default function AuditDataPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900">Live Audit Feed</h1>
            <p className="text-slate-500 mt-2">Real-time infrastructure reports verified by AI & Blockchain.</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-white px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              System Live
            </Badge>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID, Location, or Type..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
            <Filter size={18} /> Filters
          </button>
        </div>

        {/* Audit List */}
        <div className="space-y-4">
          {MOCK_AUDITS.map((audit, i) => (
            <motion.div 
              key={audit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                
                {/* Left: Info */}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                    audit.severity === "High" || audit.severity === "Critical" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                  }`}>
                    {audit.severity === "High" || audit.severity === "Critical" ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-slate-400">{audit.id}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        audit.status === "Verified" ? "bg-green-50 text-green-700 border-green-200" :
                        audit.status === "Action Taken" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {audit.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900">{audit.type}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><MapPin size={14}/> {audit.location}</span>
                      <span className="flex items-center gap-1"><Calendar size={14}/> {audit.date}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Metrics & Action */}
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                  <div className="text-right">
                    <div className="text-xs text-slate-400 uppercase tracking-wider">AI Confidence</div>
                    <div className="font-mono font-bold text-slate-900">{audit.aiScore}%</div>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>

              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};
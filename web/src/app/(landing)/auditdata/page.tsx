"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { AuditColumn, AuditItem } from "@/components/ui/audit-column";

// Mock data with realistic infrastructure images for the Marquee
const MOCK_AUDITS: AuditItem[] = [
  {
    description: "Budget allocated for 5km road, but on-ground visual evidence shows only 2km completed. Major discrepancy detected.",
    image: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=150",
    location: "Andheri East, Mumbai",
    risk: "High Risk",
    date: "2 hours ago",
  },
  {
    description: "Sanitation pipeline repair matches official records. Work completed within allocated budget and timeframe.",
    image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=150",
    location: "Dadar, Mumbai",
    risk: "Verified",
    date: "5 hours ago",
  },
  {
    description: "Pothole repairs billed last month, but deep craters are still visible in the latest citizen-uploaded photos.",
    image: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=150",
    location: "Koramangala, BLR",
    risk: "High Risk",
    date: "1 day ago",
  },
  {
    description: "Minor material quality mismatch detected in the public park boundary wall construction.",
    image: "https://images.unsplash.com/photo-1541888087425-ce81df8da299?auto=format&fit=crop&q=80&w=150",
    location: "Pune Central",
    risk: "Medium Risk",
    date: "1 day ago",
  },
  {
    description: "Streetlight installation project fully verified. All 50 poles are functional as per the contractor's claim.",
    image: "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&q=80&w=150",
    location: "Navi Mumbai",
    risk: "Verified",
    date: "2 days ago",
  },
  {
    description: "Overbilling suspected. Bridge maintenance funds claimed, but no fresh paint or structural work is visible.",
    image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&q=80&w=150",
    location: "Thane West",
    risk: "High Risk",
    date: "3 days ago",
  },
  {
    description: "New bus shelter construction is delayed by 3 months, though 80% funds have been released.",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=150",
    location: "Bandra, Mumbai",
    risk: "Medium Risk",
    date: "4 days ago",
  },
  {
    description: "Drainage desilting confirmed. Before and after images submitted by citizens match the completion report.",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=150",
    location: "Borivali, Mumbai",
    risk: "Verified",
    date: "1 week ago",
  },
  {
    description: "Contractor claimed to use high-grade asphalt, but surface is already cracking after one monsoon shower.",
    image: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=150",
    location: "Malad, Mumbai",
    risk: "High Risk",
    date: "1 week ago",
  },
];

// Split data for the 3 marquee columns
const firstColumn = MOCK_AUDITS.slice(0, 3);
const secondColumn = MOCK_AUDITS.slice(3, 6);
const thirdColumn = MOCK_AUDITS.slice(6, 9);

export default function AuditDataPage() {
  return (
    <div
      className="min-h-screen py-20 px-4 font-sans relative overflow-hidden"
      style={{ backgroundColor: '#f4feff' }}
    >
      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4"
        >
          <div>
            <h1
              className="text-4xl font-bold tracking-tight"
              style={{ color: '#040f0f' }}
            >
              Live Audit Feed
            </h1>
            <p className="mt-2 text-lg" style={{ color: '#57737a' }}>
              Real-time infrastructure reports continuously verified by Agentic AI.
            </p>
          </div>

          <div className="flex gap-2">
            <Badge
              variant="outline"
              className="px-4 py-1.5 shadow-sm border"
              style={{
                backgroundColor: '#ffffff',
                borderColor: '#b0d8db',
                color: '#57737a'
              }}
            >
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              System Live
            </Badge>
          </div>
        </motion.div>

        {/* Animated Marquee Section */}
        <div
          className="flex justify-center gap-6 mt-10 max-h-[750px] overflow-hidden"
          style={{
            // This creates the smooth fade effect at the top and bottom of the scrolling columns
            maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)"
          }}
        >
          <AuditColumn audits={firstColumn} duration={15} />
          {/* Hide middle column on small screens, show on medium+ */}
          <AuditColumn audits={secondColumn} className="hidden md:block" duration={19} />
          {/* Hide last column on medium screens, show on large+ */}
          <AuditColumn audits={thirdColumn} className="hidden lg:block" duration={17} />
        </div>

      </div>
    </div>
  );
}
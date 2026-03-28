"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scan,
  Map as MapIcon,
  ShieldAlert,
  FileText,
  ChevronRight,
  Activity
} from "lucide-react";

// Feature Data
const features = [
  {
    id: 0,
    title: "AI Anomaly Detection",
    description: "Our Computer Vision models automatically flag structural cracks, potholes, and material inconsistencies from user uploads.",
    icon: Scan,
    activeColor: "#c2fcf7",
    visual: (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#040f0f' }}>
        {/* Grid Background */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(133,189,191,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(133,189,191,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>

        {/* Scanning Box */}
        <div className="relative w-48 h-48 rounded-lg flex items-center justify-center z-10" style={{ border: '2px solid #85bdbf' }}>
          <div className="absolute top-0 left-0 w-6 h-6 -mt-1 -ml-1" style={{ borderTop: '4px solid #c2fcf7', borderLeft: '4px solid #c2fcf7' }}></div>
          <div className="absolute top-0 right-0 w-6 h-6 -mt-1 -mr-1" style={{ borderTop: '4px solid #c2fcf7', borderRight: '4px solid #c2fcf7' }}></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 -mb-1 -ml-1" style={{ borderBottom: '4px solid #c2fcf7', borderLeft: '4px solid #c2fcf7' }}></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 -mb-1 -mr-1" style={{ borderBottom: '4px solid #c2fcf7', borderRight: '4px solid #c2fcf7' }}></div>

          <motion.div
            animate={{ height: ["0%", "100%", "0%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 w-full"
            style={{
              backgroundColor: 'rgba(133, 189, 191, 0.2)',
              borderBottom: '1px solid #85bdbf',
              filter: 'drop-shadow(0 0 10px rgba(133,189,191,0.8))',
            }}
          />
          <span className="font-mono text-xs" style={{ color: '#c2fcf7' }}>ANALYZING...</span>
        </div>

        {/* Floating Data Tags */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute right-4 top-10 p-2 rounded text-[10px] font-mono"
          style={{
            backgroundColor: '#0a1a1a',
            border: '1px solid rgba(185, 28, 28, 0.5)',
            color: '#f87171',
          }}
        >
          ⚠ CRACK DETECTED (98%)
        </motion.div>
      </div>
    )
  },
  {
    id: 1,
    title: "Geospatial Mapping",
    description: "Every audit is pinned to a live map. We overlay tender coordinates to ensure construction is happening exactly where promised.",
    icon: MapIcon,
    activeColor: "#85bdbf",
    visual: (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'rgba(4, 15, 15, 0.95)' }}>
        {/* Radar Circles */}
        {[100, 200, 300].map((size, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.3 }}
            transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
            className="absolute rounded-full"
            style={{ width: size, height: size, border: '1px solid #85bdbf' }}
          />
        ))}
        {/* Center Point */}
        <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: '#c2fcf7', boxShadow: '0 0 20px #85bdbf' }}></div>
        {/* Rotating Radar Line */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute w-[300px] h-[300px] rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0 340deg, rgba(133,189,191,0.2) 360deg)',
          }}
        />
        {/* Map Pins */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full" style={{ backgroundColor: '#c2fcf7' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full" style={{ backgroundColor: '#c2fcf7' }}></div>
      </div>
    )
  },
  {
    id: 2,
    title: "Smart Contract Logic",
    description: "Automated fund release. If the AI audit passes (>90%), the next tranche of funds is released via blockchain smart contract.",
    icon: FileText,
    activeColor: "#57737a",
    visual: (
      <div className="relative w-full h-full p-6 font-mono text-xs overflow-hidden flex flex-col justify-center" style={{ backgroundColor: '#040f0f' }}>
        <div className="space-y-2 opacity-80">
          <div style={{ color: '#57737a' }}>{"// Executing Smart Contract..."}</div>
          <div className="flex gap-2">
            <span style={{ color: '#c2fcf7' }}>if</span>
            <span style={{ color: '#85bdbf' }}>(auditScore {">"} 90)</span>
            <span style={{ color: '#c9fbff' }}>{"{"}</span>
          </div>
          <div className="pl-4 flex gap-2">
            <span style={{ color: '#85bdbf' }}>releaseFunds</span>
            <span style={{ color: '#ffffff' }}>{`({amount: "₹50L"});`}</span>
          </div>
          <div className="pl-4 flex gap-2">
            <span style={{ color: '#85bdbf' }}>updateLedger</span>
            <span style={{ color: '#c2fcf7' }}>("SUCCESS");</span>
          </div>
          <div style={{ color: '#c9fbff' }}>{"}"}</div>
          <div className="flex gap-2">
            <span style={{ color: '#c2fcf7' }}>else</span>
            <span style={{ color: '#c9fbff' }}>{"{"}</span>
          </div>
          <div className="pl-4 flex gap-2">
            <span style={{ color: '#f87171' }}>flagViolation();</span>
          </div>
          <div style={{ color: '#c9fbff' }}>{"}"}</div>
        </div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
          className="h-1 mt-4"
          style={{ backgroundColor: '#85bdbf', boxShadow: '0 0 10px #85bdbf' }}
        />
        <div className="mt-1 text-[10px]" style={{ color: '#85bdbf' }}>VERIFYING HASH...</div>
      </div>
    )
  },
];

const FeaturesCommandCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 text-white relative overflow-hidden" style={{ backgroundColor: '#040f0f' }}>

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full" style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(10, 26, 26, 1), rgba(4, 15, 15, 1))'
      }}></div>

      <div className="container mx-auto px-4 relative z-10">

        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-sm text-xs font-mono mb-4"
            style={{
              border: '1px solid rgba(133, 189, 191, 0.3)',
              backgroundColor: 'rgba(4, 15, 15, 0.5)',
              color: '#85bdbf',
            }}
          >
            <Activity size={12} className="animate-pulse" style={{ color: '#c2fcf7' }} /> SYSTEM ONLINE
          </div>
          <h2
            className="text-3xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            The Civic{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(to right, #c2fcf7, #85bdbf)',
                WebkitBackgroundClip: 'text',
              }}
            >
              Engine
            </span>
          </h2>
          <p style={{ color: '#85bdbf' }} className="max-w-2xl mx-auto">
            Switch between the modules below to see how our system processes infrastructure data in real-time.
          </p>
        </div>

        {/* The Interface */}
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">

          {/* Left Column: Navigation */}
          <div className="flex flex-col gap-4 w-full lg:w-1/3">
            {features.map((feature, index) => {
              const isActive = activeTab === index;
              const Icon = feature.icon;
              return (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className="relative p-6 text-left rounded-xl border transition-all duration-300 group overflow-hidden"
                  style={{
                    backgroundColor: isActive ? 'rgba(10, 26, 26, 1)' : 'rgba(10, 26, 26, 0.3)',
                    borderColor: isActive ? 'rgba(133, 189, 191, 0.5)' : 'rgba(133, 189, 191, 0.15)',
                    boxShadow: isActive ? '0 0 30px rgba(133, 189, 191, 0.1)' : 'none',
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeGlow"
                      className="absolute inset-0 -z-10"
                      style={{ backgroundColor: 'rgba(133, 189, 191, 0.05)' }}
                    />
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{
                          backgroundColor: '#040f0f',
                          color: isActive ? feature.activeColor : '#57737a',
                        }}
                      >
                        <Icon size={20} />
                      </div>
                      <h3
                        className="font-semibold"
                        style={{ color: isActive ? '#ffffff' : '#85bdbf' }}
                      >
                        {feature.title}
                      </h3>
                    </div>
                    {isActive && <ChevronRight className="animate-pulse" size={16} style={{ color: '#c2fcf7' }} />}
                  </div>

                  <p
                    className="text-sm leading-relaxed transition-colors"
                    style={{ color: isActive ? '#b0d8db' : '#57737a' }}
                  >
                    {feature.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Column: The "Monitor" */}
          <div className="w-full lg:w-2/3">
            <div
              className="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl"
              style={{
                backgroundColor: '#040f0f',
                border: '1px solid rgba(133, 189, 191, 0.2)',
              }}
            >
              {/* Monitor Frame UI */}
              <div
                className="absolute top-0 w-full h-8 flex items-center px-4 justify-between z-20"
                style={{
                  backgroundColor: '#0a1a1a',
                  borderBottom: '1px solid rgba(133, 189, 191, 0.15)',
                }}
              >
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#57737a' }}></div>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#57737a' }}></div>
                </div>
                <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#85bdbf' }}>
                  Live Terminal Preview
                </div>
              </div>

              {/* Content Switching Area */}
              <div className="w-full h-full pt-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full"
                  >
                    {features[activeTab].visual}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Overlay Scanlines */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(133,189,191,0.04),rgba(194,252,247,0.02),rgba(87,115,122,0.04))] bg-[size:100%_2px,3px_100%] z-30 opacity-20"></div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export const FeaturesSection: React.FC = () => {
  return <FeaturesCommandCenter />;
}
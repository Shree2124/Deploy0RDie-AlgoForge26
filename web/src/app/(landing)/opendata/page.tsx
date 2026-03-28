"use client";
import React from "react";
import { motion } from "framer-motion";
import { Download, Database, BarChart3, Globe, Shield, ExternalLink } from "lucide-react";

export default function OpenDataPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white py-20 px-4 font-sans relative overflow-hidden">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-10 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Radical Transparency
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            We believe public infrastructure data belongs to the public. 
            Access raw datasets, visualized metrics, and real-time ledger updates.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {[
            { label: "Total Reports", val: "12,403", color: "text-blue-400" },
            { label: "Verified Issues", val: "9,882", color: "text-emerald-400" },
            { label: "Est. Funds Saved", val: "₹42 Cr", color: "text-yellow-400" },
            { label: "Open API Hits", val: "1.2M", color: "text-purple-400" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm text-center"
            >
              <div className={`text-3xl font-bold mb-1 ${stat.color}`}>{stat.val}</div>
              <div className="text-sm text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Visualization Area */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Chart Card */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BarChart3 className="text-blue-500" /> Monthly Reporting Trend
              </h3>
              <select className="bg-slate-800 border-none text-xs rounded px-2 py-1 text-slate-400">
                <option>Last 6 Months</option>
              </select>
            </div>
            {/* CSS-only Bar Chart Mockup */}
            <div className="h-64 flex items-end justify-between gap-2">
              {[40, 65, 45, 80, 55, 90, 70, 85].map((h, i) => (
                <div key={i} className="w-full bg-slate-800 rounded-t-md relative group">
                  <motion.div 
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="absolute bottom-0 w-full bg-blue-600/80 hover:bg-blue-500 rounded-t-md transition-colors"
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs bg-black px-2 py-1 rounded">
                    {h * 10}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-slate-500 uppercase">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
            </div>
          </div>

          {/* Download Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                <Database className="text-purple-500" /> Export Data
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Download the full anonymized dataset of infrastructure reports. Updated daily at 00:00 UTC.
              </p>
              <div className="space-y-3">
                <button className="w-full flex justify-between items-center p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors group">
                  <span className="flex items-center gap-2"><Globe size={16}/> CSV Format</span>
                  <Download size={16} className="text-slate-500 group-hover:text-white"/>
                </button>
                <button className="w-full flex justify-between items-center p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors group">
                  <span className="flex items-center gap-2"><Database size={16}/> JSON API</span>
                  <ExternalLink size={16} className="text-slate-500 group-hover:text-white"/>
                </button>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-800">
               <div className="flex items-center gap-2 text-xs text-emerald-500">
                 <Shield size={12} /> Data is cryptographically signed
               </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
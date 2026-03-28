"use client";
import React from "react";
import { motion } from "framer-motion";
import { Target, Users, Lightbulb, HeartHandshake, Badge } from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="bg-white font-sans text-slate-900">

      {/* Hero Section */}
      <section className="py-24 px-4 bg-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-4 py-1.5 text-sm">
            Our Mission
          </Badge>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-8 leading-tight">
            Building a nation where every <br />
            <span className="text-blue-600">pixel of data</span> builds trust.
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
            Civic.ai isn't just an app. It's a digital vigilance movement empowering 1.4 billion citizens to become the guardians of their own infrastructure.
          </p>
        </div>
      </section>

      {/* The 'Why' Grid */}
      <section className="py-24 px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl font-serif font-bold">From Apathy to Action</h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              For decades, infrastructure monitoring was a "black box"—opaque, manual, and prone to leakage. We realized that the solution wasn't more inspectors, but more eyes.
            </p>
            <p className="text-slate-600 text-lg leading-relaxed">
              By combining <strong>Computer Vision</strong> with <strong>Blockchain</strong>, we've created a system where truth is mathematical, not political.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Abstract Team/Concept Grid */}
            <div className="bg-slate-100 h-48 rounded-2xl rounded-tr-[4rem] p-6 flex flex-col justify-end">
              <Target className="w-8 h-8 text-blue-600 mb-2" />
              <span className="font-bold">Precision</span>
            </div>
            <div className="bg-slate-900 text-white h-48 rounded-2xl rounded-tl-[4rem] p-6 flex flex-col justify-end mt-8">
              <Users className="w-8 h-8 text-blue-400 mb-2" />
              <span className="font-bold">Community</span>
            </div>
            <div className="bg-blue-600 text-white h-48 rounded-2xl rounded-br-[4rem] p-6 flex flex-col justify-end">
              <Lightbulb className="w-8 h-8 text-white mb-2" />
              <span className="font-bold">Innovation</span>
            </div>
            <div className="bg-slate-100 h-48 rounded-2xl rounded-bl-[4rem] p-6 flex flex-col justify-end mt-8">
              <HeartHandshake className="w-8 h-8 text-slate-900 mb-2" />
              <span className="font-bold">Trust</span>
            </div>
          </div>
        </div>
      </section>

      {/* Values Strip */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-xl font-bold mb-3">Citizen First</h3>
            <p className="text-slate-400">Technology should serve the people, not the other way around. We design for accessibility first.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-3">Absolute Neutrality</h3>
            <p className="text-slate-400">Our code doesn't take sides. It reports the data exactly as it finds it, without bias.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-3">Open by Default</h3>
            <p className="text-slate-400">Secrecy breeds corruption. We open-source our reporting data to ensure total accountability.</p>
          </div>
        </div>
      </section>

    </div>
  );
};
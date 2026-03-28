"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, CheckCircle2, ShieldCheck, ExternalLink } from "lucide-react";

interface CTASectionProps {
  onGetStarted: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onGetStarted }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [10, 0]);

  return (
    <section
      ref={containerRef}
      className="relative py-24 overflow-hidden text-white perspective-[1000px]"
      style={{ backgroundColor: '#040f0f' }}
    >
      {/* Background Elements */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415-.828-.828-.828.828-1.415-1.415.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM22.485 0l.83.828-1.415 1.415-.828-.828-.828.828-1.415-1.415.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM0 22.485l.828.83-1.415 1.415-.828-.828-.828.828L-3.657 22.485l.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM0 54.627l.828.83-1.415 1.415-.828-.828-.828.828L-3.657 54.627l.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM54.627 60l.83-.828-1.415-1.415-.828.828-.828-.828-1.415 1.415.828.828-.828.828 1.415 1.415-.828-.828.828.828 1.415-1.415-.828-.828zM22.485 60l.83-.828-1.415-1.415-.828.828-.828-.828-1.415 1.415.828.828-.828.828 1.415 1.415-.828-.828.828.828 1.415-1.415-.828-.828zM0 22.485l.828.83-1.415 1.415-.828-.828-.828.828L-3.657 22.485l.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828zM0 54.627l.828.83-1.415 1.415-.828-.828-.828.828L-3.657 54.627l.828-.828-.828-.828 1.415-1.415.828.828.828-.828 1.415 1.415-.828.828z' fill='%2385bdbf' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Ambient Glow */}
      <div
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none"
        style={{ backgroundColor: 'rgba(133, 189, 191, 0.15)' }}
      ></div>
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none"
        style={{ backgroundColor: 'rgba(87, 115, 122, 0.1)' }}
      ></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">

          {/* Left Column: Copy & CTA */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6"
                style={{
                  backgroundColor: 'rgba(133, 189, 191, 0.1)',
                  border: '1px solid rgba(133, 189, 191, 0.3)',
                  color: '#c2fcf7',
                }}
              >
                <Globe size={12} />
                Browser-Based Access
              </div>
              <h2
                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Be the <span style={{ color: '#c2fcf7' }}>Eyes</span> of <br />
                the Nation.
              </h2>
              <p className="text-lg mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed" style={{ color: '#b0d8db' }}>
                Corruption thrives in the dark. Shine a light on infrastructure
                gaps using the Civic.ai web portal. No downloads required—just snap, upload, and verify instantly from any device.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  onClick={onGetStarted}
                  className="h-14 px-8 text-lg text-white transition-all hover:scale-105"
                  style={{
                    backgroundColor: '#57737a',
                    boxShadow: '0 0 20px rgba(87, 115, 122, 0.4)',
                  }}
                >
                  Access Portal
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <Button
                  variant="outline"
                  className="h-14 px-8 text-lg transition-all"
                  style={{
                    borderColor: 'rgba(133, 189, 191, 0.3)',
                    backgroundColor: 'transparent',
                    color: '#c9fbff',
                  }}
                >
                  View Public Audit Log
                  <ExternalLink className="ml-2 w-4 h-4" style={{ color: '#85bdbf' }} />
                </Button>
              </div>

              {/* Stats/Trust */}
              <div
                className="mt-12 flex items-center justify-center lg:justify-start gap-8 pt-8"
                style={{ borderTop: '1px solid rgba(133, 189, 191, 0.2)' }}
              >
                <div>
                  <div className="text-3xl font-bold text-white">12k+</div>
                  <div className="text-xs uppercase tracking-wider" style={{ color: '#85bdbf' }}>
                    Reports Filed
                  </div>
                </div>
                <div className="w-px h-10" style={{ backgroundColor: 'rgba(133, 189, 191, 0.2)' }}></div>
                <div>
                  <div className="text-3xl font-bold text-white">98%</div>
                  <div className="text-xs uppercase tracking-wider" style={{ color: '#85bdbf' }}>
                    Verification Rate
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Browser Mockup */}
          <div className="lg:w-1/2 w-full flex justify-center lg:justify-end relative">
            <motion.div
              style={{ y, rotateX }}
              className="relative z-10 w-full max-w-lg"
            >
              {/* Browser Window Container */}
              <div
                className="rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm"
                style={{
                  backgroundColor: 'rgba(10, 26, 26, 0.9)',
                  border: '1px solid rgba(133, 189, 191, 0.3)',
                }}
              >
                {/* Browser Toolbar */}
                <div
                  className="p-3 flex items-center gap-4"
                  style={{
                    backgroundColor: 'rgba(10, 26, 26, 0.8)',
                    borderBottom: '1px solid rgba(133, 189, 191, 0.2)',
                  }}
                >
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(185, 28, 28, 0.8)' }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(217, 119, 6, 0.8)' }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(133, 189, 191, 0.8)' }} />
                  </div>
                  <div
                    className="flex-1 rounded-md py-1 px-3 flex items-center justify-center text-[10px] font-mono"
                    style={{
                      backgroundColor: 'rgba(4, 15, 15, 0.5)',
                      color: '#85bdbf',
                    }}
                  >
                    <ShieldCheck size={10} className="mr-2" style={{ color: '#c2fcf7' }} />
                    https://civic.ai/portal/dashboard
                  </div>
                </div>

                {/* Dashboard UI Mockup */}
                <div className="p-6 relative min-h-[320px] flex flex-col" style={{ backgroundColor: '#040f0f' }}>
                  {/* Grid Background */}
                  <div
                    className="absolute inset-0 opacity-20 bg-[size:20px_20px]"
                    style={{
                      backgroundImage: 'linear-gradient(to right, rgba(133,189,191,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(133,189,191,0.15) 1px, transparent 1px)',
                    }}
                  ></div>

                  <div className="relative z-10 flex gap-4 mb-4">
                    {/* Sidebar Mock */}
                    <div className="w-1/4 space-y-2 hidden sm:block">
                      <div className="h-2 w-12 rounded mb-4" style={{ backgroundColor: 'rgba(133, 189, 191, 0.2)' }} />
                      <div
                        className="h-8 w-full rounded flex items-center px-2"
                        style={{
                          backgroundColor: 'rgba(87, 115, 122, 0.2)',
                          border: '1px solid rgba(87, 115, 122, 0.3)',
                        }}
                      >
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#c2fcf7' }} />
                      </div>
                      <div className="h-8 w-full rounded" style={{ backgroundColor: '#0a1a1a', border: '1px solid rgba(133, 189, 191, 0.1)' }} />
                      <div className="h-8 w-full rounded" style={{ backgroundColor: '#0a1a1a', border: '1px solid rgba(133, 189, 191, 0.1)' }} />
                    </div>

                    {/* Main Content Mock */}
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-center mb-6">
                        <div className="h-4 w-32 rounded" style={{ backgroundColor: 'rgba(133, 189, 191, 0.2)' }} />
                        <div
                          className="h-8 w-24 rounded text-[10px] flex items-center justify-center text-white font-bold"
                          style={{
                            backgroundColor: '#57737a',
                            boxShadow: '0 4px 14px rgba(87, 115, 122, 0.2)',
                          }}
                        >
                          + NEW REPORT
                        </div>
                      </div>

                      {/* Success Card Animation */}
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        whileInView={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-5 rounded-lg shadow-xl relative overflow-hidden"
                        style={{
                          backgroundColor: '#0a1a1a',
                          border: '1px solid rgba(133, 189, 191, 0.2)',
                        }}
                      >
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                          <CheckCircle2 size={64} />
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="mt-1 p-2 rounded-full" style={{ backgroundColor: 'rgba(194, 252, 247, 0.15)' }}>
                            <CheckCircle2 size={20} style={{ color: '#c2fcf7' }} />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white">Submission Verified</h4>
                            <p className="text-[10px] mt-1" style={{ color: '#85bdbf' }}>
                              Project ID: <span className="font-mono" style={{ color: '#c2fcf7' }}>#RD-2024-Mum-A7</span><br />
                              Timestamp: 10:42 AM IST
                            </p>
                            <div className="mt-3 flex gap-2">
                              <div className="px-2 py-0.5 rounded text-[9px]" style={{ backgroundColor: '#0a1a1a', color: '#b0d8db', border: '1px solid rgba(133, 189, 191, 0.2)' }}>Geo-Tagged</div>
                              <div className="px-2 py-0.5 rounded text-[9px]" style={{ backgroundColor: '#0a1a1a', color: '#b0d8db', border: '1px solid rgba(133, 189, 191, 0.2)' }}>Encrypted</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* List Items Mock */}
                      <div className="space-y-2 mt-4 opacity-50">
                        <div className="h-10 w-full rounded" style={{ backgroundColor: '#0a1a1a', border: '1px solid rgba(133, 189, 191, 0.1)' }} />
                        <div className="h-10 w-full rounded" style={{ backgroundColor: '#0a1a1a', border: '1px solid rgba(133, 189, 191, 0.1)' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Glow */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] blur-[60px] -z-10"
                style={{ backgroundColor: 'rgba(133, 189, 191, 0.15)' }}
              ></div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
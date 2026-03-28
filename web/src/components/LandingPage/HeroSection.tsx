"use client";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { GlobeInteractive } from "@/components/ui/cobe-globe-interactive";

export const HeroSection = () => {
  const router = useRouter();
  return (
    <section
      className="relative pt-16 pb-20 lg:pt-10 lg:pb-32 w-full overflow-hidden"
      style={{ backgroundColor: '#f0fdff' }}
    >
      {/* Background: Technical Grid Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(#040f0f 1px, transparent 1px), linear-gradient(to right, #040f0f 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* Background Gradient Spotlights */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"
        style={{ backgroundColor: 'rgba(194, 252, 247, 0.25)' }}
      ></div>
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"
        style={{ backgroundColor: 'rgba(133, 189, 191, 0.15)' }}
      ></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Content: Text & CTA */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="outline"
                className="mb-6 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase gap-2"
                style={{
                  borderColor: '#85bdbf',
                  backgroundColor: 'rgba(194, 252, 247, 0.4)',
                  color: '#040f0f',
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: '#85bdbf' }}
                  ></span>
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: '#57737a' }}
                  ></span>
                </span>
                Live in Mumbai & Pune
              </Badge>

              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.15] mb-6"
                style={{ fontFamily: 'var(--font-display)', color: '#040f0f' }}
              >
                Bridging the Gap Between <br className="hidden lg:block" />
                <span
                  className="text-transparent bg-clip-text"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #57737a, #040f0f)',
                    WebkitBackgroundClip: 'text',
                  }}
                >
                  Public Promises
                </span>
                {" & "}
                <span
                  className="text-transparent bg-clip-text"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #85bdbf, #57737a)',
                    WebkitBackgroundClip: 'text',
                  }}
                >
                  Ground Reality
                </span>
              </h1>

              <p className="text-lg mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0" style={{ color: '#57737a' }}>
                Civic.ai harnesses <strong style={{ color: '#040f0f' }}>AI Agents</strong> and{" "}
                <strong style={{ color: '#040f0f' }}>Geospatial Tech</strong> to empower citizens. Verify
                public spending, audit infrastructure quality, and ensure every
                Rupee counts.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  onClick={() => {
                    router.push("/reportissue");
                  }}
                  size="lg"
                  className="text-white shadow-lg h-12 px-8 text-base group"
                  style={{
                    backgroundColor: '#57737a',
                    boxShadow: '0 4px 14px rgba(87, 115, 122, 0.3)',
                  }}
                >
                  <MapPin className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                  Report an Issue
                </Button>
                <Button
                  onClick={() => {
                    router.push("/mapview");
                  }}
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 text-base transition-all"
                  style={{
                    borderColor: '#85bdbf',
                    color: '#57737a',
                  }}
                >
                  View Public Map
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Trust Indicators */}
              <div
                className="mt-10 pt-8 flex flex-col sm:flex-row items-center gap-4 text-sm font-medium"
                style={{ borderTop: '1px solid rgba(133, 189, 191, 0.4)', color: '#57737a' }}
              >
                <span>Trusted by civic bodies in:</span>
                <div className="flex gap-4 opacity-80">
                  <span className="font-bold" style={{ color: '#040f0f' }}>MUMBAI</span>
                  <span className="font-bold" style={{ color: '#040f0f' }}>DELHI</span>
                  <span className="font-bold" style={{ color: '#040f0f' }}>BANGALORE</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Content: Interactive Globe */}
          <div className="w-full lg:w-1/2 relative flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-xl"
            >
              <GlobeInteractive className="w-full" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div
        className="absolute bottom-0 w-full backdrop-blur-sm"
        style={{
          borderTop: '1px solid rgba(133, 189, 191, 0.3)',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
        }}
      >
        <div className="container mx-auto px-4 py-4 flex flex-wrap justify-around items-center gap-4 text-center">
          <div>
            <p className="text-2xl font-bold" style={{ color: '#040f0f' }}>₹1,240 Cr</p>
            <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: '#57737a' }}>
              Funds Audited
            </p>
          </div>
          <div className="hidden sm:block w-px h-8" style={{ backgroundColor: '#85bdbf' }}></div>
          <div>
            <p className="text-2xl font-bold" style={{ color: '#040f0f' }}>8,400+</p>
            <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: '#57737a' }}>
              Active Projects
            </p>
          </div>
          <div className="hidden sm:block w-px h-8" style={{ backgroundColor: '#85bdbf' }}></div>
          <div>
            <p className="text-2xl font-bold" style={{ color: '#040f0f' }}>120k</p>
            <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: '#57737a' }}>
              Citizen Reports
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

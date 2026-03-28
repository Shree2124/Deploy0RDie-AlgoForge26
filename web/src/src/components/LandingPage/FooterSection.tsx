"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabasePublic } from "@/lib/dbConnect";
import Link from "next/link";

export const FooterSection: React.FC = () => {
  const [totalAudits, setTotalAudits] = useState<number>(14020591);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    setLastUpdated(
      new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    );

    async function fetchStats() {
      const { count } = await supabasePublic
        .from("citizen_reports")
        .select("*", { count: "exact", head: true });

      if (count !== null) setTotalAudits(count + 14000);
    }
    fetchStats();
  }, []);

  return (
    <footer className="mt-auto relative overflow-hidden font-sans" style={{ backgroundColor: '#040f0f', color: '#b0d8db' }}>
      {/* Palette Gradient Strip */}
      <div className="flex h-1.5 w-full">
        <div className="w-1/5" style={{ backgroundColor: '#c9fbff' }}></div>
        <div className="w-1/5" style={{ backgroundColor: '#c2fcf7' }}></div>
        <div className="w-1/5" style={{ backgroundColor: '#85bdbf' }}></div>
        <div className="w-1/5" style={{ backgroundColor: '#57737a' }}></div>
        <div className="w-1/5" style={{ backgroundColor: '#040f0f' }}></div>
      </div>

      <div className="container mx-auto px-4 pt-16 pb-8 relative z-10">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          {/* Identity Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-4 group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <div className="relative w-14 h-14 sm:w-52 sm:h-16 flex items-center justify-center">
                    <img
                      src="/mainlogo.svg"
                      alt="logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </motion.div>
              </Link>
            </div>

            <p className="text-sm leading-relaxed max-w-sm" style={{ color: '#85bdbf' }}>
              An open-source initiative to foster transparency in public
              infrastructure through Citizen Audits and AI Verification.
              Ensuring every rupee builds the nation.
            </p>

            <div className="flex gap-4 pt-2">
              {[Twitter, Facebook, Linkedin, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: '#0a1a1a',
                    border: '1px solid rgba(133, 189, 191, 0.2)',
                    color: '#85bdbf',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#57737a';
                    (e.currentTarget as HTMLElement).style.borderColor = '#57737a';
                    (e.currentTarget as HTMLElement).style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#0a1a1a';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(133, 189, 191, 0.2)';
                    (e.currentTarget as HTMLElement).style.color = '#85bdbf';
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4
              className="font-bold mb-6 text-sm uppercase tracking-wider pl-3"
              style={{ color: '#ffffff', borderLeft: '2px solid #85bdbf' }}
            >
              Citizen Corner
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: "File an Audit", href: "/auditview" },
                { label: "Track Application", href: "/dashboard" },
                { label: "Public Dashboard", href: "/dashboard" },
                { label: "Download App", href: "/dashboard" },
                { label: "Whistleblower Policy", href: "/legal" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-2 transition-all duration-300"
                    style={{ color: '#85bdbf' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#c2fcf7')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#85bdbf')}
                  >
                    <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#57737a' }}></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal/Compliance */}
          <div className="lg:col-span-2">
            <h4
              className="font-bold mb-6 text-sm uppercase tracking-wider pl-3"
              style={{ color: '#ffffff', borderLeft: '2px solid #c9fbff' }}
            >
              Compliance
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                "RTI Act",
                "Terms of Use",
                "Privacy Policy",
                "Hyperlinking Policy",
                "Copyright Policy",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="/legal"
                    className="inline-flex items-center gap-2 transition-all duration-300"
                    style={{ color: '#85bdbf' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#c2fcf7')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#85bdbf')}
                  >
                    <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#57737a' }}></span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / Helpline */}
          <div
            className="lg:col-span-4 rounded-2xl p-6"
            style={{
              backgroundColor: 'rgba(10, 26, 26, 0.5)',
              border: '1px solid rgba(133, 189, 191, 0.15)',
            }}
          >
            <h4 className="font-bold mb-6 text-sm uppercase tracking-wider flex items-center gap-2" style={{ color: '#ffffff' }}>
              <Phone size={16} style={{ color: '#c2fcf7' }} /> Helpline
            </h4>

            <div className="mb-6">
              <p className="text-xs uppercase font-semibold mb-1" style={{ color: '#57737a' }}>
                Toll Free Number (24x7)
              </p>
              <h2
                className="text-3xl font-mono font-bold tracking-wider cursor-pointer transition-colors"
                style={{ color: '#ffffff' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#c2fcf7')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#ffffff')}
              >
                1800-11-2025
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="mt-1 shrink-0" size={16} style={{ color: '#57737a' }} />
                <p>
                  Room No. 404, A-Wing, Nirman Bhawan,
                  <br />
                  New Delhi - 110011
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="shrink-0" size={16} style={{ color: '#57737a' }} />
                <a
                  href="mailto:support@civic.ai"
                  className="transition-colors"
                  style={{ color: '#85bdbf' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#c2fcf7')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#85bdbf')}
                >
                  support@civic.ai
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Partner Logos */}
        <div className="pt-8 pb-8" style={{ borderTop: '1px solid rgba(133, 189, 191, 0.1)' }}>
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Digital India</div>
            <div className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              Azadi Ka Amrit Mahotsav
            </div>
            <div className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>G20 India</div>
            <div className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>NIC</div>
            <div className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>MyGov</div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div
        className="py-4 text-[11px]"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderTop: '1px solid rgba(133, 189, 191, 0.1)',
          color: '#57737a',
        }}
      >
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-center md:text-left">
            <span>Content owned by Ministry of Urban Development, GoI.</span>
            <span className="hidden md:inline">|</span>
            <span>
              Developed & Hosted by{" "}
              <span style={{ color: '#b0d8db' }}>
                National Informatics Centre
              </span>
            </span>
          </div>

          <div className="flex gap-6 items-center">
            <div className="text-right">
              <div className="uppercase tracking-wider text-[9px] mb-0.5">
                Last Updated
              </div>
              <div className="font-mono" style={{ color: '#b0d8db' }}>{lastUpdated}</div>
            </div>
            <div className="h-8 w-px" style={{ backgroundColor: 'rgba(133, 189, 191, 0.15)' }}></div>
            <div className="text-right">
              <div className="uppercase tracking-wider text-[9px] mb-0.5">
                Total Audits Filed
              </div>
              <div
                className="font-mono font-bold px-2 py-0.5 rounded"
                style={{
                  color: '#c2fcf7',
                  backgroundColor: '#0a1a1a',
                  border: '1px solid rgba(133, 189, 191, 0.2)',
                }}
              >
                {totalAudits.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

"use client";
import React, { useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
  Users,
  Shield,
  Eye,
  BarChart3,
  Globe,
  Code2,
  Brain,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FileText,
  Zap,
  Target,
  Lightbulb,
  Lock,
  Cpu,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TestimonialCard } from "@/components/ui/testimonial-cards";
import Link from "next/link";

/* ============================
   Team Data
   ============================ */
const teamMembers = [
  {
    id: 1,
    name: "Aayush Shinde",
    role: "Frontend / UI UX",
    testimonial:
      "Design isn't just what it looks like — it's how the citizen feels while using our platform. Every interaction should inspire confidence and clarity.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=face",
    icon: <Layers className="w-5 h-5" />,
    skills: ["React", "Figma", "Motion Design"],
  },
  {
    id: 2,
    name: "Shree Alasande",
    role: "Full Stack Developer",
    testimonial:
      "Building the bridge between citizen trust and government transparency — one API endpoint at a time. Scalability with purpose.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=face",
    icon: <Code2 className="w-5 h-5" />,
    skills: ["Next.js", "Supabase", "Node.js"],
  },
  {
    id: 3,
    name: "Ritika Darade",
    role: "AI/ML Engineer",
    testimonial:
      "When an AI can verify a pothole in 0.3 seconds, corruption doesn't stand a chance. We're training models to see what bureaucracy hides.",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=256&h=256&fit=crop&crop=face",
    icon: <Brain className="w-5 h-5" />,
    skills: ["TensorFlow", "Computer Vision", "NLP"],
  },
  {
    id: 4,
    name: "Krishna Choudhary",
    role: "Full Stack Developer",
    testimonial:
      "Resilient architecture, immutable audit logs, and zero-downtime deployments — because accountability doesn't have office hours.",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop&crop=face",
    icon: <Shield className="w-5 h-5" />,
    skills: ["TypeScript", "PostgreSQL", "DevOps"],
  },
];

/* ============================
   Stats
   ============================ */
const stats = [
  { label: "Reports Filed", value: "12,000+", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "States Covered", value: "28", icon: <Globe className="w-5 h-5" /> },
  { label: "Verification Rate", value: "98%", icon: <Eye className="w-5 h-5" /> },
  { label: "Active Citizens", value: "5,400+", icon: <Users className="w-5 h-5" /> },
];

/* ============================
   Core Values
   ============================ */
const values = [
  {
    title: "Citizen First",
    description:
      "Technology should serve the people. We design for accessibility, inclusivity, and empowerment at every step.",
    icon: <Users className="w-6 h-6" />,
  },
  {
    title: "Absolute Neutrality",
    description:
      "Our code doesn't take sides. It reports the data exactly as it finds it — without bias, without agenda.",
    icon: <Shield className="w-6 h-6" />,
  },
  {
    title: "Open by Default",
    description:
      "Secrecy breeds corruption. We open-source our reporting data for total, unwavering accountability.",
    icon: <Eye className="w-6 h-6" />,
  },
];

/* ============================
   How It Works Steps
   ============================ */
const howItWorks = [
  {
    step: "01",
    title: "Spot & Report",
    description: "Citizens photograph infrastructure issues — potholes, broken bridges, stalled projects — directly from any device.",
    icon: <FileText className="w-6 h-6" />,
  },
  {
    step: "02",
    title: "AI Verification",
    description: "Our computer vision models instantly verify, classify, and geo-tag every submission with 98% accuracy.",
    icon: <Cpu className="w-6 h-6" />,
  },
  {
    step: "03",
    title: "Blockchain Seal",
    description: "Each verified report is timestamped and stored on an immutable ledger — tamper-proof by design.",
    icon: <Lock className="w-6 h-6" />,
  },
  {
    step: "04",
    title: "Public Dashboard",
    description: "All audit data is published on a live dashboard — searchable, transparent, and accessible to all.",
    icon: <BarChart3 className="w-6 h-6" />,
  },
];

/* ============================
   Technology pillars
   ============================ */
const techPillars = [
  {
    title: "Computer Vision",
    desc: "AI models trained on millions of infrastructure images detect defects invisible to the human eye.",
    icon: <Eye className="w-7 h-7" />,
  },
  {
    title: "Blockchain Ledger",
    desc: "Every report is timestamped, hashed, and stored on an immutable ledger — tamper-proof by design.",
    icon: <Shield className="w-7 h-7" />,
  },
  {
    title: "Geospatial Analysis",
    desc: "GPS-tagged submissions create a living map of infrastructure health across the nation.",
    icon: <Globe className="w-7 h-7" />,
  },
];

/* ============================
   Animation Variants
   ============================ */
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

/* ============================
   Component
   ============================ */
export default function AboutUsPage() {
  const [positions, setPositions] = useState(["front", "middle", "back", "hidden"]);

  const handleShuffle = () => {
    const newPositions = [...positions];
    newPositions.unshift(newPositions.pop()!);
    setPositions(newPositions);
  };

  return (
    <div className="font-sans" style={{ backgroundColor: "#f4feff", color: "#040f0f" }}>

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32" style={{ backgroundColor: "#f4feff" }}>
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #b0d8db 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge
              className="mb-6 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: "#e0f7f9",
                color: "#57737a",
                border: "1px solid #b0d8db",
              }}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              About Civic.ai
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight max-w-4xl mx-auto"
            style={{ fontFamily: "var(--font-display)", color: "#040f0f" }}
          >
            Building a nation where every{" "}
            <span style={{ color: "#57737a" }}>pixel of data</span> builds trust.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
            style={{ color: "#57737a" }}
          >
            Civic.ai is a digital vigilance movement empowering 1.4 billion citizens
            to become the guardians of their own infrastructure.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link href="/register">
              <Button
                className="h-11 px-7 text-sm font-semibold text-white transition-all hover:scale-105"
                style={{ backgroundColor: "#57737a" }}
              >
                Join the Movement
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/auditdata">
              <Button
                variant="outline"
                className="h-11 px-7 text-sm font-semibold transition-all"
                style={{ borderColor: "#85bdbf", color: "#57737a" }}
              >
                View Public Audits
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section style={{ backgroundColor: "#ffffff", borderTop: "1px solid #e0f7f9", borderBottom: "1px solid #e0f7f9" }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                variants={fadeInUp}
                className="flex flex-col items-center py-10 px-4"
                style={{
                  borderRight: i < stats.length - 1 ? "1px solid #e0f7f9" : "none",
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: "#e0f7f9", color: "#57737a" }}
                >
                  {stat.icon}
                </div>
                <span className="text-2xl md:text-3xl font-bold" style={{ color: "#040f0f" }}>
                  {stat.value}
                </span>
                <span className="text-xs uppercase tracking-wider mt-1" style={{ color: "#85bdbf" }}>
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== MISSION & VISION ===== */}
      <section className="py-20 px-4" style={{ backgroundColor: "#f4feff" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-12"
          >
            {/* Mission */}
            <motion.div custom={0} variants={fadeInUp}>
              <Card className="h-full border shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: "#b0d8db", backgroundColor: "#ffffff" }}>
                <CardContent className="p-8">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: "#e0f7f9", color: "#57737a" }}
                  >
                    <Target className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: "#040f0f" }}>
                    Our Mission
                  </h3>
                  <p className="leading-relaxed" style={{ color: "#57737a" }}>
                    To democratize infrastructure oversight by placing the power of
                    verification, reporting, and accountability directly in the hands of
                    every Indian citizen — using AI that is transparent, neutral, and
                    incorruptible.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Vision */}
            <motion.div custom={1} variants={fadeInUp}>
              <Card className="h-full border shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: "#b0d8db", backgroundColor: "#ffffff" }}>
                <CardContent className="p-8">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: "#e0f7f9", color: "#57737a" }}
                  >
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: "#040f0f" }}>
                    Our Vision
                  </h3>
                  <p className="leading-relaxed" style={{ color: "#57737a" }}>
                    A nation where public spending is fully visible, every construction
                    project is verifiable in real-time, and citizens trust their
                    infrastructure because they helped build the system that monitors it.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 px-4" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-14"
          >
            <motion.div variants={fadeInUp} custom={0}>
              <Badge
                className="mb-4 text-xs font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: "#e0f7f9",
                  color: "#57737a",
                  border: "1px solid #b0d8db",
                }}
              >
                Process
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              custom={1}
              className="text-3xl md:text-4xl font-bold mb-3"
              style={{ fontFamily: "var(--font-display)", color: "#040f0f" }}
            >
              How It Works
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={2}
              className="text-base max-w-lg mx-auto"
              style={{ color: "#57737a" }}
            >
              From citizen report to public record in four simple steps.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {howItWorks.map((item, i) => (
              <motion.div key={item.step} custom={i} variants={fadeInUp}>
                <div
                  className="relative p-6 rounded-xl border h-full transition-all hover:shadow-md group"
                  style={{ borderColor: "#e0f7f9", backgroundColor: "#f4feff" }}
                >
                  <span
                    className="text-4xl font-bold absolute top-4 right-4 opacity-10"
                    style={{ color: "#85bdbf" }}
                  >
                    {item.step}
                  </span>
                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: "#e0f7f9", color: "#57737a" }}
                  >
                    {item.icon}
                  </div>
                  <h4 className="font-bold mb-2" style={{ color: "#040f0f" }}>
                    {item.title}
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: "#57737a" }}>
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== TECHNOLOGY PILLARS ===== */}
      <section className="py-20 px-4" style={{ backgroundColor: "#e8f9fa" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-14"
          >
            <motion.div variants={fadeInUp} custom={0}>
              <Badge
                className="mb-4 text-xs font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: "#d4f4f6",
                  color: "#57737a",
                  border: "1px solid #b0d8db",
                }}
              >
                Technology
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              custom={1}
              className="text-3xl md:text-4xl font-bold mb-3"
              style={{ fontFamily: "var(--font-display)", color: "#040f0f" }}
            >
              Powered by Innovation
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={2}
              className="text-base max-w-lg mx-auto"
              style={{ color: "#57737a" }}
            >
              Three pillars of technology that make corruption mathematically impossible.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {techPillars.map((pillar, i) => (
              <motion.div key={pillar.title} custom={i} variants={fadeInUp}>
                <Card
                  className="h-full border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden group"
                  style={{ backgroundColor: "#ffffff", borderColor: "#b0d8db" }}
                >
                  <CardContent className="p-8">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: "#e0f7f9", color: "#57737a" }}
                    >
                      {pillar.icon}
                    </div>
                    <h3 className="text-lg font-bold mb-3" style={{ color: "#040f0f" }}>
                      {pillar.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#57737a" }}>
                      {pillar.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CORE VALUES ===== */}
      <section className="py-20 px-4" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-14"
          >
            <motion.div variants={fadeInUp} custom={0}>
              <Badge
                className="mb-4 text-xs font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: "#e0f7f9",
                  color: "#57737a",
                  border: "1px solid #b0d8db",
                }}
              >
                Core Values
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              custom={1}
              className="text-3xl md:text-4xl font-bold mb-3"
              style={{ fontFamily: "var(--font-display)", color: "#040f0f" }}
            >
              What We Stand For
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                custom={i}
                variants={fadeInUp}
                className="text-center p-8 rounded-2xl border transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                style={{ borderColor: "#e0f7f9", backgroundColor: "#f4feff" }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5"
                  style={{ backgroundColor: "#e0f7f9", color: "#57737a" }}
                >
                  {value.icon}
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: "#040f0f" }}>
                  {value.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#57737a" }}>
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== TEAM SECTION ===== */}
      <section className="py-20 px-4 relative overflow-hidden" style={{ backgroundColor: "#f4feff" }}>
        <div className="container mx-auto relative z-10">
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-6"
          >
            <motion.div variants={fadeInUp} custom={0}>
              <Badge
                className="mb-4 text-xs font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: "#e0f7f9",
                  color: "#57737a",
                  border: "1px solid #b0d8db",
                }}
              >
                The Team
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              custom={1}
              className="text-3xl md:text-4xl font-bold mb-3"
              style={{ fontFamily: "var(--font-display)", color: "#040f0f" }}
            >
              Meet the Builders
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              custom={2}
              className="text-base max-w-lg mx-auto mb-4"
              style={{ color: "#57737a" }}
            >
              The passionate engineers behind Civic.ai — drag the cards to explore.
            </motion.p>
          </motion.div>

          {/* Team Layout: Cards + Info */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-16 mt-8">
            {/* Testimonial Shuffle Cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative h-[450px] w-[350px] shrink-0"
              style={{ marginLeft: "-50px" }}
            >
              {teamMembers.map((member, index) => (
                <TestimonialCard
                  key={member.id}
                  id={member.id}
                  testimonial={member.testimonial}
                  author={member.name}
                  role={member.role}
                  avatar={member.avatar}
                  handleShuffle={handleShuffle}
                  position={positions[index]}
                />
              ))}
            </motion.div>

            {/* Team Member Detail Cards */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg"
            >
              {teamMembers.map((member, i) => (
                <motion.div
                  key={member.id}
                  custom={i}
                  variants={fadeInUp}
                  className="p-5 rounded-xl border transition-all duration-300 hover:shadow-md group"
                  style={{ borderColor: "#b0d8db", backgroundColor: "#ffffff" }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full overflow-hidden border"
                      style={{ borderColor: "#85bdbf" }}
                    >
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold" style={{ color: "#040f0f" }}>
                        {member.name}
                      </h4>
                      <p className="text-xs" style={{ color: "#85bdbf" }}>
                        {member.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3" style={{ color: "#57737a" }}>
                    {member.icon}
                    <span className="text-xs font-medium" style={{ color: "#85bdbf" }}>
                      Specialist
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {member.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: "#e0f7f9",
                          color: "#57737a",
                          border: "1px solid #b0d8db",
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== WHY CIVIC.AI ===== */}
      <section className="py-20 px-4" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-16 items-center"
          >
            {/* Left: Big feature list */}
            <motion.div custom={0} variants={fadeInUp} className="space-y-6">
              <Badge
                className="mb-2 text-xs font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: "#e0f7f9",
                  color: "#57737a",
                  border: "1px solid #b0d8db",
                }}
              >
                Why Civic.ai
              </Badge>
              <h2
                className="text-3xl md:text-4xl font-bold leading-tight"
                style={{ fontFamily: "var(--font-display)", color: "#040f0f" }}
              >
                What makes us different
              </h2>
              <p className="text-base leading-relaxed" style={{ color: "#57737a" }}>
                We combine cutting-edge technology with citizen empowerment to create an
                ecosystem of trust and accountability.
              </p>
            </motion.div>

            {/* Right: Feature checklist */}
            <motion.div custom={1} variants={fadeInUp} className="space-y-4">
              {[
                "AI-powered image verification in under 0.3 seconds",
                "Tamper-proof blockchain audit trail for every report",
                "Real-time geospatial mapping across all 28 states",
                "Multi-language support for accessibility",
                "Open-source data for public accountability",
                "Zero-knowledge privacy for whistleblower protection",
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2
                    className="w-5 h-5 mt-0.5 shrink-0"
                    style={{ color: "#85bdbf" }}
                  />
                  <span className="text-sm" style={{ color: "#57737a" }}>
                    {feature}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section
        className="py-16 px-4"
        style={{
          backgroundColor: "#e0f7f9",
          borderTop: "1px solid #b0d8db",
        }}
      >
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display)", color: "#040f0f" }}
            >
              Ready to make a <span style={{ color: "#57737a" }}>difference</span>?
            </h2>
            <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: "#57737a" }}>
              Every report you file strengthens the foundation of transparency.
              Join thousands of citizens already building a better India.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/register">
                <Button
                  className="h-11 px-7 text-sm font-semibold text-white transition-all hover:scale-105"
                  style={{ backgroundColor: "#57737a" }}
                >
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  className="h-11 px-7 text-sm font-semibold"
                  style={{ borderColor: "#85bdbf", color: "#57737a" }}
                >
                  Back to Home
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== PALETTE STRIP ===== */}
      <div className="flex h-1 w-full">
        <div className="w-1/5" style={{ backgroundColor: "#c9fbff" }} />
        <div className="w-1/5" style={{ backgroundColor: "#c2fcf7" }} />
        <div className="w-1/5" style={{ backgroundColor: "#85bdbf" }} />
        <div className="w-1/5" style={{ backgroundColor: "#57737a" }} />
        <div className="w-1/5" style={{ backgroundColor: "#040f0f" }} />
      </div>
    </div>
  );
}
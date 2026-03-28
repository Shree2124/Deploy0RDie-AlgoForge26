"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ChatBot } from "../components/LandingPage/ChatBot";
import { Header } from "../components/LandingPage/HeaderSection";
import { HeroSection } from "../components/LandingPage/HeroSection";
import { NeedSection } from "../components/LandingPage/ProcessSection";
import { FeaturesSection } from "../components/LandingPage/FeaturesSection";
import { CTASection } from "../components/LandingPage/CTASection";
import { FooterSection } from "../components/LandingPage/FooterSection";
import WorldMapDemo from "../components/world-map-demo";
import { AccessibilityWidget } from "@/components/ui/AccessibilityWidget";

const LandingPage: React.FC = () => {
  const router = useRouter();
  const { user, emailVerified } = useAuth();

  const handleGetStarted = () => {
    if (user && emailVerified) {
      router.push("/dashboard");
    } else {
      router.push("/register");
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative" style={{ backgroundColor: '#f4feff' }}>
      <ChatBot />
      <Header onGetStarted={handleGetStarted} />
      <HeroSection />
      <WorldMapDemo />
      <NeedSection />
      <FeaturesSection />
      <CTASection onGetStarted={handleGetStarted} />
      <FooterSection />
      <AccessibilityWidget />
    </div>
  );
};

export default LandingPage;

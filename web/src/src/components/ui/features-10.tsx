"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Banknote,
  ShieldAlert,
  Clock,
  EyeOff,
  LucideIcon,
} from "lucide-react";
import { ReactNode } from "react";

export function Features() {
  return (
    <section className="py-16 md:py-32" style={{ backgroundColor: "#ffffff" }}>
      <div className="mx-auto max-w-2xl px-6 lg:max-w-5xl">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
            style={{
              backgroundColor: "#fff0f0",
              border: "1px solid #fecaca",
              color: "#b91c1c",
            }}
          >
            <ShieldAlert size={14} />
            The Reality Check
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ fontFamily: "var(--font-display)", color: "#040f0f" }}
          >
            The Cost of <span style={{ color: "#b91c1c" }}>Silence</span>
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: "#57737a" }}>
            Infrastructure decay isn&apos;t just an inconvenience—it&apos;s a
            systemic failure. When quality checks are manual and opaque, public
            funds vanish and public safety is compromised.
          </p>
        </div>

        <div className="mx-auto grid gap-4 lg:grid-cols-2">
          <FeatureCard>
            <CardHeader className="pb-3">
              <CardHeading
                icon={Banknote}
                title="Financial Leakage"
                description="₹40,000 Cr+ in public infrastructure funds lost annually to pilferage, sub-standard materials, and ghost contracting."
              />
            </CardHeader>

            <div className="relative mb-6 border-t border-dashed sm:mb-0">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(125% 125% at 50% 0%, transparent 40%, #e0f7f9, white 125%)",
                }}
              ></div>
              <div className="aspect-[76/59] p-1 px-6">
                <img
                  src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80"
                  className="shadow w-full h-full object-cover rounded"
                  alt="Financial analytics dashboard"
                  width={1207}
                  height={929}
                />
              </div>
            </div>
          </FeatureCard>

          <FeatureCard>
            <CardHeader className="pb-3">
              <CardHeading
                icon={ShieldAlert}
                title="Safety Compromised"
                description="Low-grade concrete (M20 vs M40) directly correlates to structural fatigue and reduced lifespan of bridges and roads."
              />
            </CardHeader>

            <CardContent>
              <div className="relative mb-6 sm:mb-0">
                <div
                  className="absolute -inset-6"
                  style={{
                    background:
                      "radial-gradient(50% 50% at 75% 50%, transparent, #ffffff 100%)",
                  }}
                ></div>
                <div
                  className="aspect-[76/59]"
                  style={{ border: "1px solid #b0d8db" }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80"
                    className="shadow w-full h-full object-cover"
                    alt="Infrastructure construction site"
                    width={1207}
                    height={929}
                  />
                </div>
              </div>
            </CardContent>
          </FeatureCard>

          <FeatureCard className="p-6 lg:col-span-2">
            <p
              className="mx-auto my-6 max-w-md text-balance text-center text-2xl font-semibold"
              style={{ color: "#040f0f" }}
            >
              Smart monitoring with automated alerts for infrastructure
              violations and delays.
            </p>

            <div className="flex justify-center gap-6 overflow-hidden">
              <CircularUI
                label="Indefinite Delays"
                circles={[{ pattern: "border" }, { pattern: "border" }]}
              />

              <CircularUI
                label="Zero Visibility"
                circles={[{ pattern: "none" }, { pattern: "primary" }]}
              />

              <CircularUI
                label="3.5 Yr Overrun"
                circles={[{ pattern: "teal" }, { pattern: "none" }]}
              />

              <CircularUI
                label="High Risk"
                circles={[{ pattern: "primary" }, { pattern: "none" }]}
                className="hidden sm:block"
              />
            </div>
          </FeatureCard>
        </div>

        {/* Divider Quote */}
        <div
          className="mt-20 text-center py-12"
          style={{
            borderTop: "1px solid rgba(133, 189, 191, 0.3)",
            borderBottom: "1px solid rgba(133, 189, 191, 0.3)",
          }}
        >
          <blockquote
            className="text-xl md:text-2xl italic max-w-4xl mx-auto"
            style={{ fontFamily: "var(--font-display)", color: "#57737a" }}
          >
            &ldquo;Sunlight is said to be the best of disinfectants; electric
            light the most efficient policeman.&rdquo;
          </blockquote>
          <cite
            className="block mt-4 text-sm font-bold not-italic"
            style={{ color: "#040f0f" }}
          >
            — Louis Brandeis
          </cite>
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  children: ReactNode;
  className?: string;
}

const FeatureCard = ({ children, className }: FeatureCardProps) => (
  <Card
    className={cn(
      "group relative rounded-none shadow-zinc-950/5",
      className
    )}
    style={{
      borderColor: "#b0d8db",
      backgroundColor: "#ffffff",
    }}
  >
    <CardDecorator />
    {children}
  </Card>
);

const CardDecorator = () => (
  <>
    <span
      className="absolute -left-px -top-px block size-2 border-l-2 border-t-2"
      style={{ borderColor: "#85bdbf" }}
    ></span>
    <span
      className="absolute -right-px -top-px block size-2 border-r-2 border-t-2"
      style={{ borderColor: "#85bdbf" }}
    ></span>
    <span
      className="absolute -bottom-px -left-px block size-2 border-b-2 border-l-2"
      style={{ borderColor: "#85bdbf" }}
    ></span>
    <span
      className="absolute -bottom-px -right-px block size-2 border-b-2 border-r-2"
      style={{ borderColor: "#85bdbf" }}
    ></span>
  </>
);

interface CardHeadingProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const CardHeading = ({ icon: Icon, title, description }: CardHeadingProps) => (
  <div className="p-6">
    <span
      className="flex items-center gap-2"
      style={{ color: "#57737a" }}
    >
      <Icon className="size-4" />
      {title}
    </span>
    <p
      className="mt-8 text-2xl font-semibold"
      style={{ color: "#040f0f" }}
    >
      {description}
    </p>
  </div>
);

interface CircleConfig {
  pattern: "none" | "border" | "primary" | "teal";
}

interface CircularUIProps {
  label: string;
  circles: CircleConfig[];
  className?: string;
}

const CircularUI = ({ label, circles, className }: CircularUIProps) => (
  <div className={className}>
    <div
      className="size-fit rounded-2xl p-px"
      style={{
        background: "linear-gradient(to bottom, #b0d8db, transparent)",
      }}
    >
      <div
        className="relative flex aspect-square w-fit items-center -space-x-4 rounded-[15px] p-4"
        style={{
          background: "linear-gradient(to bottom, #ffffff, #f4feff)",
        }}
      >
        {circles.map((circle, i) => (
          <div
            key={i}
            className={cn("size-7 rounded-full border sm:size-8")}
            style={{
              borderColor:
                circle.pattern === "teal" ? "#85bdbf" : "#57737a",
              backgroundColor:
                circle.pattern === "none"
                  ? "transparent"
                  : circle.pattern === "border"
                  ? undefined
                  : circle.pattern === "teal"
                  ? "#e0f7f9"
                  : "#f4feff",
              backgroundImage:
                circle.pattern === "border"
                  ? "repeating-linear-gradient(-45deg, #b0d8db, #b0d8db 1px, transparent 1px, transparent 4px)"
                  : circle.pattern === "primary"
                  ? "repeating-linear-gradient(-45deg, #57737a, #57737a 1px, transparent 1px, transparent 4px)"
                  : circle.pattern === "teal"
                  ? "repeating-linear-gradient(-45deg, #85bdbf, #85bdbf 1px, transparent 1px, transparent 4px)"
                  : undefined,
            }}
          ></div>
        ))}
      </div>
    </div>
    <span
      className="mt-1.5 block text-center text-sm"
      style={{ color: "#57737a" }}
    >
      {label}
    </span>
  </div>
);

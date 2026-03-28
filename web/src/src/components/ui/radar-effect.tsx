"use client";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import React from "react";

export const Circle = ({ className, children, idx, ...rest }: any) => {
  return (
    <motion.div
      {...rest}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: idx * 0.1, duration: 0.2 }}
      className={twMerge(
        "absolute inset-0 left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 transform rounded-full border",
        className
      )}
      style={{ borderColor: "rgba(133, 189, 191, 0.25)" }}
    />
  );
};

export const Radar = ({ className }: { className?: string }) => {
  const circles = new Array(8).fill(1);
  return (
    <div
      className={twMerge(
        "relative flex h-20 w-20 items-center justify-center rounded-full",
        className
      )}
    >
      <style>{`
        @keyframes radar-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .animate-radar-spin {
          animation: radar-spin 8s linear infinite;
        }
      `}</style>
      <div
        style={{ transformOrigin: "right center" }}
        className="animate-radar-spin absolute right-1/2 top-1/2 z-40 flex h-[5px] w-[400px] items-end justify-center overflow-hidden bg-transparent"
      >
        <div
          className="relative z-40 h-[1px] w-full"
          style={{ background: "linear-gradient(to right, transparent, #85bdbf, transparent)" }}
        />
      </div>
      {circles.map((_, idx) => (
        <Circle
          style={{
            height: `${(idx + 1) * 5}rem`,
            width: `${(idx + 1) * 5}rem`,
            border: `1px solid rgba(133, 189, 191, ${0.35 - idx * 0.035})`,
          }}
          key={`circle-${idx}`}
          idx={idx}
        />
      ))}
    </div>
  );
};

export const RadarCycleProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const IconContainer = ({
  icon,
  text,
  color = "#85bdbf",
}: {
  icon?: React.ReactNode;
  text?: string;
  delay?: number;
  revealAt?: number;
  color?: string;
}) => {
  return (
    <div className="relative z-50 flex flex-col items-center justify-center space-y-2">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner"
        style={{
          backgroundColor: "rgba(4, 15, 15, 0.85)",
          border: `1px solid ${color}50`,
          boxShadow: `0 0 12px ${color}30`,
        }}
      >
        {icon}
      </div>
      <div className="hidden rounded-md px-2 py-1 md:block">
        <div className="text-center text-xs font-bold" style={{ color }}>
          {text}
        </div>
      </div>
    </div>
  );
};

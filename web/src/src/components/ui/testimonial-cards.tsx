"use client";

import * as React from 'react';
import { motion } from 'framer-motion';

interface TestimonialCardProps {
  handleShuffle: () => void;
  testimonial: string;
  position: string;
  id: number;
  author: string;
  role: string;
  avatar: string;
}

export function TestimonialCard({ handleShuffle, testimonial, position, id, author, role, avatar }: TestimonialCardProps) {
  const dragRef = React.useRef(0);
  const isFront = position === "front";

  if (position === "hidden") return null;

  return (
    <motion.div
      animate={{
        rotate: position === "front" ? "-2deg" : position === "middle" ? "1deg" : "4deg",
        scale: position === "front" ? 1 : position === "middle" ? 0.97 : 0.94,
        y: position === "front" ? 0 : position === "middle" ? -8 : -16,
        opacity: position === "front" ? 1 : position === "middle" ? 0.6 : 0.3,
      }}
      drag={isFront}
      dragElastic={0.35}
      dragConstraints={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      onDragStart={(_e, info) => {
        dragRef.current = info.point.x;
      }}
      onDragEnd={(_e, info) => {
        if (Math.abs(dragRef.current - info.point.x) > 100) {
          handleShuffle();
        }
        dragRef.current = 0;
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`absolute inset-0 grid place-content-center space-y-5 rounded-2xl p-8 ${
        isFront ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
      }`}
      style={{
        zIndex: position === "front" ? 3 : position === "middle" ? 2 : 1,
        backgroundColor: '#ffffff',
        border: '1px solid #b0d8db',
        boxShadow: isFront
          ? '0 8px 30px rgba(87, 115, 122, 0.12)'
          : '0 4px 12px rgba(87, 115, 122, 0.06)',
      }}
    >
      <div className="mx-auto">
        <div
          className="w-24 h-24 rounded-full overflow-hidden border-2"
          style={{ borderColor: '#85bdbf' }}
        >
          <img
            src={avatar}
            alt={`Avatar of ${author}`}
            className="pointer-events-none w-full h-full object-cover"
          />
        </div>
      </div>
      <span className="text-center text-sm italic leading-relaxed" style={{ color: '#57737a' }}>
        &ldquo;{testimonial}&rdquo;
      </span>
      <div className="text-center">
        <span className="block text-sm font-semibold" style={{ color: '#040f0f' }}>{author}</span>
        <span className="block text-xs mt-0.5" style={{ color: '#85bdbf' }}>{role}</span>
      </div>
    </motion.div>
  );
}

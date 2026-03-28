"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accessibility,
  RefreshCw,
  Minus,
  Plus,
  Moon,
  Eye,
  Underline,
  Navigation,
  Type,
  Image as ImageIcon,
  X
} from "lucide-react";

export function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);

  // States
  const [textSize, setTextSize] = useState(100);
  const [invertColors, setInvertColors] = useState(false);
  const [grayscale, setGrayscale] = useState(false);
  const [highlightLinks, setHighlightLinks] = useState(false);
  const [bigCursor, setBigCursor] = useState(false);
  const [dyslexiaFriendly, setDyslexiaFriendly] = useState(false);
  const [hideImages, setHideImages] = useState(false);

  const handleReset = () => {
    setTextSize(100);
    setInvertColors(false);
    setGrayscale(false);
    setHighlightLinks(false);
    setBigCursor(false);
    setDyslexiaFriendly(false);
    setHideImages(false);
  };

  useEffect(() => {
    const html = document.documentElement;
    
    // Text Size
    html.style.fontSize = textSize === 100 ? "" : `${textSize}%`;

    // Classes
    html.classList.toggle("acc-invert", invertColors);
    html.classList.toggle("acc-grayscale", grayscale);
    html.classList.toggle("acc-highlight-links", highlightLinks);
    html.classList.toggle("acc-big-cursor", bigCursor);
    html.classList.toggle("acc-dyslexia", dyslexiaFriendly);
    html.classList.toggle("acc-hide-images", hideImages);

  }, [textSize, invertColors, grayscale, highlightLinks, bigCursor, dyslexiaFriendly, hideImages]);

  return (
    <>
      {/* Global Styles for Accessibility */}
      <style dangerouslySetInnerHTML={{ __html: `
        html.acc-invert {
          filter: invert(1) hue-rotate(180deg) !important;
        }
        html.acc-invert img,
        html.acc-invert video,
        html.acc-invert iframe,
        html.acc-invert .acc-no-invert {
          filter: invert(1) hue-rotate(180deg) !important;
        }
        
        html.acc-grayscale {
          filter: grayscale(100%) !important;
        }

        html.acc-highlight-links a,
        html.acc-highlight-links button {
          background-color: #ffeb3b !important;
          color: #000000 !important;
          text-decoration: underline !important;
          font-weight: bold !important;
          border: 2px solid #000000 !important;
        }

        html.acc-big-cursor,
        html.acc-big-cursor * {
          cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z' fill='white'/%3E%3C/svg%3E"), auto !important;
        }

        html.acc-dyslexia,
        html.acc-dyslexia * {
          font-family: "OpenDyslexic", "Comic Sans MS", sans-serif !important;
          letter-spacing: 0.1em !important;
          word-spacing: 0.2em !important;
        }

        html.acc-hide-images img,
        html.acc-hide-images svg:not(.lucide),
        html.acc-hide-images [style*="background-image"] {
          opacity: 0 !important;
          visibility: hidden !important;
        }
      `}} />

      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full text-white shadow-2xl hover:scale-105 transition-transform flex items-center justify-center acc-no-invert"
        style={{ backgroundColor: "#003b5c" }} // Dark blue from screenshot
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {isOpen ? <X size={24} /> : <Accessibility size={28} />}
      </motion.button>

      {/* Popover Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-24 z-50 w-[340px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col acc-no-invert"
            style={{ fontFamily: "var(--font-sans), sans-serif", color: "#333333" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ backgroundColor: "#003b5c", color: "white" }}>
              <div className="flex items-center gap-2 font-bold text-lg">
                <Accessibility size={20} />
                Accessibility
              </div>
              <button 
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
              >
                <RefreshCw size={14} /> Reset
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[60vh] flex flex-col gap-6">
              
              {/* Text Size */}
              <div>
                <div className="text-xs font-bold text-slate-500 mb-3 tracking-wider uppercase">Text Size</div>
                <div className="flex items-center justify-between bg-slate-50 rounded-xl p-2 border border-slate-100">
                  <button 
                    onClick={() => setTextSize(Math.max(50, textSize - 10))}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-100 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Minus size={18} />
                  </button>
                  <div className="font-bold text-lg">{textSize}%</div>
                  <button 
                    onClick={() => setTextSize(Math.min(200, textSize + 10))}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-100 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Display */}
              <div>
                <div className="text-xs font-bold text-slate-500 mb-3 tracking-wider uppercase">Display</div>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setInvertColors(!invertColors)}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-colors ${invertColors ? 'border-[#003b5c] bg-[#003b5c]/5 text-[#003b5c]' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <Moon size={24} />
                    <span className="text-sm font-semibold">Invert Colors</span>
                  </button>
                  <button 
                    onClick={() => setGrayscale(!grayscale)}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-colors ${grayscale ? 'border-[#003b5c] bg-[#003b5c]/5 text-[#003b5c]' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <Eye size={24} />
                    <span className="text-sm font-semibold">Grayscale</span>
                  </button>
                </div>
              </div>

              {/* Tools */}
              <div>
                <div className="text-xs font-bold text-slate-500 mb-3 tracking-wider uppercase">Tools</div>
                <div className="flex flex-col gap-2">
                  <ToolRow 
                    icon={<Underline size={20} />} 
                    label="Highlight Links" 
                    active={highlightLinks} 
                    onClick={() => setHighlightLinks(!highlightLinks)} 
                  />
                  <ToolRow 
                    icon={<Navigation size={20} />} 
                    label="Big Cursor" 
                    active={bigCursor} 
                    onClick={() => setBigCursor(!bigCursor)} 
                  />
                  <ToolRow 
                    icon={<Type size={20} />} 
                    label="Dyslexia Friendly" 
                    active={dyslexiaFriendly} 
                    onClick={() => setDyslexiaFriendly(!dyslexiaFriendly)} 
                  />
                  <ToolRow 
                    icon={<ImageIcon size={20} />} 
                    label="Hide Images" 
                    active={hideImages} 
                    onClick={() => setHideImages(!hideImages)} 
                  />
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ToolRow({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${active ? 'border-[#003b5c] bg-[#003b5c]/5 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${active ? 'bg-[#003b5c] text-white' : 'bg-slate-100 text-slate-600'}`}>
          {icon}
        </div>
        <span className={`font-semibold ${active ? 'text-[#003b5c]' : 'text-slate-700'}`}>{label}</span>
      </div>
      <div className="pr-2">
        <div className={`w-4 h-4 rounded-full border-2 transition-colors ${active ? 'border-[#003b5c] bg-[#003b5c]' : 'border-slate-300 bg-slate-200'}`} />
      </div>
    </button>
  );
}

"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  RefreshCcw,
  User,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- CONFIGURATION ---
const SYSTEM_INSTRUCTION = `You are "Civic Sahayak", the AI assistant for Civic.ai. 
Your tone is Professional, Patriotic, and Helpful.
Keep answers strictly under 50 words.
Do not use markdown formatting like bold or italics, just plain text.

Knowledge Base:
1. Mission: To crowdsource infrastructure auditing using AI.
2. Process: Snap a photo -> AI Analyzes -> Report sent to authorities.
3. Anonymity: Fully encrypted. No personal data shared with contractors.
4. Emergency: For life-threatening issues, dial 100 instantly.`;

const MODEL_NAME = "gemini-2.5-flash";

interface Message {
  role: "user" | "model";
  text: string;
}

const SUGGESTED_QUESTIONS = [
  "How do I file a report?",
  "Is my identity hidden?",
  "What is Civic.ai?",
  "Track my complaint status",
];

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Jai Hind! I am Civic Sahayak. How can I assist you in auditing our nation's infrastructure today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    setInput("");
    const newMessages = [...messages, { role: "user" as const, text: textToSend }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const payloadMessages = [
        { role: "system", content: SYSTEM_INSTRUCTION },
        ...newMessages.map(m => ({
          role: m.role === "model" ? "assistant" : "user",
          content: m.text
        }))
      ];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages })
      });

      if (!res.ok) throw new Error("API request failed");
      const data = await res.json();

      setMessages((prev) => [...prev, { role: "model", text: data.text }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Connection error. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: "model",
        text: "Chat cleared. I am ready for your next query.",
      },
    ]);
  };

  return (
    <div className="fixed bottom-24 right-6 z-[9999] font-sans">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[90vw] sm:w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col mb-4 overflow-hidden relative"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #b0d8db',
            }}
          >
            {/* Header */}
            <div
              className="text-white p-4 flex justify-between items-center shadow-lg relative overflow-hidden shrink-0"
              style={{ backgroundColor: '#040f0f' }}
            >
              {/* Decorative background */}
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"
                style={{ backgroundColor: '#85bdbf' }}
              ></div>

              <div className="flex items-center gap-3 relative z-10">
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: 'rgba(133, 189, 191, 0.15)',
                      border: '1px solid rgba(133, 189, 191, 0.3)',
                    }}
                  >
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: '#c2fcf7', border: '2px solid #040f0f' }}
                  ></div>
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">
                    Civic Sahayak
                  </h3>
                  <p className="text-[10px] font-mono flex items-center gap-1" style={{ color: '#c2fcf7' }}>
                    <Sparkles size={8} /> AI Powered
                  </p>
                </div>
              </div>
              <div className="flex gap-2 relative z-10">
                <button
                  onClick={handleReset}
                  className="transition-colors p-1 rounded-md"
                  title="Reset Chat"
                  style={{ color: '#85bdbf' }}
                >
                  <RefreshCcw size={18} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="transition-colors p-1 rounded-md"
                  title="Close Chat"
                  style={{ color: '#85bdbf' }}
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: '#f4feff' }}>
              <div className="flex justify-center">
                <span
                  className="text-[10px] font-medium px-2 py-1 rounded-full"
                  style={{ backgroundColor: '#e0f7f9', color: '#57737a' }}
                >
                  Today
                </span>
              </div>

              {messages.map((msg, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: msg.role === "user" ? 'rgba(87, 115, 122, 0.15)' : 'rgba(133, 189, 191, 0.15)',
                      color: msg.role === "user" ? '#57737a' : '#85bdbf',
                    }}
                  >
                    {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                  </div>

                  <div
                    className="max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm"
                    style={msg.role === "user" ? {
                      backgroundColor: '#57737a',
                      color: '#ffffff',
                      borderTopRightRadius: '2px',
                    } : {
                      backgroundColor: '#ffffff',
                      color: '#040f0f',
                      border: '1px solid #e0f7f9',
                      borderTopLeftRadius: '2px',
                    }}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(133, 189, 191, 0.15)', color: '#85bdbf' }}
                  >
                    <Bot size={14} />
                  </div>
                  <div
                    className="px-4 py-3 rounded-2xl flex gap-1 items-center h-10"
                    style={{ backgroundColor: '#ffffff', border: '1px solid #e0f7f9', borderTopLeftRadius: '2px' }}
                  >
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: '#85bdbf' }}
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: '#85bdbf' }}
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: '#85bdbf' }}
                    />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length < 3 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar shrink-0" style={{ backgroundColor: '#f4feff' }}>
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="whitespace-nowrap px-3 py-1.5 text-xs rounded-full shadow-sm transition-colors"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #b0d8db',
                      color: '#57737a',
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 shrink-0" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e0f7f9' }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2 items-center"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your query here..."
                  className="flex-1 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                  style={{
                    backgroundColor: '#f4feff',
                    border: '1px solid #b0d8db',
                    color: '#040f0f',
                  }}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="rounded-xl h-11 w-11 shadow-md shrink-0 text-white"
                  style={{
                    backgroundColor: '#57737a',
                    boxShadow: '0 4px 14px rgba(87, 115, 122, 0.2)',
                  }}
                >
                  <Send
                    size={18}
                    className={isLoading ? "opacity-0" : "opacity-100"}
                  />
                  {isLoading && (
                    <span className="absolute animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
                  )}
                </Button>
              </form>
              <div className="text-[10px] text-center mt-2 flex items-center justify-center gap-1" style={{ color: '#85bdbf' }}>
                <ShieldCheck size={10} />
                Secure & Encrypted Session. AI can make errors.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: -180 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center justify-center cursor-pointer"
          >
            {/* Pulsing Rings */}
            <div className="absolute inset-0 rounded-full animate-ping opacity-20 delay-1000" style={{ backgroundColor: '#85bdbf' }}></div>
            <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: '#c2fcf7' }}></div>

            <div
              className="text-white p-4 rounded-full shadow-2xl relative z-10 flex items-center gap-2 pr-6"
              style={{
                backgroundColor: '#040f0f',
                border: '1px solid rgba(133, 189, 191, 0.3)',
              }}
            >
              <MessageSquare className="w-6 h-6 fill-current" style={{ color: '#c2fcf7' }} />
              <div className="flex flex-col items-start">
                <span className="text-xs font-bold leading-none">
                  Need Help?
                </span>
                <span className="text-[10px] leading-none" style={{ color: '#85bdbf' }}>
                  Ask Sahayak
                </span>
              </div>
            </div>

            {/* Notification Badge */}
            <div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full z-20"
              style={{ backgroundColor: '#85bdbf', border: '2px solid #ffffff' }}
            ></div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
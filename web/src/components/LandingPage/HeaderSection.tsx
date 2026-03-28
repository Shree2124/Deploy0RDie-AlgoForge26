"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Search,
  AlertTriangle,
  FileText,
  UserCircle,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { LanguageSelector } from "@/components/ui/LanguageSelector";

interface HeaderProps {
  onGetStarted?: () => void;
}

const NAV_LINKS = [
  { name: "Public Audits", href: "/auditdata" },
  { name: "Open Data", href: "/opendata" },
  { name: "About Us", href: "/aboutus" },
];

export const Header: React.FC<HeaderProps> = ({ onGetStarted }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      {/* Main Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`sticky top-0 z-40 transition-all duration-300 border-b-[3px]`}
        style={{
          backgroundColor: scrolled ? 'rgba(255,255,255,0.95)' : '#ffffff',
          borderBottomColor: '#85bdbf',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          boxShadow: scrolled ? '0 4px 20px rgba(4,15,15,0.08)' : 'none',
          padding: scrolled ? '0.5rem 0' : '1rem 0',
        }}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">

          {/* Logo Section */}
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

            <div className="h-10 w-px mx-1 hidden sm:block" style={{ backgroundColor: '#b0d8db' }}></div>
          </Link>

          {/* Desktop Search & Nav */}
          <div className="hidden lg:flex items-center gap-6">

            {/* Navigation Links */}
            <nav className="flex gap-5 text-sm font-semibold" style={{ color: '#040f0f' }}>
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative group py-2 transition-colors"
                  style={{ color: '#040f0f' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#57737a')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#040f0f')}
                >
                  {item.name}
                  <span
                    className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                    style={{ backgroundColor: '#85bdbf' }}
                  ></span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <LanguageSelector />
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="gap-2 h-9 font-semibold"
                  style={{
                    borderColor: '#85bdbf',
                    color: '#57737a',
                  }}
                >
                  <AlertTriangle size={16} />
                  Report Issue
                </Button>
              </Link>

              {user ? (
                <div className="relative group">
                  <button
                    className="flex items-center gap-2 p-1 pr-3 rounded-full transition-all hover:bg-slate-50 border border-transparent hover:border-[#b0d8db]"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#e0f7f9] flex items-center justify-center overflow-hidden border border-[#85bdbf]">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle size={20} className="text-[#57737a]" />
                      )}
                    </div>
                    <span className="text-sm font-semibold text-[#040f0f]">{user.name.split(' ')[0]}</span>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-[#b0d8db] overflow-hidden">
                      <div className="p-3 border-b border-[#e8f9fa] bg-[#f4feff]/50">
                        <p className="text-xs font-bold text-[#85bdbf] uppercase tracking-wider">Account</p>
                        <p className="text-sm font-medium text-[#040f0f] truncate">{user.email}</p>
                      </div>
                      <div className="p-1">
                        <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#57737a] hover:bg-[#f4feff] hover:text-[#040f0f] rounded-lg transition-colors">
                          <LayoutDashboard size={16} />
                          Dashboard
                        </Link>
                        <button
                          onClick={() => signOut()}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href="/login">
                  <Button
                    className="gap-2 shadow-md h-9 flex items-center px-4 rounded-md font-semibold text-white"
                    style={{
                      backgroundColor: '#57737a',
                    }}
                  >
                    <UserCircle size={16} />
                    Citizen Login
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-3">
            <Search style={{ color: '#57737a' }} size={24} />
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? (
                <X style={{ color: '#040f0f' }} />
              ) : (
                <Menu style={{ color: '#040f0f' }} />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden shadow-xl absolute w-full z-30"
            style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #b0d8db' }}
          >
            <div className="p-4 flex flex-col gap-4">
              {NAV_LINKS.map((item, i) => (
                <motion.div
                  key={item.name}
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-base font-medium pb-2"
                    style={{ color: '#040f0f', borderBottom: '1px solid #e8f9fa' }}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}

              <div className="flex flex-col gap-3 mt-2">
                <Link href="/dashboard" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full justify-center h-11"
                    style={{ borderColor: '#85bdbf', color: '#57737a' }}
                  >
                    <AlertTriangle size={16} className="mr-2" /> Report Issue
                  </Button>
                </Link>

                {user ? (
                  <>
                    <Link href="/dashboard" className="w-full">
                      <Button
                        variant="outline"
                        className="w-full justify-center h-11"
                        style={{ borderColor: '#85bdbf', color: '#57737a' }}
                      >
                        <LayoutDashboard size={16} className="mr-2" /> Dashboard
                      </Button>
                    </Link>
                    <Button
                      onClick={() => signOut()}
                      className="w-full justify-center text-white h-11"
                      style={{ backgroundColor: '#ef4444' }}
                    >
                      <LogOut size={16} className="mr-2" /> Sign Out
                    </Button>
                  </>
                ) : (
                  <Link href="/login" className="w-full">
                    <Button
                      className="w-full justify-center text-white h-11"
                      style={{ backgroundColor: '#57737a' }}
                    >
                      <UserCircle size={16} className="mr-2" /> Citizen Login
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
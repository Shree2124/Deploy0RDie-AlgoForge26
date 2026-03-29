"use client";
import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, ClipboardList, FileText, MapPin, AlertTriangle, ArrowRight,
  LocateFixed, Download, CheckCircle2, Building2, Menu, X, Camera,
  LogOut, TrendingUp, ShieldCheck, Activity, BarChart3, Clock, ChevronRight,
  Eye, EyeOff, Lock, FileBarChart
} from "lucide-react";
import { OfficialRecord, Report, RiskLevel } from "@/types/types";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";

// Import Modular Tabs
import ReportIssueTab from "@/components/dashboard/ReportIssueTab";
import NewRtiTab from "@/components/dashboard/NewRtiTab"; // NEW COMPONENT IMPORTED

// --- DYNAMIC MAP IMPORT ---
const MapVisualizer = dynamic(
  () => import("@/components/MapView/Mapvisualizer"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center animate-pulse rounded-xl" style={{ backgroundColor: '#e0f7f9' }}>
        <Building2 className="w-8 h-8" style={{ color: '#85bdbf' }} />
      </div>
    ),
  }
);

// --- MOCK DATA ---
// MOCK_RECORDS removed — records are now fetched dynamically from /api/records

interface DashboardPageProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  isMobileNavOpen?: boolean;
  setIsMobileNavOpen?: (open: boolean) => void;
}

type TabType = "overview" | "reports" | "rti" | "reportissue" | "new-rti";

export default function DashboardPage({ activeTab: propActiveTab, onTabChange, isMobileNavOpen, setIsMobileNavOpen }: DashboardPageProps) {
  const router = useRouter();
  const { user, signOut, refreshUser } = useAuth();
  const [internalTab, setInternalTab] = useState<TabType>("overview");
  const activeTab = (propActiveTab || internalTab) as TabType;

  const setActiveTab = (tab: TabType) => {
    if (onTabChange) onTabChange(tab);
    else setInternalTab(tab);
  };

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; } | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<OfficialRecord | null>(null);
  const [userCity, setUserCity] = useState<string | null>(null);

  // DYNAMIC STATE FOR DB REPORTS
  const [myReports, setMyReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [myRtiRequests, setMyRtiRequests] = useState<any[]>([]);
  const [loadingRti, setLoadingRti] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [allReports, setAllReports] = useState<any[]>([]);
  const [locating, setLocating] = useState(false);

  // VERIFICATION MODAL STATE
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [aadhar, setAadhar] = useState("");
  const [phone, setPhone] = useState("");
  const [showAadhar, setShowAadhar] = useState(false);
  const [submittingVerify, setSubmittingVerify] = useState(false);

  // Fetch Location
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({ lat, lng });
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          setUserCity(data.address.city || data.address.town || data.address.village || data.address.state);
        } catch {
          setUserCity("Unknown Location");
        }
      },
      () => {
        setUserLocation({ lat: 19.076, lng: 72.8777 });
        setUserCity("Mumbai");
      }
    );
  }, []);

  // Fetch Real Reports from Supabase DB
  const fetchRtiRequests = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('rti_requests')
      .select('*, rti_response(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMyRtiRequests(data);
    }
    setLoadingRti(false);
  };

  useEffect(() => {
    if (!user) {
      setLoadingReports(false);
      setLoadingRti(false);
      return;
    }
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from('citizen_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setMyReports(data);
      }
      setLoadingReports(false);
    };

    fetchReports();
    fetchRtiRequests();

    // Fetch ALL reports (all users) for the map
    supabase
      .from('citizen_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setAllReports(data);
      });

    // Fetch Projects from API
    fetch('/api/dashboard/projects')
      .then(res => res.ok ? res.json() : { projects: [] })
      .then(data => setProjects(data.projects || []))
      .catch(() => { });
  }, [user]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const p = 0.017453292519943295;
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p) / 2 +
      c(lat1 * p) * c(lat2 * p) *
      (1 - c((lon2 - lon1) * p)) / 2;
    return 12742 * Math.asin(Math.sqrt(a));
  };

  const nearbyProjects = useMemo(() => {
    if (!projects.length) return [];
    const centerLat = userLocation ? userLocation.lat : 19.0760;
    const centerLng = userLocation ? userLocation.lng : 72.8777;
    return projects
      .filter((p: any) => p.latitude && p.longitude)
      .filter((p: any) => calculateDistance(centerLat, centerLng, p.latitude, p.longitude) <= 15)
      .sort((a, b) => calculateDistance(centerLat, centerLng, a.latitude, a.longitude) - calculateDistance(centerLat, centerLng, b.latitude, b.longitude));
  }, [projects, userLocation]);

  const topProjects = useMemo(() => {
    return [...projects]
      .filter(p => p.budget)
      .sort((a: any, b: any) => b.budget - a.budget)
      .slice(0, 5);
  }, [projects]);

  // --- TRANSFORM ALL REPORTS TO MAP Report[] FORMAT (shows everyone's reports) ---
  const mapReports: Report[] = useMemo(() => {
    return allReports
      .filter((r: any) => r.latitude != null && r.longitude != null)
      .map((r: any) => {
        const riskMap: Record<string, RiskLevel> = {
          'High': RiskLevel.HIGH,
          'Medium': RiskLevel.MEDIUM,
          'Low': RiskLevel.LOW,
        };
        return {
          id: r.id,
          evidence: {
            image: r.image_url || '',
            timestamp: new Date(r.created_at).getTime(),
            coordinates: { lat: r.latitude, lng: r.longitude },
            userComment: r.notes || undefined,
          },
          auditResult: r.ai_risk_level
            ? {
              riskLevel: riskMap[r.ai_risk_level] || RiskLevel.UNKNOWN,
              discrepancies: r.ai_discrepancies || [],
              reasoning: r.ai_verdict || '',
              confidenceScore: 0.8,
            }
            : undefined,
          status: r.status === 'Verified' ? 'Verified' as const : r.status === 'Audited' ? 'Audited' as const : 'Pending' as const,
          category: r.category || 'Other',
        };
      });
  }, [allReports]);

  // Protected Action Handler
  const handleProtectedAction = (pathOrTab: string) => {
    if (user?.verification_status !== 'Approved') {
      setShowVerifyModal(true);
    } else {
      if (pathOrTab.startsWith("/")) {
        router.push(pathOrTab);
      } else {
        setActiveTab(pathOrTab as any);
      }
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingVerify(true);
    try {
      const { error } = await supabase.from('profiles').update({
        phone,
        aadhar_number: aadhar,
        verification_status: 'Pending',
        rejection_reason: null
      }).eq('id', user.id);

      if (!error) {
        await refreshUser();
        setShowVerifyModal(false);
        alert("Verification Details Submitted securely. Pending Admin Approval.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingVerify(false);
    }
  };

  const totalBudget = useMemo(() => projects.reduce((acc, p) => acc + (p.budget || 0), 0), [projects]);
  const completedProjects = useMemo(() => projects.filter(p => p.status === 'Completed').length, [projects]);
  const complianceRate = projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0;
  const nearbyAlerts = useMemo(() => {
    const centerLat = userLocation ? userLocation.lat : 19.0760;
    const centerLng = userLocation ? userLocation.lng : 72.8777;
    return mapReports.filter((r: any) => calculateDistance(centerLat, centerLng, r.evidence.coordinates.lat, r.evidence.coordinates.lng) <= 10).length;
  }, [mapReports, userLocation]);

  // Stats data
  const stats = [
    {
      label: "My Contributions",
      value: loadingReports ? "..." : myReports.length.toString(),
      icon: CheckCircle2,
      trend: "+12%",
      trendUp: true,
      bgColor: "#0f4141ff",
      textColor: "#b2d1cfff",
      iconColor: "#367e80ff",
    },
    {
      label: "Alerts Near Me",
      value: nearbyAlerts.toString(),
      icon: AlertTriangle,
      trend: "within 10km",
      trendUp: false,
      bgColor: "#ffffff",
      textColor: "#040f0f",
      iconColor: "#f59e0b",
    },
    {
      label: "Completion Rate",
      value: `${complianceRate}%`,
      icon: ShieldCheck,
      trend: "status",
      trendUp: true,
      bgColor: "#ffffff",
      textColor: "#040f0f",
      iconColor: "#85bdbf",
    },
    {
      label: "Total Budget Tracked",
      value: `₹${(totalBudget / 10000000).toFixed(2)} Cr`,
      icon: BarChart3,
      trend: "tracked live",
      trendUp: true,
      bgColor: "#ffffff",
      textColor: "#040f0f",
      iconColor: "#57737a",
    },
  ];

  const mappedOfficialRecords = useMemo(() => {
    return projects.map((p: any) => ({
      id: p.id,
      projectName: p.project_name,
      budget: p.budget || 0,
      location: { lat: p.latitude || 0, lng: p.longitude || 0 },
      contractor: p.vendor_id ? `Vendor #${p.vendor_id}` : 'Various',
      status: p.status,
      category: p.category,
      deadline: p.deadline || '',
      description: p.description || ''
    }));
  }, [projects]);

  return (
    <div className="flex flex-col h-full overflow-hidden w-full font-sans relative">

      {/* SECURE VERIFICATION MODAL */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-[#040f0f] p-6 text-white relative">
              <button onClick={() => setShowVerifyModal(false)} className="absolute top-4 right-4 text-[#85bdbf] hover:text-white"><X size={20} /></button>
              <ShieldCheck size={32} className="text-[#85bdbf] mb-3" />
              <h2 className="text-xl font-bold">Identity Verification Required</h2>
              <p className="text-sm mt-1" style={{ color: '#85bdbf' }}>Government guidelines mandate KYC to file official reports.</p>
            </div>
            <form onSubmit={handleVerificationSubmit} className="p-6 space-y-5">
              {user?.verification_status === 'Rejected' && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-start gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <div><strong className="block">Previous Request Rejected:</strong> {user.rejection_reason}</div>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#040f0f' }}>Phone Number</label>
                <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" className="w-full p-3 rounded-xl focus:outline-none transition-all" style={{ border: '1px solid #b0d8db', backgroundColor: '#f4feff', color: '#040f0f' }} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 flex items-center gap-1" style={{ color: '#040f0f' }}><Lock size={14} /> Aadhar Number</label>
                <div className="relative group">
                  <input required type={showAadhar ? "text" : "password"} value={aadhar} onChange={(e) => setAadhar(e.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="XXXX XXXX XXXX" className="w-full p-3 pr-12 rounded-xl focus:outline-none font-mono tracking-widest transition-all" style={{ border: '1px solid #b0d8db', backgroundColor: '#f4feff', color: '#040f0f' }} />
                  <button type="button" onMouseLeave={() => setShowAadhar(false)} onClick={() => setShowAadhar(!showAadhar)} className="absolute right-3 top-3.5 transition-colors" style={{ color: '#57737a' }}>
                    {showAadhar ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs mt-2 flex items-center gap-1" style={{ color: '#57737a' }}><ShieldCheck size={12} /> 256-bit Encrypted. Used strictly for deduplication.</p>
              </div>
              <button disabled={submittingVerify} type="submit" className="w-full py-3.5 font-bold rounded-xl disabled:opacity-50 transition-colors text-white" style={{ backgroundColor: '#57737a' }}>
                {submittingVerify ? "Securing Data..." : "Submit for Verification"}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobileNavOpen && (
        <div
          className="md:hidden fixed inset-0 z-[2000]"
          style={{ backgroundColor: "rgba(87,115,122,0.97)" }}
        >
          <div className="p-6 space-y-2">
            <div className="flex justify-between items-center mb-8">
              <img src="/mainlogo.svg" alt="Civic.ai" className="h-8 w-auto" style={{ filter: "brightness(0) invert(1)" }} />
              <button onClick={() => setIsMobileNavOpen?.(false)} style={{ color: "#ffffff" }}>
                <X size={24} />
              </button>
            </div>
            {[
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              { id: "reports", label: "My Reports", icon: ClipboardList },
              { id: "rti", label: "RTI & Docs", icon: FileText },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setIsMobileNavOpen?.(false); }}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-[14px] font-medium transition-all"
                style={{
                  backgroundColor: activeTab === item.id || (activeTab === 'new-rti' && item.id === 'rti') ? "rgba(255,255,255,0.18)" : "transparent",
                  color: activeTab === item.id || (activeTab === 'new-rti' && item.id === 'rti') ? "#ffffff" : "rgba(255,255,255,0.75)",
                }}
              >
                <item.icon size={20} /> {item.label}
              </button>
            ))}
            <Link
              href="/mapview"
              className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-[14px] font-medium"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              <MapPin size={20} /> Map View
            </Link>
            <div className="pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-[14px] font-medium"
                style={{ color: "#fecaca" }}
              >
                <LogOut size={20} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scroll-smooth relative z-0" style={{ backgroundColor: "#f4feff" }}>

        {/* Verification Status Banner */}
        {user?.verification_status === 'Pending' && (
          <div className="w-full px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium z-50" style={{ backgroundColor: '#fef3c7', color: '#92400e', borderBottom: '1px solid #fde68a' }}>
            <Clock size={16} /> KYC Verification Pending. Core features are restricted until Admin approval.
          </div>
        )}
        {user?.verification_status === 'Rejected' && (
          <div className="w-full px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium z-50" style={{ backgroundColor: '#fef2f2', color: '#991b1b', borderBottom: '1px solid #fecaca' }}>
            <AlertTriangle size={16} /> KYC Rejected. Click any feature to re-submit details.
          </div>
        )}

        <div className="p-4 lg:p-8 max-w-[1400px] mx-auto">

          {/* --- OVERVIEW TAB --- */}
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

              {/* Welcome Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: "#040f0f" }}>
                    Welcome back, {user?.name?.split(" ")[0] || "Citizen"} 👋
                  </h1>
                  <p className="text-sm mt-1" style={{ color: "#57737a" }}>
                    Here&apos;s what&apos;s happening in your city today.
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <div
                    className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                    style={{
                      backgroundColor: "#e0f7f9",
                      color: "#57737a",
                      border: "1px solid #b0d8db",
                    }}
                  >
                    <LocateFixed size={14} style={{ color: "#85bdbf" }} />
                    {userCity ? `${userCity}` : "Locating..."}
                  </div>
                  <button
                    onClick={() => handleProtectedAction("reportissue")}
                    className="px-4 py-2 rounded-xl text-[14px] font-bold flex items-center gap-2 text-white transition-all shadow-lg hover:shadow-xl cursor-pointer"
                    style={{
                      backgroundColor: "#57737a",
                    }}
                  >
                    <Camera size={14} /> New Audit
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative p-5 rounded-2xl overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    style={{
                      backgroundColor: stat.bgColor,
                      border: stat.bgColor === "#ffffff" ? "1px solid #b0d8db" : "none",
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p
                          className="text-[10px] font-bold uppercase tracking-wider mb-2"
                          style={{ color: stat.bgColor === "#040f0f" ? "#85bdbf" : "#57737a" }}
                        >
                          {stat.label}
                        </p>
                        <h3
                          className="text-3xl font-bold"
                          style={{ color: stat.textColor }}
                        >
                          {stat.value}
                        </h3>
                        <div className="flex items-center gap-1 mt-2">
                          {stat.trendUp ? (
                            <TrendingUp size={12} style={{ color: "#10b981" }} />
                          ) : (
                            <Activity size={12} style={{ color: "#f59e0b" }} />
                          )}
                          <span
                            className="text-[10px] font-semibold"
                            style={{ color: stat.bgColor === "#040f0f" ? "#85bdbf" : "#57737a" }}
                          >
                            {stat.trend}
                          </span>
                        </div>
                      </div>
                      <div
                        className="p-3 rounded-xl"
                        style={{
                          backgroundColor:
                            stat.bgColor === "#040f0f"
                              ? "rgba(133,189,191,0.1)"
                              : "#f4feff",
                        }}
                      >
                        <stat.icon size={22} style={{ color: stat.iconColor }} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Map + Projects Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Map Widget */}
                <div
                  className="lg:col-span-2 rounded-2xl overflow-hidden flex flex-col h-[380px] relative z-0 group"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #b0d8db",
                  }}
                >
                  <div
                    className="flex items-center justify-between px-4 py-3 shrink-0"
                    style={{ borderBottom: "1px solid #e0f7f9" }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#85bdbf' }}></div>
                      <span className="text-xs font-bold" style={{ color: '#040f0f' }}>Live Infrastructure Map</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setLocating(true);
                          navigator.geolocation.getCurrentPosition(
                            (pos) => {
                              setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                              setLocating(false);
                            },
                            () => setLocating(false),
                            { enableHighAccuracy: true }
                          );
                        }}
                        className="p-1.5 rounded-full transition-all hover:scale-105"
                        style={{ backgroundColor: userLocation ? '#dbeafe' : '#e0f7f9', border: '1px solid #b0d8db' }}
                        title="Show my location"
                      >
                        <LocateFixed size={14} className={locating ? 'animate-spin' : ''} style={{ color: userLocation ? '#2563eb' : '#57737a' }} />
                      </button>
                      <Link href="/mapview" className="text-[10px] font-bold flex items-center gap-1 transition-colors" style={{ color: '#85bdbf' }}>
                        Full View <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                  <div className="flex-1">
                    <MapVisualizer
                      records={mappedOfficialRecords}
                      reports={mapReports}
                      onRecordSelect={setSelectedRecord}
                      userLocation={userLocation}
                    />
                  </div>
                </div>

                {/* Nearby Projects */}
                <div
                  className="lg:col-span-1 rounded-2xl flex flex-col h-[380px]"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #b0d8db",
                  }}
                >
                  <div
                    className="px-4 py-3 flex justify-between items-center shrink-0"
                    style={{ borderBottom: "1px solid #e0f7f9" }}
                  >
                    <h3 className="font-bold text-sm" style={{ color: '#040f0f' }}>Nearby Projects</h3>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: '#e0f7f9', color: '#57737a' }}
                    >
                      {nearbyProjects.length} Active
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {nearbyProjects.map((project: any) => (
                      <div
                        key={project.id}
                        onClick={() => setSelectedRecord(mappedOfficialRecords.find(r => r.id === project.id) || null)}
                        className="p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md group"
                        style={{
                          backgroundColor: selectedRecord?.id === project.id ? '#040f0f' : '#f4feff',
                          border: selectedRecord?.id === project.id ? 'none' : '1px solid #e0f7f9',
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: selectedRecord?.id === project.id ? 'rgba(133,189,191,0.15)' : '#e0f7f9',
                              color: selectedRecord?.id === project.id ? '#85bdbf' : '#57737a',
                            }}
                          >
                            {project.id}
                          </span>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: project.status === "Completed" ? '#dcfce7' : '#e0f7f9',
                              color: project.status === "Completed" ? '#16a34a' : '#57737a',
                            }}
                          >
                            {project.status}
                          </span>
                        </div>
                        <h4
                          className="font-bold text-sm leading-tight mb-1"
                          style={{ color: selectedRecord?.id === project.id ? '#e8f9fa' : '#040f0f' }}
                        >
                          {project.project_name}
                        </h4>
                        <div
                          className="text-[10px]"
                          style={{ color: selectedRecord?.id === project.id ? '#85bdbf' : '#57737a' }}
                        >
                          ₹{((project.budget || 0) / 10000000).toFixed(2)} Cr • {project.vendor_id ? `Vendor #${project.vendor_id}` : 'Various'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Activity Feed + Quick Actions Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Top Projects */}
                <div
                  className="lg:col-span-2 rounded-2xl p-5"
                  style={{ backgroundColor: "#ffffff", border: "1px solid #b0d8db" }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-sm" style={{ color: '#040f0f' }}>Top projects</h3>
                    <span className="text-[10px] font-bold flex items-center gap-1" style={{ color: '#85bdbf' }}>
                      <Clock size={12} /> Updated live
                    </span>
                  </div>
                  <div className="space-y-3">
                    {topProjects.length > 0 ? topProjects.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-3 rounded-xl transition-colors"
                        style={{ backgroundColor: '#f4feff' }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: item.status === 'Completed' ? '#dcfce7'
                              : item.status === 'In Progress' ? '#fef3c7'
                                : '#e0f7f9',
                          }}
                        >
                          {item.status === 'Completed' ? <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
                            : item.status === 'In Progress' ? <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
                              : <Building2 size={18} style={{ color: '#57737a' }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: '#040f0f' }}>{item.project_name}</p>
                          <p className="text-xs truncate capitalize" style={{ color: '#57737a' }}>{item.category || 'General'}</p>
                        </div>
                        <span className="text-xs font-bold whitespace-nowrap" style={{ color: '#85bdbf' }}>
                          ₹{((item.budget || 0) / 10000000).toFixed(2)} Cr
                        </span>
                      </div>
                    )) : (
                      <div className="text-sm font-semibold text-center text-slate-500 py-4">No projects available.</div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                  <div onClick={() => handleProtectedAction("reportissue")}>
                    <div
                      className="p-5 rounded-2xl text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group cursor-pointer"
                      style={{ backgroundColor: '#040f0f' }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(133,189,191,0.15)' }}>
                            <Camera size={20} style={{ color: '#c2fcf7' }} />
                          </div>
                          <div>
                            <span className="font-bold text-sm">Create Audit Draft</span>
                            <p className="text-[10px] mt-0.5" style={{ color: '#85bdbf' }}>Report suspicious activity</p>
                          </div>
                        </div>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" style={{ color: '#85bdbf' }} />
                      </div>
                    </div>
                  </div>

                  <div onClick={() => handleProtectedAction("new-rti")}>
                    <div
                      className="p-5 rounded-2xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group cursor-pointer"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #b0d8db',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl" style={{ backgroundColor: '#e0f7f9' }}>
                            <FileBarChart size={20} style={{ color: '#57737a' }} />
                          </div>
                          <div>
                            <span className="font-bold text-sm" style={{ color: '#040f0f' }}>File RTI Request</span>
                            <p className="text-[10px] mt-0.5" style={{ color: '#57737a' }}>Access public records</p>
                          </div>
                        </div>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" style={{ color: '#85bdbf' }} />
                      </div>
                    </div>
                  </div>

                  <div
                    className="p-5 rounded-2xl"
                    style={{ backgroundColor: '#ffffff', border: '1px solid #b0d8db' }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: '#57737a' }}>
                      City Health Score
                    </p>
                    <div className="flex items-end gap-2 mb-3">
                      <span className="text-4xl font-bold" style={{ color: '#040f0f' }}>72</span>
                      <span className="text-sm font-medium mb-1" style={{ color: '#85bdbf' }}>/100</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#e0f7f9' }}>
                      <div className="h-full rounded-full" style={{ width: '72%', backgroundColor: '#85bdbf' }}></div>
                    </div>
                    <p className="text-[10px] mt-2" style={{ color: '#57737a' }}>Based on {projects.length} connected metrics in your area</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* --- REPORTS TAB --- */}
          {activeTab === "reports" && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: '#040f0f' }}>My Reports</h2>
                  <p className="text-sm mt-1" style={{ color: '#57737a' }}>Track all your submitted infrastructure reports</p>
                </div>
                <button
                  onClick={() => handleProtectedAction("reportissue")}
                  className="px-4 py-2 rounded-xl text-[14px] font-bold flex items-center gap-2 text-white transition-all"
                  style={{ backgroundColor: '#57737a' }}
                >
                  <AlertTriangle size={16} /> New Report
                </button>
              </div>
              <div
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: '#ffffff', border: '1px solid #b0d8db' }}
              >
                <table className="w-full text-left text-sm" style={{ color: '#57737a' }}>
                  <thead style={{ backgroundColor: '#f4feff', borderBottom: '1px solid #b0d8db' }}>
                    <tr className="text-xs uppercase font-bold" style={{ color: '#57737a' }}>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Project / Issue</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Risk</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#e0f7f9' }}>
                    {loadingReports ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center" style={{ color: '#85bdbf' }}>Loading your reports...</td></tr>
                    ) : myReports.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center" style={{ color: '#85bdbf' }}>No reports filed yet. Click &apos;New Report&apos; to start!</td></tr>
                    ) : (
                      myReports.map((report) => (
                        <tr key={report.id} className="transition-colors hover:bg-[#f4feff]">
                          <td className="px-6 py-4 font-mono text-xs" style={{ color: '#85bdbf' }}>
                            {report.id.slice(0, 8).toUpperCase()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold" style={{ color: '#040f0f' }}>{report.category}</div>
                            <div className="text-xs truncate max-w-[200px] mt-0.5" style={{ color: '#57737a' }}>{report.notes}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${report.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                              report.status === 'Verified' ? 'text-[#57737a]' :
                                report.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                  'text-amber-700'
                              }`}
                              style={{
                                backgroundColor: report.status === 'Verified' ? '#e0f7f9' : report.status === 'Pending' ? '#fef3c7' : undefined,
                              }}
                            >
                              {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${report.ai_risk_level === "High" ? "bg-red-100 text-red-700" :
                              report.ai_risk_level === "Medium" ? "bg-amber-100 text-amber-700" :
                                report.ai_risk_level === "Low" ? "bg-green-100 text-green-700" :
                                  ""
                              }`}
                              style={{
                                backgroundColor: !report.ai_risk_level ? '#e0f7f9' : undefined,
                                color: !report.ai_risk_level ? '#57737a' : undefined,
                              }}
                            >
                              {report.ai_risk_level || 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs whitespace-nowrap">
                            {new Date(report.created_at).toLocaleDateString('en-GB')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* --- RTI TAB --- */}
          {activeTab === "rti" && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: '#040f0f' }}>RTI & Complaints</h2>
                  <p className="text-sm mt-1" style={{ color: '#57737a' }}>Manage your Right to Information requests</p>
                </div>
                <button
                  onClick={() => handleProtectedAction("new-rti")}
                  className="px-4 py-2 rounded-xl text-[14px] font-bold flex items-center gap-2 text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#57737a' }}
                >
                  <FileText size={16} /> File New RTI
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loadingRti ? (
                  <p style={{ color: '#85bdbf' }}>Loading RTI requests...</p>
                ) : myRtiRequests.length === 0 ? (
                  <p style={{ color: '#85bdbf' }}>No RTI requests filed yet.</p>
                ) : (
                  myRtiRequests.map((doc) => {
                    const response = doc.rti_response && doc.rti_response.length > 0 ? doc.rti_response[0] : null;
                    return (
                      <div
                        key={doc.id}
                        className="p-6 rounded-2xl transition-all group hover:shadow-lg hover:-translate-y-0.5"
                        style={{ backgroundColor: '#ffffff', border: '1px solid #b0d8db' }}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-3 rounded-xl" style={{ backgroundColor: '#e0f7f9' }}>
                            <FileText size={24} style={{ color: '#57737a' }} />
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${doc.status === 'Approved' ? 'bg-green-100 text-green-700' : doc.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}
                          >
                            {doc.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold mb-1 truncate" style={{ color: '#040f0f' }}>{doc.title}</h3>

                        {doc.status === 'Rejected' && response?.rejection_reason && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-800 flex items-start gap-2">
                            <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-600" />
                            <div><strong className="block mb-0.5">Admin Rejection Context:</strong>{response.rejection_reason}</div>
                          </div>
                        )}

                        {doc.status === 'Approved' && response?.response_text && (
                          <div className="mb-4 p-4 rounded-xl bg-green-50 text-sm flex items-start gap-3 border border-green-100">
                            <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-green-600" />
                            <div className="w-full">
                              <strong className="block mb-2 text-green-800">Official Resolution Response:</strong>
                              <div className="whitespace-pre-wrap text-[#57737a] leading-relaxed">
                                {response.response_text}
                              </div>
                            </div>
                          </div>
                        )}

                        <p className="text-xs font-mono mb-4" style={{ color: '#57737a' }}>{doc.department}</p>
                        <p className="text-xs font-mono mb-4" style={{ color: '#85bdbf' }}>
                          ID: {doc.id} • {new Date(doc.created_at).toLocaleDateString()}
                        </p>

                        {/* Prioritize Admin uploaded response attachments, then fallback to original extracted documents */}
                        {((response?.attachments && response.attachments.length > 0) || doc.extract_data?.document_url) && (
                          <a
                            href={(response?.attachments && response.attachments.length > 0) ? response.attachments[0] : doc.extract_data?.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 hover:bg-[#f4feff]"
                            style={{
                              border: '1px solid #b0d8db',
                              color: '#57737a',
                            }}
                          >
                            <Download size={16} /> Download Official Attachment
                          </a>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          )}

          {/* --- NEW RTI FORM TAB --- */}
          {activeTab === "new-rti" && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="py-2">
              <NewRtiTab
                onBack={() => {
                  setActiveTab("rti");
                  fetchRtiRequests(); // Refresh the list when coming back
                }}
              />
            </motion.div>
          )}

          {/* --- REPORT ISSUE TAB --- */}
          {activeTab === "reportissue" && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="py-2">
              <ReportIssueTab onBackToDashboard={() => setActiveTab("overview")} />
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
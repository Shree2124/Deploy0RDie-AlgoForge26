"use client";
import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  AlertTriangle, Settings, Search, CheckCircle2,
  TrendingUp, ShieldAlert, MoreHorizontal, Building2,
  Map as MapIcon, ChevronRight, ShieldCheck, XCircle, LocateFixed, Users, Filter
} from "lucide-react";
import { OfficialRecord, ProjectCategory, Report, RiskLevel } from "@/types/types";
import { supabase } from "@/lib/supabase/client";

// Import Recharts for AI Insights
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

// --- ERROR BOUNDARY FOR LEAFLET ISSUES ---
class MapErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any) { console.error("MapVisualizer Crash:", error); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-400 rounded-xl border border-dashed border-gray-300">
          <div className="text-center">
            <MapIcon className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Map rendering disabled due to data format error.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- DYNAMIC MAP IMPORT ---
const MapVisualizer = dynamic(() => import("@/components/MapView/Mapvisualizer"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full flex items-center justify-center animate-pulse rounded-xl" style={{ backgroundColor: "rgba(133, 189, 191, 0.15)" }}>
      <Building2 className="w-8 h-8" style={{ color: "#85bdbf" }} />
    </div>
  ),
});

// --- MOCK DATA FOR STATIC WIDGETS ---
const MOCK_RECORDS: OfficialRecord[] = [
  { id: "MCGM-001", projectName: "Marine Drive Resurfacing", category: ProjectCategory.ROAD, budget: 45000000, contractor: "Mumbai Infra Ltd", deadline: "2024-06-30", status: "Completed", location: { lat: 18.944, lng: 72.823 }, description: "Resurfacing." },
  { id: "MCGM-002", projectName: "Dadar Skywalk Repair", category: ProjectCategory.BUILDING, budget: 12000000, contractor: "Urban Connect", deadline: "2024-08-15", status: "In Progress", location: { lat: 19.0178, lng: 72.8478 }, description: "Repair." },
];

export default function AdminDashboardPage({ activeTab = "overview" }: { activeTab?: string }) {
  const tab = activeTab;

  const [reports, setReports] = useState<any[]>([]);
  const [records, setRecords] = useState<OfficialRecord[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [rtiRequests, setRtiRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const [totalCitizens, setTotalCitizens] = useState<number>(0);

  const [issueSearchTerm, setIssueSearchTerm] = useState("");
  const [issueRiskFilter, setIssueRiskFilter] = useState("All");

  const getRiskLabel = (report: any) => {
    if (!report.ai_risk_level) return "Pending AI";
    return report.ai_risk_level;
  };

  const getMainIssueDetail = (report: any) => {
    if (Array.isArray(report.ai_discrepancies) && report.ai_discrepancies.length > 0) {
      return report.ai_discrepancies[0];
    }
    if (report.notes) return report.notes;
    return "No details provided.";
  };

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Admin Reports
      try {
        const reportsRes = await fetch('/api/admin/reports');
        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          setReports(reportsData);
        }
      } catch (e) {
        console.error('Failed to fetch admin reports:', e);
      }

      // 2. Fetch KYC Verifications
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .not('aadhar_number', 'is', null)
        .order('updated_at', { ascending: false });

      if (!verifyError && verifyData) {
        setVerifications(verifyData);
      }

      // 3. Fetch Total Citizen Count
      const { count: profileCount, error: profileCountError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (!profileCountError && profileCount !== null) {
        setTotalCitizens(profileCount);
      }

      // 4. Fetch Official Records
      try {
        const recordsRes = await fetch('/api/records');
        if (recordsRes.ok) {
          const recordsData = await recordsRes.json();
          setRecords(recordsData);
        }
      } catch (e) {
        console.error('Failed to fetch records:', e);
      }

      // 5. Fetch RTI Requests
      try {
        const rtiRes = await fetch(`/api/get-rti?timestamp=${Date.now()}`, { cache: 'no-store' });
        if (rtiRes.ok) {
          const rtiData = await rtiRes.json();
          const finalData = rtiData.data ? rtiData.data : rtiData;
          if (Array.isArray(finalData)) setRtiRequests(finalData);
        }
      } catch (e) {
        console.error('Failed to fetch RTI requests:', e);
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const mapReports: Report[] = useMemo(() => {
    return reports
      .filter((r: any) => r.latitude != null && r.longitude != null)
      .map((r: any) => {
        const riskMap: Record<string, RiskLevel> = {
          'High': RiskLevel.HIGH, 'Medium': RiskLevel.MEDIUM, 'Low': RiskLevel.LOW,
        };
        return {
          id: r.id,
          evidence: { image: r.image_url || '', timestamp: new Date(r.created_at).getTime(), coordinates: { lat: r.latitude, lng: r.longitude }, userComment: r.notes || undefined },
          auditResult: r.ai_risk_level ? { riskLevel: riskMap[r.ai_risk_level] || RiskLevel.UNKNOWN, discrepancies: r.ai_discrepancies || [], reasoning: r.ai_verdict || '', confidenceScore: 0.8 } : undefined,
          status: r.status === 'Verified' ? 'Verified' as const : r.status === 'Audited' ? 'Audited' as const : 'Pending' as const,
          category: r.category || 'Other',
        };
      });
  }, [reports]);

  const highRiskIssues = reports.filter((r) => r.ai_risk_level === 'High');
  const resolvedIssues = reports.filter((r) => r.status === 'Resolved');

  const pendingVerifications = verifications.filter(v => v.verification_status === 'Pending').length;
  const verifiedUsers = verifications.filter(v => v.verification_status === 'Approved').length;

  // --- 100% DYNAMIC PIE CHART DATA ---
  const pieData = useMemo(() => {
    const categoryCounts: Record<string, number> = {};

    reports.forEach(r => {
      // Handle cases where category might be null or undefined in old DB entries
      const cat = r.category || "Other";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Convert object to array and sort by highest value first
    return Object.entries(categoryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [reports]);

  // Consistent Color Mapping for Categories
  const CATEGORY_COLORS: Record<string, string> = {
    "General": "#ef4444",              // Red
    "Road & Potholes": "#f59e0b",      // Orange
    "Electricity & Streetlights": "#85bdbf", // Teal/Light Blue
    "Water & Sewage": "#10b981",       // Green
    "Building & Construction": "#57737a", // Dark Teal
    "Other": "#64748b"                 // Slate
  };
  const FALLBACK_COLORS = ['#57737a', '#85bdbf', '#f59e0b', '#ef4444', '#10b981'];

  const sortedReports = useMemo(() => {
    return [...reports].sort((a, b) => {
      const aTime = a?.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b?.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });
  }, [reports]);

  const filteredIssues = sortedReports.filter(r => {
    const matchesSearch =
      (r.category || "").toLowerCase().includes(issueSearchTerm.toLowerCase()) ||
      (r.id || "").toLowerCase().includes(issueSearchTerm.toLowerCase()) ||
      (r.notes || "").toLowerCase().includes(issueSearchTerm.toLowerCase());
    const matchesRisk = issueRiskFilter === "All" ? true : getRiskLabel(r) === issueRiskFilter;
    return matchesSearch && matchesRisk;
  });

  const issueRiskCounts = useMemo(() => {
    const counts: Record<string, number> = {
      High: 0,
      Medium: 0,
      Low: 0,
      Unknown: 0,
      "Pending AI": 0,
    };

    reports.forEach((r) => {
      const label = getRiskLabel(r);
      counts[label] = (counts[label] || 0) + 1;
    });

    return counts;
  }, [reports]);

  const contractorStats: Record<string, { id: string; total: number; highRisk: number; budget: number }> = {};
  MOCK_RECORDS.forEach((rec) => {
    if (!contractorStats[rec.contractor]) {
      const contractorId = rec.contractor.toLowerCase().replace(/\s+/g, "-");
      contractorStats[rec.contractor] = { id: contractorId, total: 0, highRisk: 0, budget: 0 };
    }
    contractorStats[rec.contractor].total += 1;
    contractorStats[rec.contractor].budget += rec.budget;
    contractorStats[rec.contractor].highRisk += 1;
  });

  const handleVerifyAction = async (userId: string, status: 'Approved' | 'Rejected') => {
    let reason = null;
    if (status === 'Rejected') {
      reason = prompt("Enter reason for KYC rejection:");
      if (!reason) return;
    }

    const { error } = await supabase.from('profiles').update({ verification_status: status, rejection_reason: reason }).eq('id', userId);

    if (!error) {
      alert(`User KYC successfully marked as ${status}`);
      setVerifications(verifications.map(v => v.id === userId ? { ...v, verification_status: status, rejection_reason: reason } : v));
    } else {
      alert("Failed to update status in DB.");
    }
  };

  const handleReportAction = async (reportId: string, status: 'Resolved' | 'Rejected') => {
    let reason = null;
    if (status === 'Rejected') {
      reason = prompt("Enter reason for report rejection:");
      if (!reason) return;
    }

    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason }),
      });

      if (res.ok) {
        alert(`Report successfully marked as ${status}`);
        setReports(reports.map(r => r.id === reportId ? {
          ...r,
          status,
          notes: reason ? `${r.notes || ''}\n\nAdmin Rejection Reason: ${reason}` : r.notes
        } : r));
      } else {
        alert("Failed to update report status.");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating report status.");
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-8 scroll-smooth" style={{ backgroundColor: "#f4feff" }}>
      <div className="max-w-7xl mx-auto text-slate-900 font-sans">

        {/* VIEW: OVERVIEW */}
        {tab === "overview" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Dynamic Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl shadow-sm" style={{ border: "1px solid #b0d8db" }}>
                <div className="text-xs font-bold uppercase mb-1" style={{ color: "#57737a" }}>Reports Managed</div>
                <div className="text-3xl font-bold" style={{ color: "#040f0f" }}>{loading ? "..." : reports.length}</div>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm" style={{ border: "1px solid #b0d8db" }}>
                <div className="text-xs font-bold uppercase mb-1" style={{ color: "#57737a" }}>High Risk Alerts</div>
                <div className="text-3xl font-bold text-red-600 flex items-center gap-2">{loading ? "..." : highRiskIssues.length} <AlertTriangle size={20} /></div>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm" style={{ border: "1px solid #b0d8db" }}>
                <div className="text-xs font-bold uppercase mb-1" style={{ color: "#57737a" }}>Issues Resolved</div>
                <div className="text-3xl font-bold flex items-center gap-2" style={{ color: "#57737a" }}>{loading ? "..." : resolvedIssues.length} <CheckCircle2 size={20} /></div>
              </div>
              <div className="p-5 rounded-xl shadow-sm flex flex-col justify-between" style={{ backgroundColor: "#1d6868ff", color: "#e8f9fa" }}>
                <div className="flex justify-between items-center mb-1">
                  <div className="text-xs font-bold uppercase" style={{ color: "#85bdbf" }}>Total Citizens</div>
                  <Users size={14} style={{ color: "#85bdbf" }} />
                </div>
                <div className="text-3xl font-bold flex items-center gap-2" style={{ color: "#c2fcf7" }}>
                  {loading ? "..." : totalCitizens.toLocaleString()}
                </div>
                <div className="text-[10px] font-semibold mt-1 flex justify-between">
                  <span className="text-green-400">{verifiedUsers} Verified</span>
                  <span className="text-amber-400">{pendingVerifications} Pending KYC</span>
                </div>
              </div>
            </div>

            {/* SPLIT VIEW: MAP & AI INSIGHT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[450px]">
              {/* MAP SECTION */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col" style={{ border: "1px solid #b0d8db" }}>
                <div className="px-6 py-3 flex justify-between items-center shrink-0" style={{ backgroundColor: "#e0f7f9", borderBottom: "1px solid #b0d8db" }}>
                  <h3 className="font-bold flex items-center gap-2 text-sm" style={{ color: "#040f0f" }}>
                    <MapIcon size={16} style={{ color: "#57737a" }} /> Live Infrastructure Map
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setLocating(true);
                        navigator.geolocation.getCurrentPosition(
                          (pos) => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); },
                          () => setLocating(false), { enableHighAccuracy: true }
                        );
                      }}
                      className="p-1.5 rounded-full transition-all hover:scale-105"
                      style={{ backgroundColor: userLocation ? '#dbeafe' : '#e0f7f9', border: '1px solid #b0d8db' }}
                    >
                      <LocateFixed size={14} className={locating ? 'animate-spin' : ''} style={{ color: userLocation ? '#2563eb' : '#57737a' }} />
                    </button>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ color: "#57737a", backgroundColor: "#c9fbff" }}>
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#85bdbf" }}></span> Live
                    </span>
                  </div>
                </div>
                <div className="flex-1 relative z-0">
                  <MapErrorBoundary>
                    <MapVisualizer records={records} reports={mapReports} onRecordSelect={() => { }} userLocation={userLocation} />
                  </MapErrorBoundary>
                </div>
              </div>

              {/* AI INSIGHT PIE CHART CARD */}
              <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm flex flex-col relative overflow-hidden" style={{ border: "1px solid #b0d8db" }}>
                <div className="p-5 flex-1 flex flex-col relative z-10">
                  <div className="flex justify-between items-center mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: "#e0f7f9", color: "#57737a", border: "1px solid #b0d8db" }}>
                      <TrendingUp size={12} /> Issue Distribution
                    </div>
                  </div>

                  {/* Dynamic Recharts PieChart */}
                  {pieData.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-sm font-medium" style={{ color: "#85bdbf" }}>
                      No reports available yet.
                    </div>
                  ) : (
                    <div className="w-full flex-1 min-h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={CATEGORY_COLORS[entry.name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: '#040f0f', color: '#fff', borderRadius: '8px', border: 'none' }}
                            itemStyle={{ color: '#c2fcf7' }}
                          />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#57737a', fontWeight: '600' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  <p className="text-xs leading-relaxed mt-4 pt-3 border-t" style={{ color: "#57737a", borderColor: "#e0f7f9" }}>
                    <strong style={{ color: "#040f0f" }}>AI Insight:</strong>
                    {pieData.length > 0 ? (
                      <> A high volume of reports are categorized under <strong style={{ color: "#040f0f" }}>{pieData[0].name}</strong> this week, signaling a potential systematic infrastructure anomaly.</>
                    ) : (
                      <> Insufficient data to generate insights. System monitoring is active.</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: ISSUES */}
        {tab === "issues" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Added Search and Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center" style={{ border: "1px solid #b0d8db" }}>
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: "#57737a" }} />
                <input
                  type="text"
                  placeholder="Search by Category or ID..."
                  value={issueSearchTerm}
                  onChange={(e) => setIssueSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg outline-none focus:ring-2"
                  style={{ backgroundColor: "#f4feff", border: "1px solid #b0d8db", color: "#040f0f", '--tw-ring-color': '#85bdbf' } as any}
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter size={16} style={{ color: "#57737a" }} />
                <select
                  value={issueRiskFilter}
                  onChange={(e) => setIssueRiskFilter(e.target.value)}
                  className="text-sm p-2 rounded-lg outline-none cursor-pointer w-full sm:w-auto"
                  style={{ backgroundColor: "#f4feff", border: "1px solid #b0d8db", color: "#040f0f" }}
                >
                  <option value="All">All Risks</option>
                  <option value="High">High Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="Low">Low Risk</option>
                  <option value="Unknown">Unknown</option>
                  <option value="Pending AI">Pending AI</option>
                </select>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm" style={{ border: "1px solid #b0d8db" }}>
              <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide">
                <span className="px-2 py-1 rounded" style={{ backgroundColor: "#f4feff", color: "#57737a", border: "1px solid #b0d8db" }}>
                  Total: {reports.length}
                </span>
                <span className="px-2 py-1 rounded bg-red-100 text-red-700">High: {issueRiskCounts.High || 0}</span>
                <span className="px-2 py-1 rounded bg-orange-100 text-orange-700">Medium: {issueRiskCounts.Medium || 0}</span>
                <span className="px-2 py-1 rounded bg-green-100 text-green-700">Low: {issueRiskCounts.Low || 0}</span>
                <span className="px-2 py-1 rounded bg-slate-100 text-slate-700">Unknown: {issueRiskCounts.Unknown || 0}</span>
                <span className="px-2 py-1 rounded" style={{ backgroundColor: "#e0f7f9", color: "#57737a" }}>
                  Pending AI: {issueRiskCounts["Pending AI"] || 0}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-500 font-medium">Loading issues from the database...</div>
            ) : filteredIssues.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl" style={{ color: "#57737a", border: "1px solid #b0d8db" }}>No matching issues found.</div>
            ) : (
              <div className="space-y-3">
                {filteredIssues.map((report) => {
                  const riskLabel = getRiskLabel(report);
                  const riskBadgeClass =
                    riskLabel === "High"
                      ? "bg-red-100 text-red-700"
                      : riskLabel === "Medium"
                        ? "bg-orange-100 text-orange-700"
                        : riskLabel === "Low"
                          ? "bg-green-100 text-green-700"
                          : riskLabel === "Unknown"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-[#e0f7f9] text-[#57737a]";

                  return (
                    <div key={report.id} className="bg-white p-5 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start gap-4 hover:shadow-md transition-shadow" style={{ border: "1px solid #b0d8db" }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase flex items-center gap-1 ${riskBadgeClass}`}>
                            {riskLabel === "High" && <ShieldAlert size={12} />}
                            {riskLabel}
                          </span>
                          <span className="text-xs font-mono" style={{ color: "#85bdbf" }}>#{report.id?.substring(0, 8).toUpperCase()}</span>
                          <span className="px-2 py-0.5 rounded text-xs font-bold border" style={{
                            borderColor: report.status === 'Resolved' ? "#85bdbf" : "#b0d8db",
                            backgroundColor: report.status === 'Resolved' ? "#e0f7f9" : "#f4feff",
                            color: report.status === 'Resolved' ? "#57737a" : "#85bdbf"
                          }}>
                            {report.status || "Pending"}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold" style={{ color: "#040f0f" }}>
                          {report.category || "General"}
                        </h3>

                        <div className="mt-2 text-sm p-3 rounded-lg" style={{ backgroundColor: "#f4feff", color: "#57737a", border: "1px solid #e0f7f9" }}>
                          <p>
                            <span className="font-bold" style={{ color: "#040f0f" }}>Main Detail:</span> {getMainIssueDetail(report)}
                          </p>
                          {report.notes && (
                            <p className="mt-1">
                              <span className="font-bold" style={{ color: "#040f0f" }}>Citizen Note:</span> {report.notes}
                            </p>
                          )}
                        </div>

                        <div className="mt-2 text-xs flex flex-wrap gap-x-4 gap-y-1" style={{ color: "#57737a" }}>
                          <span><strong style={{ color: "#040f0f" }}>Reported:</strong> {report.created_at ? new Date(report.created_at).toLocaleString() : "N/A"}</span>
                          <span><strong style={{ color: "#040f0f" }}>Location:</strong> {report.latitude != null && report.longitude != null ? `${Number(report.latitude).toFixed(5)}, ${Number(report.longitude).toFixed(5)}` : "N/A"}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 min-w-[170px] w-full md:w-auto">
                        <Link href={`/admin/reports/${report.id}`}>
                          <button className="px-4 py-2 text-sm rounded-lg font-medium w-full text-left flex justify-between items-center group transition-colors" style={{ backgroundColor: "#e0f7f9", color: "#040f0f" }}>
                            View Details <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        </Link>
                        {report.status !== 'Resolved' && report.status !== 'Rejected' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleReportAction(report.id, 'Resolved')} className="flex-1 py-1.5 px-3 text-[11px] uppercase tracking-wider rounded font-bold bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-200 shadow-sm">
                              Approve
                            </button>
                            <button onClick={() => handleReportAction(report.id, 'Rejected')} className="flex-1 py-1.5 px-3 text-[11px] uppercase tracking-wider rounded font-bold bg-red-50 text-red-700 hover:bg-red-100 transition-colors border border-red-200 shadow-sm">
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW: VERIFICATIONS (NEW KYC TAB) */}
        {tab === "verifications" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: "1px solid #b0d8db" }}>
              <table className="w-full text-left text-sm" style={{ color: "#57737a" }}>
                <thead style={{ backgroundColor: "#f4feff", borderBottom: "1px solid #b0d8db" }}>
                  <tr className="text-xs uppercase font-bold">
                    <th className="px-6 py-4">Citizen Name / ID</th>
                    <th className="px-6 py-4">Phone Number</th>
                    <th className="px-6 py-4">Aadhar (Gov Format)</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "#e0f7f9" }}>
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center">Loading KYC submissions...</td></tr>
                  ) : verifications.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center">No KYC submissions found.</td></tr>
                  ) : (
                    verifications.map((v) => (
                      <tr key={v.id} className="hover:bg-[#f4feff] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold" style={{ color: "#040f0f" }}>{v.full_name || 'Citizen'}</div>
                          <div className="text-xs font-mono truncate w-32">{v.id}</div>
                        </td>
                        <td className="px-6 py-4 font-mono font-medium">{v.phone}</td>
                        <td className="px-6 py-4 font-mono font-medium tracking-widest text-slate-900 group relative">
                          <span className="group-hover:hidden">XXXX-XXXX-{v.aadhar_number?.slice(-4) || '0000'}</span>
                          <span className="hidden group-hover:inline bg-yellow-100 text-yellow-800 px-1 rounded">
                            {v.aadhar_number?.replace(/(.{4})/g, '$1-').slice(0, -1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${v.verification_status === 'Approved' ? 'bg-green-100 text-green-700' : v.verification_status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {v.verification_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                          {v.verification_status === 'Pending' && (
                            <>
                              <button onClick={() => handleVerifyAction(v.id, 'Rejected')} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors" title="Reject KYC"><XCircle size={18} /></button>
                              <button onClick={() => handleVerifyAction(v.id, 'Approved')} className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors" title="Approve KYC"><CheckCircle2 size={18} /></button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW: RTI REQUESTS */}
        {tab === "rti" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ border: "1px solid #b0d8db" }}>
            <div className="px-6 py-4 flex justify-between items-center" style={{ backgroundColor: "#e0f7f9", borderBottom: "1px solid #b0d8db" }}>
              <h3 className="font-bold" style={{ color: "#040f0f" }}>RTI Drafts & Requests</h3>
              <div className="relative">
                <Search className="absolute left-2 top-1.5" size={14} style={{ color: "#57737a" }} />
                <input type="text" placeholder="Search RTI..." className="pl-7 pr-3 py-1 text-sm bg-white rounded-md focus:outline-none" style={{ border: "1px solid #b0d8db", color: "#040f0f" }} />
              </div>
            </div>
            <table className="w-full text-left">
              <thead className="text-xs font-bold uppercase" style={{ backgroundColor: "#f4feff", borderBottom: "1px solid #b0d8db", color: "#57737a" }}>
                <tr>
                  <th className="px-6 py-4">RTI ID</th><th className="px-6 py-4">Subject</th><th className="px-6 py-4">Citizen</th><th className="px-6 py-4">Date</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody style={{ borderColor: "#e0f7f9" }} className="divide-y">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading RTI requests...</td></tr>
                ) : rtiRequests.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No RTI requests found.</td></tr>
                ) : rtiRequests.map((rti) => (
                  <tr key={rti.id} className="transition-colors hover:bg-[#f4feff]">
                    <td className="px-6 py-4 font-mono text-xs" style={{ color: "#85bdbf" }}>{rti.id}</td>
                    <td className="px-6 py-4 font-bold text-sm" style={{ color: "#040f0f" }}>{rti.title}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: "#57737a" }}>{rti.is_anonymous ? 'Anonymous' : rti.user_id?.substring(0, 8) + '...'}</td>
                    <td className="px-6 py-4 text-sm font-mono" style={{ color: "#85bdbf" }}>{new Date(rti.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${rti.status === "Approved" ? "bg-green-100 text-green-700" : rti.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-[#e0f7f9] text-[#57737a]"}`}>{rti.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/rti/${rti.id}`} className="text-xs font-bold hover:underline" style={{ color: "#57737a" }}>Review</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
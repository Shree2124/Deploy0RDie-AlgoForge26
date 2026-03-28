"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  AlertTriangle, Settings, Search, CheckCircle2,
  TrendingUp, ShieldAlert, MoreHorizontal, Building2,
  Map as MapIcon, ChevronRight, ShieldCheck, XCircle
} from "lucide-react";
import { OfficialRecord, ProjectCategory } from "@/types/types";
import { supabase } from "@/lib/supabase/client";

// --- DYNAMIC MAP IMPORT ---
const MapVisualizer = dynamic(() => import("@/components/MapView/Mapvisualizer"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full flex items-center justify-center animate-pulse rounded-xl" style={{ backgroundColor: "rgba(133, 189, 191, 0.15)" }}>
      <Building2 className="w-8 h-8" style={{ color: "#85bdbf" }} />
    </div>
  ),
});

// --- MOCK DATA (Kept for Map, RTI, Contractors & System to preserve your UI) ---
const MOCK_RECORDS: OfficialRecord[] = [
  { id: "MCGM-001", projectName: "Marine Drive Resurfacing", category: ProjectCategory.ROAD, budget: 45000000, contractor: "Mumbai Infra Ltd", deadline: "2024-06-30", status: "Completed", location: { lat: 18.944, lng: 72.823 }, description: "Resurfacing." },
  { id: "MCGM-002", projectName: "Dadar Skywalk Repair", category: ProjectCategory.BUILDING, budget: 12000000, contractor: "Urban Connect", deadline: "2024-08-15", status: "In Progress", location: { lat: 19.0178, lng: 72.8478 }, description: "Repair." },
];

const MOCK_USERS = [
  { id: 1, name: "Rahul S.", email: "rahul@example.com", role: "Citizen", status: "Active" },
  { id: 2, name: "Admin User", email: "admin@civic.ai", role: "Admin", status: "Active" },
  { id: 3, name: "Bot Account", email: "spam@bot.com", role: "Citizen", status: "Flagged" },
];

const MOCK_RTI_REQUESTS = [
  { id: "RTI-2025-101", subject: "Request for Tender Docs - Dadar Skywalk", citizen: "Rahul S.", status: "Pending Review", date: "2025-10-12" },
  { id: "RTI-2025-102", subject: "Road Budget Inquiry - Andheri", citizen: "Anjali M.", status: "Approved", date: "2025-10-10" },
  { id: "RTI-2025-103", subject: "Drainage Contract Details", citizen: "Vikram R.", status: "Rejected", date: "2025-10-08" },
];

export default function AdminDashboardPage({ activeTab = "overview" }: { activeTab?: string }) {
  const [tab, setTab] = useState(activeTab);

  // --- DYNAMIC DATA STATE ---
  const [reports, setReports] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [rtiRequests, setRtiRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Live Reports & Verifications from Database
  useEffect(() => {
    const fetchData = async () => {
      const { data: reportsData, error: reportsError } = await supabase
        .from('citizen_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (!reportsError && reportsData) {
        setReports(reportsData);
      }

      // Fetch Profiles that have submitted Aadhar
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .not('aadhar_number', 'is', null)
        .order('updated_at', { ascending: false });

      if (!verifyError && verifyData) {
        setVerifications(verifyData);
      }

      // Fetch RTI Requests
      const rtiRes = await fetch('/api/get-rti');
      if (rtiRes.ok) {
        const rtiData = await rtiRes.json();
        setRtiRequests(rtiData);
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  // --- DERIVED STATS ---
  const highRiskIssues = reports.filter((r) => r.ai_risk_level === 'High');
  const resolvedIssues = reports.filter((r) => r.status === 'Resolved');
  const pendingVerifications = verifications.filter(v => v.verification_status === 'Pending');

  // Contractor Stats Logic
  const contractorStats: Record<string, { id: string; total: number; highRisk: number; budget: number }> = {};
  MOCK_RECORDS.forEach((rec) => {
    if (!contractorStats[rec.contractor]) {
      const contractorId = rec.contractor.toLowerCase().replace(/\s+/g, "-");
      contractorStats[rec.contractor] = { id: contractorId, total: 0, highRisk: 0, budget: 0 };
    }
    contractorStats[rec.contractor].total += 1;
    contractorStats[rec.contractor].budget += rec.budget;
    contractorStats[rec.contractor].highRisk += 1; // Mocking risk for UI
  });

  // Handle KYC Actions
  const handleVerifyAction = async (userId: string, status: 'Approved' | 'Rejected') => {
    let reason = null;
    if (status === 'Rejected') {
      reason = prompt("Enter reason for KYC rejection:");
      if (!reason) return; // Cancelled
    }

    const { error } = await supabase.from('profiles').update({ verification_status: status, rejection_reason: reason }).eq('id', userId);

    if (!error) {
      alert(`User KYC successfully marked as ${status}`);
      setVerifications(verifications.map(v => v.id === userId ? { ...v, verification_status: status, rejection_reason: reason } : v));
    } else {
      alert("Failed to update status in DB.");
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-8 scroll-smooth" style={{ backgroundColor: "#f4feff" }}>
      <div className="max-w-7xl mx-auto text-slate-900 font-sans">

        {/* TOP TAB NAV (With new Verifications Tab) */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setTab("overview")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'overview' ? 'bg-[#57737a] text-white shadow-lg' : 'bg-white text-[#57737a] border border-[#b0d8db]'}`}>Overview</button>
          <button onClick={() => setTab("issues")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'issues' ? 'bg-[#57737a] text-white shadow-lg' : 'bg-white text-[#57737a] border border-[#b0d8db]'}`}>Issues & Risk</button>
          <button onClick={() => setTab("verifications")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${tab === 'verifications' ? 'bg-[#57737a] text-white shadow-lg' : 'bg-white text-[#57737a] border border-[#b0d8db]'}`}>
            <ShieldCheck size={16} /> Citizen KYC
            {pendingVerifications.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingVerifications.length}</span>}
          </button>
          <button onClick={() => setTab("rti")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'rti' ? 'bg-[#57737a] text-white shadow-lg' : 'bg-white text-[#57737a] border border-[#b0d8db]'}`}>RTI</button>
          <button onClick={() => setTab("contractors")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'contractors' ? 'bg-[#57737a] text-white shadow-lg' : 'bg-white text-[#57737a] border border-[#b0d8db]'}`}>Contractors</button>
          <button onClick={() => setTab("system")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'system' ? 'bg-[#57737a] text-white shadow-lg' : 'bg-white text-[#57737a] border border-[#b0d8db]'}`}>System</button>
        </div>

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
              <div className="p-5 rounded-xl shadow-sm" style={{ backgroundColor: "#040f0f", color: "#e8f9fa" }}>
                <div className="text-xs font-bold uppercase mb-1" style={{ color: "#85bdbf" }}>System Health</div>
                <div className="text-3xl font-bold flex items-center gap-2" style={{ color: "#c2fcf7" }}>
                  99.9% <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: "#c2fcf7" }}></span>
                </div>
              </div>
            </div>

            {/* SPLIT VIEW: MAP & AI INSIGHT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[350px]">
              {/* MAP SECTION */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col" style={{ border: "1px solid #b0d8db" }}>
                <div className="px-6 py-3 flex justify-between items-center shrink-0" style={{ backgroundColor: "#e0f7f9", borderBottom: "1px solid #b0d8db" }}>
                  <h3 className="font-bold flex items-center gap-2 text-sm" style={{ color: "#040f0f" }}>
                    <MapIcon size={16} style={{ color: "#57737a" }} /> Live Infrastructure Map
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ color: "#57737a", backgroundColor: "#c9fbff" }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#85bdbf" }}></span> Live
                  </span>
                </div>
                <div className="flex-1 relative z-0">
                  <MapVisualizer records={MOCK_RECORDS} reports={[]} onRecordSelect={() => { }} />
                </div>
              </div>

              {/* AI INSIGHT CARD */}
              <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden group transition-all cursor-default" style={{ border: "1px solid #b0d8db" }}>
                <div className="p-6 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide mb-4" style={{ backgroundColor: "#e0f7f9", color: "#57737a", border: "1px solid #b0d8db" }}>
                    <TrendingUp size={12} /> AI Insight
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: "#040f0f" }}>Risk Anomaly in Zone 4</h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "#57737a" }}>
                    Our models detected a cluster of reports linked to <strong style={{ color: "#040f0f" }}>"Mumbai Infra"</strong>. Their discrepancy rate has spiked to <span className="text-red-600 font-bold bg-red-50 px-1 rounded">35%</span> this week.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: ISSUES */}
        {tab === "issues" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {loading ? (
              <div className="p-8 text-center text-slate-500 font-medium">Loading issues from the database...</div>
            ) : reports.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl" style={{ color: "#57737a", border: "1px solid #b0d8db" }}>No issues reported yet.</div>
            ) : (
              reports.map((report) => (
                <div key={report.id} className="bg-white p-5 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start gap-4 hover:shadow-md transition-shadow" style={{ border: "1px solid #b0d8db" }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase flex items-center gap-1 ${report.ai_risk_level === 'High' ? "bg-red-100 text-red-700" : report.ai_risk_level === 'Medium' ? "bg-orange-100 text-orange-700" : "bg-[#e0f7f9] text-[#57737a]"}`}>
                        {report.ai_risk_level === 'High' && <ShieldAlert size={12} />}
                        {report.ai_risk_level || 'Pending'} Risk
                      </span>
                      <span className="text-xs font-mono" style={{ color: "#85bdbf" }}>#{report.id.substring(0, 8).toUpperCase()}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-bold border" style={{
                        borderColor: report.status === 'Resolved' ? "#85bdbf" : "#b0d8db",
                        backgroundColor: report.status === 'Resolved' ? "#e0f7f9" : "#f4feff",
                        color: report.status === 'Resolved' ? "#57737a" : "#85bdbf"
                      }}>
                        {report.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: "#040f0f" }}>{report.category}</h3>
                    <p className="text-sm mt-1 p-3 rounded-lg inline-block" style={{ backgroundColor: "#f4feff", color: "#57737a", border: "1px solid #e0f7f9" }}>
                      <span className="font-bold" style={{ color: "#040f0f" }}>Discrepancy:</span> "{report.ai_discrepancies ? report.ai_discrepancies[0] : report.notes}"
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 min-w-[160px]">
                    <Link href={`/admin/reports/${report.id}`}>
                      <button className="px-4 py-2 text-sm rounded-lg font-medium w-full text-left flex justify-between items-center group transition-colors" style={{ backgroundColor: "#e0f7f9", color: "#040f0f" }}>
                        View Details <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  </div>
                </div>
              ))
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

        {/* VIEW: CONTRACTORS */}
        {tab === "contractors" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ border: "1px solid #b0d8db" }}>
            <table className="w-full text-left">
              <thead className="text-xs font-bold uppercase" style={{ backgroundColor: "#f4feff", borderBottom: "1px solid #b0d8db", color: "#57737a" }}>
                <tr><th className="px-6 py-4">Contractor</th><th className="px-6 py-4">Projects</th><th className="px-6 py-4">Budget Managed</th><th className="px-6 py-4">Risk Profile</th><th className="px-6 py-4 text-right">Actions</th></tr>
              </thead>
              <tbody style={{ borderColor: "#e0f7f9" }} className="divide-y">
                {Object.entries(contractorStats).map(([name, stat], idx) => {
                  const riskPercentage = stat.total > 0 ? (stat.highRisk / stat.total) * 100 : 0;
                  return (
                    <tr key={idx} className="transition-colors hover:bg-[#f4feff]">
                      <td className="px-6 py-4"><Link href={`/admin/contractor/${stat.id}`} className="font-bold hover:underline" style={{ color: "#040f0f" }}>{name}</Link></td>
                      <td className="px-6 py-4 text-sm" style={{ color: "#57737a" }}>{stat.total} Active</td>
                      <td className="px-6 py-4 font-mono text-sm" style={{ color: "#85bdbf" }}>₹{(stat.budget / 10000000).toFixed(2)} Cr</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#e0f7f9" }}>
                            <div className={`h-full rounded-full ${riskPercentage > 30 ? "bg-red-500" : "bg-[#57737a]"}`} style={{ width: `${Math.max(riskPercentage, 5)}%` }} />
                          </div>
                          <span className={`text-xs font-bold ${riskPercentage > 30 ? "text-red-600" : "text-[#57737a]"}`}>{riskPercentage.toFixed(0)}% Risk</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right"><button className="hover:opacity-75" style={{ color: "#57737a" }}><MoreHorizontal size={20} /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW: SYSTEM ADMIN */}
        {tab === "system" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: "1px solid #b0d8db" }}>
              <div className="px-6 py-4 flex justify-between items-center" style={{ backgroundColor: "#e0f7f9", borderBottom: "1px solid #b0d8db" }}>
                <h3 className="font-bold" style={{ color: "#040f0f" }}>User Management</h3>
                <div className="relative">
                  <Search className="absolute left-2 top-1.5" size={14} style={{ color: "#57737a" }} />
                  <input type="text" placeholder="Search..." className="pl-7 pr-3 py-1 text-sm bg-white rounded-md focus:outline-none" style={{ border: "1px solid #b0d8db", color: "#040f0f" }} />
                </div>
              </div>
              <table className="w-full text-left">
                <thead className="text-xs font-bold uppercase" style={{ backgroundColor: "#f4feff", borderBottom: "1px solid #b0d8db", color: "#57737a" }}>
                  <tr><th className="px-6 py-3">User</th><th className="px-6 py-3">Role</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Action</th></tr>
                </thead>
                <tbody style={{ borderColor: "#e0f7f9" }} className="divide-y">
                  {MOCK_USERS.map((u) => (
                    <tr key={u.id} className="hover:bg-[#f4feff]">
                      <td className="px-6 py-3"><div className="font-medium text-sm" style={{ color: "#040f0f" }}>{u.name}</div><div className="text-xs" style={{ color: "#85bdbf" }}>{u.email}</div></td>
                      <td className="px-6 py-3 text-sm" style={{ color: "#57737a" }}>{u.role}</td>
                      <td className="px-6 py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{u.status}</span></td>
                      <td className="px-6 py-3 text-right"><button className="text-xs font-bold hover:underline" style={{ color: "#57737a" }}>Edit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: "1px solid #b0d8db" }}>
              <h3 className="font-bold mb-6 flex items-center gap-2" style={{ color: "#040f0f" }}><Settings size={18} style={{ color: "#57737a" }} /> Platform Configuration</h3>
              <div className="space-y-6">
                {[
                  { label: "Strict AI Verification", desc: "Higher confidence threshold (95%)", active: true },
                  { label: "Anonymous Reporting", desc: "Allow reports without login", active: true },
                  { label: "Maintenance Mode", desc: "Disable user submissions", active: false },
                ].map((setting, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold" style={{ color: "#040f0f" }}>{setting.label}</div>
                      <div className="text-xs" style={{ color: "#57737a" }}>{setting.desc}</div>
                    </div>
                    <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${setting.active ? "bg-[#57737a]" : "bg-[#e0f7f9]"}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${setting.active ? "right-1 shadow-sm" : "left-1 border border-[#b0d8db]"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
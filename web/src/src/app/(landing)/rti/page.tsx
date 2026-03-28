"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, FileText, Send, Paperclip, AlertCircle, CheckCircle2,
  Building2, Link as LinkIcon, Loader2, X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";

export default function FileRTIPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  // State for user's verified reports to use as evidence
  const [verifiedReports, setVerifiedReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    department: "Municipal Corporation",
    subject: "",
    query: "",
    linkedReportId: "",
    file: null as File | null,
  });

  // Fetch verified reports for evidence linking
  useEffect(() => {
    if (!user) return;
    const fetchVerifiedReports = async () => {
      const { data, error } = await supabase
        .from('citizen_reports')
        .select('id, category, created_at, ai_risk_level')
        .eq('user_id', user.id)
        .eq('status', 'Verified')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setVerifiedReports(data);
      }
      setLoadingReports(false);
    };
    fetchVerifiedReports();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to file an RTI.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = new FormData();
      payload.append("department", formData.department);
      payload.append("subject", formData.subject);
      payload.append("query", formData.query);
      payload.append("userId", user.id);
      
      if (formData.linkedReportId) {
        payload.append("linkedReportId", formData.linkedReportId);
      }
      if (formData.file) {
        payload.append("file", formData.file);
      }

      const res = await fetch("/api/rti", {
        method: "POST",
        body: payload,
      });

      if (!res.ok) throw new Error("Failed to submit RTI application");

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard?tab=rti");
      }, 2500);

    } catch (err: any) {
      setError(err.message || "An error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4feff] p-4 lg:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <button className="p-2 bg-white border border-[#b0d8db] rounded-lg hover:bg-[#e0f7f9] transition-colors" style={{ color: '#57737a' }}>
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#040f0f' }}>File Right to Information (RTI)</h1>
            <p className="text-sm mt-1" style={{ color: '#57737a' }}>Request official information or documents directly from government departments.</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="bg-white rounded-2xl border border-[#b0d8db] shadow-sm p-12 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#040f0f' }}>RTI Application Submitted!</h2>
              <p className="text-[#57737a] max-w-md">
                Your request has been securely forwarded to the respective department. You can track its status in your dashboard.
              </p>
            </motion.div>
          ) : (
            <motion.form 
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-[#b0d8db] shadow-sm overflow-hidden"
            >
              {/* Form Banner */}
              <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: '#e0f7f9', borderBottom: '1px solid #b0d8db' }}>
                <div className="p-2 bg-white rounded-lg"><Building2 size={20} style={{ color: '#57737a' }}/></div>
                <p className="text-sm font-bold" style={{ color: '#040f0f' }}>Section 6(1) of the RTI Act, 2005</p>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                {/* Linked Evidence Section (The Hackathon Winner Feature) */}
                <div className="p-5 rounded-xl border-2 border-dashed" style={{ borderColor: '#b0d8db', backgroundColor: '#f4feff' }}>
                  <label className="block text-sm font-bold mb-2 flex items-center gap-2" style={{ color: '#040f0f' }}>
                    <LinkIcon size={16} style={{ color: '#85bdbf' }}/> Attach Verified Evidence (Highly Recommended)
                  </label>
                  <p className="text-xs mb-4" style={{ color: '#57737a' }}>Linking an AI-Verified report drastically increases response rate and accountability.</p>
                  
                  {loadingReports ? (
                    <div className="text-sm text-slate-400">Loading your verified reports...</div>
                  ) : verifiedReports.length === 0 ? (
                    <div className="text-sm italic" style={{ color: '#85bdbf' }}>No verified reports available to link yet.</div>
                  ) : (
                    <select 
                      name="linkedReportId" 
                      value={formData.linkedReportId} 
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl focus:outline-none bg-white transition-all"
                      style={{ border: '1px solid #b0d8db', color: formData.linkedReportId ? '#040f0f' : '#57737a' }}
                    >
                      <option value="">-- Do not link any evidence --</option>
                      {verifiedReports.map(report => (
                        <option key={report.id} value={report.id}>
                          {report.category} ({report.ai_risk_level} Risk) - {new Date(report.created_at).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#040f0f' }}>Target Department</label>
                    <select 
                      name="department" 
                      value={formData.department} 
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl focus:outline-none transition-all"
                      style={{ border: '1px solid #b0d8db', backgroundColor: '#f4feff', color: '#040f0f' }}
                    >
                      <option>Municipal Corporation (MCGM)</option>
                      <option>Public Works Department (PWD)</option>
                      <option>Water Supply Board</option>
                      <option>Electricity & Power Board</option>
                      <option>Urban Development Authority</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#040f0f' }}>Subject</label>
                    <input 
                      required type="text" name="subject"
                      value={formData.subject} onChange={handleChange}
                      placeholder="e.g. Budget breakdown for Dadar Skywalk"
                      className="w-full p-3 rounded-xl focus:outline-none transition-all"
                      style={{ border: '1px solid #b0d8db', backgroundColor: '#f4feff', color: '#040f0f' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#040f0f' }}>Detailed Query / Information Required</label>
                  <textarea 
                    required name="query" rows={6}
                    value={formData.query} onChange={handleChange}
                    placeholder="I, a citizen of India, kindly request the following information under the RTI Act, 2005..."
                    className="w-full p-3 rounded-xl focus:outline-none transition-all resize-none"
                    style={{ border: '1px solid #b0d8db', backgroundColor: '#f4feff', color: '#040f0f' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#040f0f' }}>Additional Documents (Optional)</label>
                  <div className="flex items-center gap-4">
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-white rounded-lg flex items-center gap-2 font-medium transition-colors hover:bg-slate-50"
                      style={{ border: '1px solid #b0d8db', color: '#57737a' }}
                    >
                      <Paperclip size={16} /> Choose File
                    </button>
                    <span className="text-sm font-mono truncate max-w-[200px]" style={{ color: '#85bdbf' }}>
                      {formData.file ? formData.file.name : "No file chosen"}
                    </span>
                    {formData.file && (
                      <button type="button" onClick={() => setFormData({...formData, file: null})} className="text-red-400 hover:text-red-600">
                        <X size={16} />
                      </button>
                    )}
                    <input 
                      type="file" ref={fileInputRef} onChange={handleFileChange}
                      className="hidden" accept=".pdf,.jpg,.jpeg,.png" 
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end" style={{ borderTop: '1px solid #e0f7f9' }}>
                  <button 
                    type="submit" disabled={loading || !formData.subject || !formData.query}
                    className="px-6 py-3 font-bold rounded-xl text-white transition-all flex items-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: '#57737a', boxShadow: '0 4px 14px rgba(87, 115, 122, 0.2)' }}
                  >
                    {loading ? (
                      <><Loader2 size={18} className="animate-spin" /> Processing...</>
                    ) : (
                      <><Send size={18} /> Submit Application</>
                    )}
                  </button>
                </div>

              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
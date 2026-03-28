"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Clock, Loader2, Building2, HelpCircle, User } from "lucide-react";

export default function AdminRtiReviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [rtiData, setRtiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Rejection Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchRti = async () => {
      try {
        const res = await fetch(`/api/get-rti/${id}`);
        if (!res.ok) throw new Error("RTI Request not found");
        const data = await res.json();
        setRtiData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRti();
  }, [id]);

  const handleAction = async (status: 'Approved' | 'Rejected' | 'Pending', reason?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/update-rti-status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setSuccess(true);
      setTimeout(() => router.push("/admin/dashboard?tab=rti"), 1500);
    } catch (err: any) {
      alert(err.message);
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4feff] p-4 lg:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard?tab=rti">
            <button className="p-2 bg-white border border-[#b0d8db] rounded-lg hover:bg-[#e0f7f9] transition-colors" style={{ color: '#57737a' }}>
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#040f0f' }}>RTI Request Review</h1>
            <p className="text-sm mt-1" style={{ color: '#57737a' }}>Officially evaluate and resolve citizen information requests.</p>
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
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#040f0f' }}>RTI Application Processed</h2>
              <p className="text-[#57737a] max-w-md">
                The administrative decision has been securely logged. Returning to dashboard...
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-[#b0d8db] shadow-sm overflow-hidden"
            >
              {/* Form Banner */}
              <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: '#e0f7f9', borderBottom: '1px solid #b0d8db' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg"><Building2 size={20} style={{ color: '#57737a' }} /></div>
                  <p className="text-sm font-bold" style={{ color: '#040f0f' }}>Request Details view</p>
                </div>
                <div className="text-xs font-mono font-bold px-3 py-1 rounded bg-white" style={{ color: '#85bdbf', border: '1px solid #b0d8db' }}>
                  #{id}
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                {loading ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-400" /></div>
                ) : error ? (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm text-center">
                    {error}
                  </div>
                ) : rtiData && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 rounded-xl" style={{ backgroundColor: '#f4feff', border: '1px solid #b0d8db' }}>
                        <div className="text-xs uppercase font-bold mb-1" style={{ color: '#85bdbf' }}>Target Department</div>
                        <div className="font-bold" style={{ color: '#040f0f' }}>{rtiData.department}</div>
                      </div>
                      <div className="p-4 rounded-xl" style={{ backgroundColor: '#f4feff', border: '1px solid #b0d8db' }}>
                        <div className="text-xs uppercase font-bold mb-1" style={{ color: '#85bdbf' }}>Citizen ID</div>
                        <div className="font-bold font-mono text-sm" style={{ color: '#040f0f' }}>
                          {rtiData.is_anonymous ? "Anonymous" : rtiData.user_id}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs uppercase font-bold mb-2 pl-1" style={{ color: '#57737a' }}>Subject line</div>
                      <div className="w-full p-4 rounded-xl font-bold bg-white" style={{ border: '1px solid #b0d8db', color: '#040f0f' }}>
                        {rtiData.title}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs uppercase font-bold mb-2 pl-1" style={{ color: '#57737a' }}>Detailed Query / Information Requested</div>
                      <div className="w-full p-4 rounded-xl bg-white whitespace-pre-wrap" style={{ border: '1px solid #b0d8db', color: '#040f0f', minHeight: '120px' }}>
                        {rtiData.description}

                        {rtiData.questions && rtiData.questions.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-dashed border-[#b0d8db]">
                            <p className="text-xs font-bold uppercase mb-2">Specific Questions:</p>
                            <ul className="list-disc pl-5 text-sm space-y-1">
                              {rtiData.questions.map((q: string, i: number) => <li key={i}>{q}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Panel */}
                    <div className="pt-6 mt-6 flex flex-col sm:flex-row gap-3 justify-end" style={{ borderTop: '1px solid #e0f7f9' }}>
                      <button
                        onClick={() => setRejectModalOpen(true)}
                        disabled={actionLoading}
                        className="px-6 py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                      >
                        <XCircle size={18} /> Reject
                      </button>
                      <button
                        onClick={() => handleAction('Pending')}
                        disabled={actionLoading}
                        className="px-6 py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 disabled:opacity-50"
                      >
                        <Clock size={18} /> Wait / Review
                      </button>
                      <button
                        onClick={() => handleAction('Approved')}
                        disabled={actionLoading}
                        className="px-8 py-3 font-bold rounded-xl text-white transition-all flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 shadow-md disabled:opacity-50"
                      >
                        {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> Accept</>}
                      </button>
                    </div>

                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* REJECTION REASON MODAL */}
        <AnimatePresence>
          {rejectModalOpen && (
            <div className="fixed inset-0 z-[999] bg-[#040f0f]/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" style={{ border: '1px solid #b0d8db' }}>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#040f0f' }}>Reject RTI Request</h3>
                <p className="text-sm mb-4" style={{ color: '#57737a' }}>Please provide an official contextual reason for rejecting this information request. This will be publicly visible to the citizen.</p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-4 rounded-xl focus:outline-none mb-4 min-h-[120px] resize-none"
                  style={{ border: '1px solid #b0d8db', backgroundColor: '#f4feff', color: '#040f0f' }}
                  placeholder="e.g. Request falls outside the jurisdiction of this department..."
                  autoFocus
                />
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setRejectModalOpen(false)} className="px-5 py-2.5 font-bold transition-all rounded-xl" style={{ color: '#57737a', backgroundColor: '#e0f7f9' }}>Cancel</button>
                  <button
                    onClick={() => { setRejectModalOpen(false); handleAction('Rejected', rejectReason); }}
                    disabled={!rejectReason.trim() || actionLoading}
                    className="px-5 py-2.5 font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    <XCircle size={18} /> Confirm Rejection
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
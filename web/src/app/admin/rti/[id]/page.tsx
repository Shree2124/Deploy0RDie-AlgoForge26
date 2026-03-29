"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Clock, Loader2, Building2, HelpCircle, User, Paperclip, X, AlertTriangle, ShieldCheck, ShieldAlert, Target } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

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

  // Acceptance Modal & Questions State
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [responseFile, setResponseFile] = useState<File | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<{ [key: string]: string }>({});

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

  const handleApproveWithResponse = async () => {
    if (!responseText.trim()) {
      alert("Overall response text is required.");
      return;
    }
    setActionLoading(true);
    try {
      // 1. Format the response combining the overall message and individual answers
      let finalResponseText = responseText;
      if (rtiData.questions && rtiData.questions.length > 0) {
        const qaFormatted = rtiData.questions.map((q: string, i: number) => {
          return `Q${i + 1}: ${q}\nA${i + 1}: ${questionAnswers[i] || 'No specific official response provided.'}`;
        }).join('\n\n');

        finalResponseText = `${responseText}\n\n--- Specific Question Responses ---\n${qaFormatted}`;
      }

      // 2. Prepare FormData (Server handles upload now to bypass 400 error)
      const formData = new FormData();
      formData.append('status', 'Approved');
      formData.append('responseText', finalResponseText);
      if (responseFile) {
        formData.append('file', responseFile);
      }

      // 3. API Persistence
      const res = await fetch(`/api/update-rti-status/${id}`, {
        method: "PUT",
        body: formData, // No headers needed, browser sets multipart boundary
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to resolve the RTI Request");
      }

      setAcceptModalOpen(false);
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

                    {/* AI Analysis Result Section */}
                    {rtiData?.ai_details && (
                      <div className="rounded-2xl border-2 overflow-hidden bg-white" style={{ borderColor: rtiData.ai_details.ai_risk_level === 'Low' ? '#dcfce7' : rtiData.ai_details.ai_risk_level === 'Medium' ? '#fef9c3' : '#fee2e2' }}>
                        <div className="px-5 py-3 flex items-center justify-between border-b" style={{ backgroundColor: rtiData.ai_details.ai_risk_level === 'Low' ? '#f0fdf4' : rtiData.ai_details.ai_risk_level === 'Medium' ? '#fefce8' : '#fef2f2', borderColor: 'inherit' }}>
                          <div className="flex items-center gap-2">
                            <Target size={18} className={rtiData.ai_details.ai_risk_level === 'Low' ? 'text-green-600' : rtiData.ai_details.ai_risk_level === 'Medium' ? 'text-yellow-600' : 'text-red-600'} />
                            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#040f0f' }}>AI Insight Engine Analysis</h2>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1.5 ${rtiData.ai_details.ai_risk_level === 'Low' ? 'bg-green-100 text-green-700' :
                              rtiData.ai_details.ai_risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                            {rtiData.ai_details.ai_risk_level === 'Low' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                            Risk: {rtiData.ai_details.ai_risk_level}
                          </div>
                        </div>

                        <div className="p-5 space-y-4">
                          {/* AI Verdict */}
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 italic text-sm text-slate-700 leading-relaxed">
                            “{rtiData.ai_details.ai_verdict}”
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Discrepancies */}
                            <div>
                              <p className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest pl-1">Identified Discrepancies</p>
                              <div className="space-y-1.5">
                                {rtiData.ai_details.ai_discrepancies && rtiData.ai_details.ai_discrepancies.length > 0 ? (
                                  rtiData.ai_details.ai_discrepancies.map((d: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-600 p-2 rounded-lg bg-red-50/50">
                                      <AlertTriangle size={12} className="text-red-500 mt-0.5 flex-shrink-0" />
                                      {d}
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-xs text-green-600 font-medium p-2 rounded-lg bg-green-50/50 flex items-center gap-2">
                                    <ShieldCheck size={12} /> No anomalies detected by AI logic.
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Computer Vision Detections */}
                            <div className="overflow-hidden">
                              <p className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest pl-1">Computer Vision: Objects Identified</p>
                              <div className="flex flex-wrap gap-2 w-full">
                                {(() => {
                                  let detectionData = rtiData.ai_details.ai_detection;

                                  if (typeof detectionData === 'string') {
                                    try {
                                      detectionData = JSON.parse(detectionData);
                                    } catch (e) {
                                      return <div className="text-[10px] text-slate-600 w-full break-words">{detectionData}</div>;
                                    }
                                  }

                                  if (!detectionData || (Array.isArray(detectionData) && detectionData.length === 0) || (typeof detectionData === 'object' && Object.keys(detectionData).length === 0)) {
                                    return <div className="text-[10px] text-slate-400 italic">No object detection data available for this request.</div>;
                                  }

                                  if (Array.isArray(detectionData) && detectionData.length > 0 && typeof detectionData[0] === 'object' && ('label' in detectionData[0] || 'class_name' in detectionData[0])) {
                                    return detectionData.map((det: any, idx: number) => (
                                      <div key={idx} className="px-2 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md text-[10px] font-bold flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        {det.label || det.class_name || 'Unknown'} {det.confidence ? `(${det.confidence}%)` : ''}
                                      </div>
                                    ));
                                  }

                                  return (
                                    <pre className="text-[10px] w-full max-w-full overflow-x-auto bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 font-mono whitespace-pre-wrap break-words">
                                      {JSON.stringify(detectionData, null, 2)}
                                    </pre>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>

                          {rtiData.ai_details.ai_fake && (
                            <div className="mt-2 p-3 rounded-lg bg-orange-50 border border-orange-100 flex items-center gap-3">
                              <div className="p-1.5 bg-orange-200 rounded-lg text-orange-700"><AlertTriangle size={16} /></div>
                              <div>
                                <p className="text-xs font-bold text-orange-800">High Risk of Location Mismatch</p>
                                <p className="text-[10px] text-orange-600">The AI detection engine flags this as potentially unrelated to the specified project boundary.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

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
                          <div className="mt-6 pt-4 border-t border-dashed border-[#b0d8db]">
                            <p className="text-xs font-bold uppercase mb-4" style={{ color: '#57737a' }}>Provide Specific Answers (Optional)</p>
                            <div className="space-y-4">
                              {rtiData.questions.map((q: string, i: number) => (
                                <div key={i} className="p-4 rounded-xl border" style={{ backgroundColor: '#f4feff', borderColor: '#e0f7f9' }}>
                                  <p className="font-bold text-sm mb-3" style={{ color: '#040f0f' }}>Q{i + 1}: {q}</p>
                                  <textarea
                                    value={questionAnswers[i] || ''}
                                    onChange={(e) => setQuestionAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                                    placeholder="Draft official resolution context for this specific query..."
                                    className="w-full p-3 rounded-lg text-sm focus:outline-none resize-none transition-colors border-[#b0d8db] bg-white border"
                                    rows={2}
                                  />
                                </div>
                              ))}
                            </div>

                            {rtiData.status === 'Approved' ? (
                              <div className="space-y-4">
                                <div className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: '#57737a' }}>
                                  {rtiData.rti_response[0].response_text}
                                </div>
                                {rtiData.rti_response[0].attachments && rtiData.rti_response[0].attachments.length > 0 && (
                                  <div className="pt-3 border-t border-green-200">
                                    <a
                                      href={rtiData.rti_response[0].attachments[0]}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm font-bold text-green-700 flex items-center gap-2 hover:underline"
                                    >
                                      <Paperclip size={16} /> View Resolution Attachment
                                    </a>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm italic" style={{ color: '#854d4d' }}>
                                <strong>Rejection Reason:</strong> {rtiData?.rti_response[0]?.rejection_reason}
                              </div>
                            )}
                          </div>
                        )}

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
                            onClick={() => setAcceptModalOpen(true)}
                            disabled={actionLoading}
                            className="px-8 py-3 font-bold rounded-xl text-white transition-all flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 shadow-md disabled:opacity-50"
                          >
                            {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> Review & Accept</>}
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ACCEPTANCE RESPONSE MODAL */}
        <AnimatePresence>
          {acceptModalOpen && (
            <div className="fixed inset-0 z-[999] bg-[#040f0f]/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-lg p-6 md:p-8 shadow-2xl" style={{ border: '1px solid #b0d8db' }}>
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#040f0f' }}>Finalize RTI Resolution</h3>
                <p className="text-sm mb-6" style={{ color: '#57737a' }}>Please provide the official overall response. Specific question answers will be automatically appended.</p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#040f0f' }}>Overall Response Letter <span className="text-red-500">*</span></label>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      className="w-full p-4 rounded-xl focus:outline-none min-h-[140px] resize-none"
                      style={{ border: '1px solid #b0d8db', backgroundColor: '#f4feff', color: '#040f0f' }}
                      placeholder="e.g. This is with reference to your RTI application received by this office. The requested information has been tabulated and validated by..."
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#040f0f' }}>Attach Official Records (Optional)</label>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer px-4 py-2.5 bg-white rounded-xl flex items-center justify-center gap-2 font-bold transition-colors hover:bg-slate-50 cursor-pointer w-full border-dashed border-2 text-center" style={{ borderColor: '#b0d8db', color: '#57737a' }}>
                        <Paperclip size={18} /> {responseFile ? "Change File" : "Upload File"}
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => setResponseFile(e.target.files ? e.target.files[0] : null)}
                          accept=".pdf,.jpg,.jpeg,.png,.csv"
                        />
                      </label>
                    </div>
                    {responseFile && (
                      <div className="mt-2 flex items-center justify-between p-2 rounded-lg bg-[#e0f7f9] text-sm text-[#57737a] border border-[#b0d8db]">
                        <span className="truncate">{responseFile.name}</span>
                        <button type="button" onClick={() => setResponseFile(null)} className="text-red-500 hover:text-red-700 p-1"><X size={16} /></button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-[#e0f7f9]">
                  <button onClick={() => setAcceptModalOpen(false)} className="px-6 py-3 font-bold transition-all rounded-xl" style={{ color: '#57737a', backgroundColor: '#e0f7f9' }}>Cancel</button>
                  <button
                    onClick={handleApproveWithResponse}
                    disabled={!responseText.trim() || actionLoading}
                    className="px-6 py-3 font-bold bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> Publish Resolution</>}
                  </button>
                </div>
              </motion.div>
            </div>
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
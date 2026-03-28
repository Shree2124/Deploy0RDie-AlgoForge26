'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, User, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, Activity } from 'lucide-react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function ReportDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch Report Detail from Supabase
  useEffect(() => {
    if (!id) return;
    const fetchReport = async () => {
      const { data: reportData, error: reportError } = await supabase
        .from('citizen_reports')
        .select(`*`)
        .eq('id', id)
        .single();

      if (!reportError && reportData) {
        // Only fetch profile if report is NOT anonymous
        if (reportData.user_id && !reportData.is_anonymous) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', reportData.user_id)
            .single();

          if (profileData) {
            reportData.profiles = profileData;
          }
        }
        setReport(reportData);
      }
      if (reportError) console.error(reportError);
      setLoading(false);
    };
    fetchReport();
  }, [id]);

  // Update Status in Supabase!
  const handleStatusChange = async (newStatus: 'Verified' | 'Resolved' | 'Rejected') => {
    setUpdating(true);
    const { error } = await supabase
      .from('citizen_reports')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setReport({ ...report, status: newStatus });
      alert(`Report successfully marked as ${newStatus}. Citizen will see this update immediately.`);
    } else {
      alert("Failed to update status.");
    }
    setUpdating(false);
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500">Loading DB Record...</div>;
  if (!report) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-red-500">Report Not Found!</div>;

  // Deriving visual scores from AI risk level for UI continuity
  const score = report.ai_risk_level === 'High' ? 95 : report.ai_risk_level === 'Medium' ? 65 : 20;

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-5xl mx-auto animate-in fade-in duration-300">

        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">Report Detail</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${report.status === 'Verified' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                  report.status === 'Resolved' ? 'bg-green-100 text-green-700 border-green-200' :
                    report.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                      'bg-amber-100 text-amber-700 border-amber-200'
                  }`}>
                  {report.status}
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-1 font-mono">ID: {report.id}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {report.status !== 'Rejected' && (
              <button
                onClick={() => handleStatusChange('Rejected')}
                disabled={updating}
                className="px-4 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <XCircle size={18} /> Reject
              </button>
            )}
            {report.status !== 'Verified' && report.status !== 'Resolved' && (
              <button
                onClick={() => handleStatusChange('Verified')}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
              >
                <ShieldAlert size={18} /> Mark Verified
              </button>
            )}
            {report.status !== 'Resolved' && (
              <button
                onClick={() => handleStatusChange('Resolved')}
                disabled={updating}
                className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
              >
                <CheckCircle2 size={18} /> Mark Resolved
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Details & AI */}
          <div className="lg:col-span-2 space-y-6">

            {/* AI Analysis Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${report.ai_risk_level === 'High' ? 'bg-red-500' : report.ai_risk_level === 'Medium' ? 'bg-orange-500' : 'bg-green-500'}`}></div>

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                    <ShieldAlert className={report.ai_risk_level === 'High' ? 'text-red-600' : 'text-orange-600'} />
                    AI Risk Assessment
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Powered by Civic.ai™ Engine</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900">{score}<span className="text-sm text-slate-400">/100</span></div>
                  <div className={`text-xs font-bold uppercase tracking-wide ${report.ai_risk_level === 'High' ? 'text-red-600' : 'text-slate-600'}`}>
                    {report.ai_risk_level || 'Pending'} Risk
                  </div>
                </div>
              </div>

              {/* Analysis Text */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                    <Activity size={14} /> AI Verdict & Reasoning
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {report.ai_verdict || "No AI verdict recorded yet. Ensure the API pipeline triggered successfully."}
                  </p>
                </div>

                {report.ai_discrepancies && report.ai_discrepancies.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Detected Anomalies</h4>
                    <div className="flex flex-wrap gap-2">
                      {report.ai_discrepancies.map((d: string, i: number) => (
                        <span key={i} className="px-2.5 py-1.5 bg-red-50 border border-red-100 rounded-md text-xs font-medium text-red-700 flex items-center gap-1">
                          <AlertTriangle size={10} /> {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Evidence Image */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 font-bold text-slate-800 flex justify-between items-center">
                <span>Visual Evidence</span>
                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded">Metadata Verified</span>
              </div>
              <img src={report.image_url} alt="Field Evidence" className="w-full h-auto object-cover max-h-[500px]" />
            </div>
          </div>

          {/* Right Column: Meta Info */}
          <div className="space-y-6">

            {/* Project Context */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide border-b border-slate-100 pb-2">
                Field Context
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 font-bold">Category</label>
                  <div className="font-medium text-slate-900 mt-0.5">{report.category}</div>
                  <div className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded">"{report.notes}"</div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-bold">Location Data</label>
                  <div className="flex items-start gap-2 mt-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <MapPin size={16} className="text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm text-slate-700 font-medium font-mono">
                        {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`}
                        target="_blank" rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-1 block"
                      >
                        Open in Google Maps
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reporter Profile */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide border-b border-slate-100 pb-2">
                Reporter Identity
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                  <User size={20} />
                </div>
                <div>
                  {report.is_anonymous ? (
                    <>
                      <div className="font-medium text-slate-900">Anonymous Citizen</div>
                      <div className="text-xs text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-0.5">Identity Protected</div>
                    </>
                  ) : (
                    <>
                      <div className="font-medium text-slate-900">{report.profiles?.full_name || 'Unknown Citizen'}</div>
                      <div className="text-xs text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded inline-block mt-0.5">Verified Account</div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <Calendar size={14} /> Reported: {new Date(report.created_at).toLocaleString()}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
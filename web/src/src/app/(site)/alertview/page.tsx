'use client';
import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  AlertTriangle, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- TYPES ---
enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

interface OfficialRecord {
  id: string;
  projectName: string;
  contractor: string;
}

interface Report {
  id: string;
  matchedRecordId: string;
  status: string;
  auditResult: {
    riskLevel: RiskLevel;
    reasoning: string;
    discrepancies: string[];
  };
}

// --- STATIC MOCK DATA ---
const MOCK_RECORDS: OfficialRecord[] = [
  {
    id: 'MCGM-2024-001',
    projectName: 'Marine Drive Promenade Resurfacing',
    contractor: 'Mumbai Infra Projects Ltd',
  },
  {
    id: 'MCGM-2024-002',
    projectName: 'Dadar Station Skywalk Repair',
    contractor: 'Urban Connectivity Solutions',
  },
  {
    id: 'MCGM-2024-003',
    projectName: 'Andheri East Drainage Upgrade',
    contractor: 'CityFlow Engineering',
  }
];

const MOCK_REPORTS: Report[] = [
  {
    id: 'REP-001',
    matchedRecordId: 'MCGM-2024-002',
    status: 'Verified',
    auditResult: {
      riskLevel: RiskLevel.HIGH,
      reasoning: 'Visual evidence suggests critical structural integrity failure not documented in official status.',
      discrepancies: ['Major structural cracks observed on pillar 4.']
    }
  },
  {
    id: 'REP-002',
    matchedRecordId: 'MCGM-2024-001',
    status: 'Audited',
    auditResult: {
      riskLevel: RiskLevel.HIGH,
      reasoning: 'Materials used do not match the grade specified in the tender document.',
      discrepancies: ['Use of sub-standard paver blocks.']
    }
  },
  {
    id: 'REP-003',
    matchedRecordId: 'MCGM-2024-003',
    status: 'Pending',
    auditResult: {
      riskLevel: RiskLevel.MEDIUM,
      reasoning: 'Project timeline delayed by 3 months despite full budget utilization.',
      discrepancies: ['No visible workforce on site.']
    }
  }
];

export default function AlertsPage() {
  const highRiskReports = MOCK_REPORTS.filter(r => r.auditResult?.riskLevel === RiskLevel.HIGH);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="container mx-auto max-w-3xl pt-8 px-4 pb-24">
        
        <div className="flex items-center gap-2 mb-8">
          <Link 
            href="/dashboard" 
            className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:underline transition-all"
          >
             <ArrowLeft size={16} /> Back to Homepage
          </Link>
        </div>

        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-serif flex items-center gap-2">
              Actionable Alerts
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </h1>
            <p className="text-slate-500 mt-2">High-risk discrepancies requiring immediate attention.</p>
          </div>
          <div className="hidden sm:block text-right">
             <div className="text-2xl font-bold text-red-600">{highRiskReports.length}</div>
             <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Critical Issues</div>
          </div>
        </div>

        {highRiskReports.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
             <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-500" />
             </div>
             <h3 className="text-lg font-bold text-slate-800">All Clear!</h3>
             <p className="text-slate-500">No active high-risk alerts at the moment.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {highRiskReports.map((report, index) => {
               const record = MOCK_RECORDS.find(r => r.id === report.matchedRecordId);
               if (!record) return null;
               
               return (
                 <motion.div 
                   key={report.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.1 }}
                   className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all overflow-hidden group"
                 >
                    <div className="bg-red-50 border-b border-red-100 px-6 py-3 flex justify-between items-center">
                       <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                          <ShieldAlert size={16} />
                          CRITICAL RISK DETECTED
                       </div>
                       <div className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${
                          report.status === 'Verified' ? 'bg-white text-green-700 border-green-200' :
                          report.status === 'Audited' ? 'bg-white text-blue-700 border-blue-200' :
                          'bg-white text-slate-600 border-slate-200'
                       }`}>
                          {report.status}
                       </div>
                    </div>

                    <div className="p-6">
                       {/* Project Info */}
                       <div className="mb-4">
                          <div className="flex justify-between items-start">
                             <div>
                                <h3 className="font-bold text-xl text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">
                                  {record.projectName}
                                </h3>
                                <p className="text-xs font-mono text-slate-400">ID: {record.id}</p>
                             </div>
                             <div className="text-right">
                                <span className="text-xs text-slate-400 block mb-1">Contractor</span>
                                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                  {record.contractor}
                                </span>
                             </div>
                          </div>
                       </div>

                       <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6 relative">
                          <div className="absolute top-4 left-4 text-slate-300">
                             <AlertTriangle size={20} />
                          </div>
                          <p className="text-sm text-slate-700 italic pl-8 leading-relaxed">
                            "{report.auditResult?.reasoning}"
                          </p>
                          <div className="flex gap-2 mt-3 pl-8">
                             {report.auditResult?.discrepancies.map((d, i) => (
                               <span key={i} className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-1 rounded border border-red-200">
                                 {d}
                               </span>
                             ))}
                          </div>
                       </div>

                       <Link href={`/audit`} className="w-full">
                         <button 
                           className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                         >
                            View Full Audit Report <ArrowRight size={16} />
                         </button>
                       </Link>
                    </div>
                 </motion.div>
               );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
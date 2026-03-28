'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  IndianRupee,
  FileText,
  ExternalLink,
  Download
} from 'lucide-react';
import { RiskLevel, ProjectCategory, OfficialRecord } from '@/types/types';

// --- DYNAMIC MAP IMPORT ---
const MapVisualizer = dynamic(
  () => import('@/components/MapView/Mapvisualizer'), 
  { 
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-slate-100 flex items-center justify-center animate-pulse text-slate-400">
        Loading Map...
      </div>
    )
  }
);

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params?.id;

  // --- MOCK DATA ---
  const project = {
    id: typeof id === 'string' ? id : 'MCGM-001',
    name: 'Marine Drive Resurfacing',
    category: ProjectCategory.ROAD,
    status: 'In Progress' as const,
    contractor: {
      name: 'Mumbai Infra Projects Ltd',
      id: 'CON-mum-001',
      rating: 'B+'
    },
    budget: {
      total: 45000000,
      spent: 32000000,
      utilization: 71
    },
    timeline: {
      start: '2024-01-15',
      deadline: '2024-06-30',
      progress: 65
    },
    location: {
      address: 'Marine Drive Promenade, South Mumbai',
      coordinates: { lat: 18.944, lng: 72.823 }
    },
    reports: [
      { id: 'REP-002', date: '2024-03-10', issue: 'Uneven leveling near flyover', status: 'Verified', risk: RiskLevel.MEDIUM },
      { id: 'REP-005', date: '2024-04-02', issue: 'Debris left on walkway', status: 'Resolved', risk: RiskLevel.LOW },
    ]
  };

  // Convert to OfficialRecord type for MapVisualizer
  const mapRecord: OfficialRecord = {
    id: project.id,
    projectName: project.name,
    category: project.category,
    budget: project.budget.total,
    contractor: project.contractor.name,
    deadline: project.timeline.deadline,
    status: project.status,
    location: project.location.coordinates,
    description: project.location.address
  };

  // Handler for Contract Viewing
  const handleViewContract = () => {
    // Opens a dummy PDF for demonstration
    window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* 1. Header & Navigation */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 uppercase border border-blue-200">
                  {project.status}
                </span>
              </div>
              <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                <span className="font-mono bg-slate-200 px-1.5 rounded text-slate-600">{project.id}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin size={12}/> {project.location.address}</span>
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleViewContract}
            className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
          >
            <FileText size={18} /> View Contract PDF
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* --- LEFT COLUMN: MAIN STATS --- */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Progress & Budget Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-slate-400"/> Project Timeline & Budget
              </h3>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Completion</span>
                  <span className="font-bold text-slate-900">{project.timeline.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${project.timeline.progress}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>Started: {project.timeline.start}</span>
                  <span>Deadline: {project.timeline.deadline}</span>
                </div>
              </div>

              {/* Financial Grid */}
              <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total Budget</p>
                  <p className="text-lg font-bold text-slate-900 flex items-center">
                    <IndianRupee size={14} /> {(project.budget.total / 10000000).toFixed(2)} Cr
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Funds Utilized</p>
                  <p className="text-lg font-bold text-slate-900 flex items-center">
                    <IndianRupee size={14} /> {(project.budget.spent / 10000000).toFixed(2)} Cr
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Burn Rate</p>
                  <p className={`text-lg font-bold ${project.budget.utilization > 80 ? 'text-orange-600' : 'text-green-600'}`}>
                    {project.budget.utilization}%
                  </p>
                </div>
              </div>
            </div>

            {/* Citizen Reports Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Citizen Audits</h3>
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                  {project.reports.filter(r => r.status !== 'Resolved').length} Active Issues
                </span>
              </div>
              <table className="w-full text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Report ID</th>
                    <th className="px-6 py-3">Issue</th>
                    <th className="px-6 py-3">Risk</th>
                    <th className="px-6 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {project.reports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">
                        <Link href={`/admin/reports/${report.id}`} className="hover:underline text-blue-600">
                          #{report.id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{report.issue}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          report.risk === RiskLevel.HIGH ? 'bg-red-100 text-red-700' : 
                          report.risk === RiskLevel.MEDIUM ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {report.risk}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {report.status === 'Resolved' ? (
                          <span className="text-green-600 flex items-center justify-end gap-1 text-xs font-bold"><CheckCircle2 size={14}/> Resolved</span>
                        ) : (
                          <span className="text-blue-600 flex items-center justify-end gap-1 text-xs font-bold"><AlertTriangle size={14}/> Verified</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* --- RIGHT COLUMN: CONTRACTOR & MAP --- */}
          <div className="space-y-6">
            
            {/* Contractor Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Building2 size={80} />
              </div>
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Assigned Contractor</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-xl text-slate-700">
                  {project.contractor.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900 leading-tight">{project.contractor.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{project.contractor.id}</div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="text-sm">
                  <span className="text-slate-500">Rating:</span> <span className="font-bold text-green-600">{project.contractor.rating}</span>
                </div>
                <Link href={`/admin/contractors/${project.contractor.id}`} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                  View Profile <ExternalLink size={12} />
                </Link>
              </div>
            </div>

            {/* Live Map Preview */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-72 relative z-0">
              <div className="absolute top-3 left-3 z-[500] bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold shadow-sm border border-slate-200">
                 Project Location
              </div>
              <MapVisualizer 
                records={[mapRecord]} // Only show this project
                reports={[]} // Hiding report circles to focus on project location
                onRecordSelect={() => {}}
                userLocation={project.location.coordinates} // Center map here
              />
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
"use client";
import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function ContractorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id; // e.g., 'mumbai-infra-ltd'

  const contractor = {
    name: "Mumbai Infra Projects Ltd",
    id: "CON-mum-001",
    rating: "B+",
    riskScore: 35, // Percentage
    activeProjects: 4,
    totalBudget: 450000000,
    history: [
      {
        id: "PRJ-001",
        name: "Marine Drive Resurfacing",
        status: "Completed",
        issues: 2,
      },
      {
        id: "PRJ-004",
        name: "Andheri East Drainage",
        status: "In Progress",
        issues: 5,
      }, // Problematic
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {contractor.name}
            </h1>
            <p className="text-slate-500 text-sm">ID: {contractor.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Building2 size={24} />
            </div>
            <div>
              <div className="text-sm text-slate-500 font-bold uppercase">
                Active Projects
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {contractor.activeProjects}
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="text-sm text-slate-500 font-bold uppercase">
                Performance Rating
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {contractor.rating}
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <AlertCircle size={24} />
            </div>
            <div>
              <div className="text-sm text-slate-500 font-bold uppercase">
                Risk Score
              </div>
              <div className="text-2xl font-bold text-red-600">
                {contractor.riskScore}%
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-800">
            Project History
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Project Name</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Reported Issues</th>
                <th className="px-6 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contractor.history.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-500 font-mono">
                      {p.id}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        p.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold ${
                          p.issues > 3 ? "text-red-600" : "text-slate-700"
                        }`}
                      >
                        {p.issues}
                      </span>
                      {p.issues > 3 && (
                        <AlertTriangle size={14} className="text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        router.push(
                          `/admin/projects/${p.id}`
                        );
                      }}
                      className="text-blue-600 hover:underline text-sm font-bold"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

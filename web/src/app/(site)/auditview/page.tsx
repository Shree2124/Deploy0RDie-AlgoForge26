"use client";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, X, UploadCloud, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

enum RiskLevel {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
}

interface OfficialRecord {
  id: string;
  projectName: string;
  contractor: string;
  budget: number;
  status: string;
}

interface AuditResult {
  riskLevel: RiskLevel;
  discrepancies: string[];
  reasoning: string;
  confidenceScore: number;
}

const MOCK_RECORD: OfficialRecord = {
  id: "MCGM-2024-001",
  projectName: "Marine Drive Promenade Resurfacing",
  contractor: "Mumbai Infra Projects Ltd",
  budget: 45000000,
  status: "Completed",
};

const INITIAL_AUDIT: AuditResult = {
  riskLevel: RiskLevel.HIGH,
  discrepancies: [
    "Use of sub-standard paver blocks.",
    "Uneven levelling causing water stagnation.",
  ],
  reasoning:
    "Materials used do not match the grade specified in the tender document.",
  confidenceScore: 0.88,
};

const FAKE_EVIDENCE_AUDIT: AuditResult = {
  riskLevel: RiskLevel.HIGH,
  discrepancies: [
    "Evidence provided is a graphic of a sugar skull, which is unrelated to the project.",
    "No visual proof of the promenade resurfacing or sea-wall repair.",
    "Unable to verify the 'Completed' status due to lack of relevant site imagery.",
  ],
  reasoning:
    "The submitted field evidence is a generic graphic image rather than a photograph of the infrastructure. For a project with a budget of ₹4,50,00,000, the failure to provide actual site photos prevents verification of the work and suggests potential fraud, data falsification, or gross negligence in the reporting process.",
  confidenceScore: 1.0,
};

export default function AuditView() {
  const [audit, setAudit] = useState<AuditResult>(INITIAL_AUDIT);
  const [complaintLetter, setComplaintLetter] = useState<string | null>(null);

  const [isDrafting, setIsDrafting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setComplaintLetter(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAgenticAudit = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAnalysisStep("Analyzing Evidence...");

    await new Promise((r) => setTimeout(r, 1500));

    setAnalysisStep("Cross-Referencing Official Records...");

    await new Promise((r) => setTimeout(r, 1500));

    setAudit(FAKE_EVIDENCE_AUDIT);
    setIsAnalyzing(false);
    setAnalysisStep("");
  };

  const handleDraftComplaint = async () => {
    setIsDrafting(true);
    await new Promise((r) => setTimeout(r, 800));

    const letter = `To,
The Municipal Commissioner,
Mumbai Municipal Corporation,
Mumbai.

**Date:** ${new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}

**Subject:** Formal Complaint regarding Project "${
      MOCK_RECORD.projectName
    }" - Audit Non-Compliance

Respected Sir/Madam,

I am writing to formally report serious irregularities identified in the "${
      MOCK_RECORD.projectName
    }". A recent AI-assisted audit has categorized the project risk as **${audit.riskLevel.toUpperCase()}** due to significant deviations from the approved technical specifications.

The audit findings highlight the following critical issues:
${audit.discrepancies.map((d, i) => `${i + 1}. **${d}**`).join("\n")}

**Reasoning:**
${audit.reasoning}

It is evident that the execution (or reporting) of this project is not in adherence to the quality standards promised to the citizens. Given the substantial public funds involved (₹${(
      MOCK_RECORD.budget / 10000000
    ).toFixed(2)} Cr), such negligence is unacceptable.

I demand an **immediate inquiry** into this project and a thorough inspection of the materials supplied by the contractor, ${
      MOCK_RECORD.contractor
    }.

I look forward to your prompt response regarding the actions taken in this matter.

Yours faithfully,`;

    setComplaintLetter(letter);
    setIsDrafting(false);
  };

  const copyToClipboard = () => {
    if (complaintLetter) {
      navigator.clipboard.writeText(complaintLetter);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const isHighRisk = audit.riskLevel === RiskLevel.HIGH;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6 font-sans text-slate-900">
      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={() => router.back()}
          className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:underline transition-all"
        >
          <ArrowLeft size={16} /> Back to Homepage
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              Official Record
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {MOCK_RECORD.projectName}
            </h1>
            <div className="text-xs font-mono text-slate-400 mt-1">
              {MOCK_RECORD.id}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <div className="text-slate-500 mb-1">Budget</div>
            <div className="font-semibold">₹4,50,00,000</div>
          </div>
          <div>
            <div className="text-slate-500 mb-1">Contractor</div>
            <div className="font-semibold text-blue-600">
              {MOCK_RECORD.contractor}
            </div>
          </div>
          <div>
            <div className="text-slate-500 mb-1">Status</div>
            <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              {MOCK_RECORD.status}
            </div>
          </div>
          <div>
            <div className="text-slate-500 mb-1">Deadline</div>
            <div className="font-semibold">2024-06-30</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="text-slate-500 text-xs mb-1 uppercase tracking-wider">
            Scope Description
          </div>
          <p className="text-sm text-slate-700">
            Resurfacing of the promenade walkway with anti-skid tiles and repair
            of the sea-facing wall.
          </p>
        </div>
      </div>

      <motion.div
        layout
        className={`bg-white rounded-xl border-l-4 shadow-md overflow-hidden transition-colors duration-500 ${
          isHighRisk
            ? "border-l-red-500 border-y border-r border-slate-200"
            : "border-l-green-500 border-y border-r border-slate-200"
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                Audit Verdict
              </h2>
              <div className="text-sm text-slate-500 mt-1">
                Confidence Score:{" "}
                <span className="font-bold text-slate-900">
                  {(audit.confidenceScore * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                isHighRisk
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-green-50 text-green-700 border-green-200"
              }`}
            >
              {audit.riskLevel} RISK
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Reasoning
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {audit.reasoning}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Discrepancies Found
              </h3>
              <ul className="space-y-2">
                {audit.discrepancies.map((d, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-700"
                  >
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-sm font-semibold text-slate-900 mb-4">
              Recommended Actions
            </div>
            <Button
              onClick={handleDraftComplaint}
              disabled={isDrafting}
              className="w-full bg-[#008080] hover:bg-[#006666] text-white font-semibold h-10 shadow-sm"
            >
              {isDrafting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" /> Drafting...
                </span>
              ) : (
                "Draft Formal Complaint"
              )}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {complaintLetter && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-slate-200 bg-slate-50"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Preview
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="p-1 hover:bg-slate-200 rounded text-slate-500"
                    >
                      {isCopied ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => setComplaintLetter(null)}
                      className="p-1 hover:bg-slate-200 rounded text-slate-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 text-sm font-serif whitespace-pre-wrap leading-relaxed text-slate-800">
                  {complaintLetter}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4">
          Submit Visual Evidence
        </h3>

        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative group border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer overflow-hidden ${
            selectedImage
              ? "border-blue-500 bg-blue-50/10"
              : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />

          {selectedImage ? (
            <div className="relative z-10">
              <img
                src={selectedImage}
                alt="Evidence"
                className="h-40 mx-auto object-contain rounded-lg shadow-sm"
              />
              <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-green-500 text-white p-1 rounded-full shadow-md">
                <Check size={12} />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                <UploadCloud
                  size={24}
                  className="text-slate-400 group-hover:text-blue-600"
                />
              </div>
              <div className="text-sm font-medium text-slate-900">
                Click to upload or drag and drop
              </div>
              <div className="text-xs text-slate-500">JPG, PNG (MAX. 5MB)</div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-4 mb-6">
          <input
            type="checkbox"
            id="anon"
            defaultChecked
            className="rounded border-slate-300 text-[#008080] focus:ring-[#008080]"
          />
          <label
            htmlFor="anon"
            className="text-sm text-slate-600 cursor-pointer select-none"
          >
            Submit Anonymously (Privacy-First)
          </label>
        </div>

        <Button
          onClick={runAgenticAudit}
          disabled={!selectedImage || isAnalyzing}
          className={`w-full h-12 text-base font-semibold transition-all ${
            isAnalyzing
              ? "bg-slate-100 text-slate-800 border border-slate-200"
              : "bg-slate-900 text-white hover:bg-slate-800 shadow-md"
          }`}
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              {analysisStep}
            </span>
          ) : (
            "Run Agentic Audit"
          )}
        </Button>
      </div>
    </div>
  );
}

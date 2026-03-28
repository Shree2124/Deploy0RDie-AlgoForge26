"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Camera, AlertTriangle, Paperclip, X, ChevronRight, CheckCircle, Navigation } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type Step = "details" | "evidence" | "submitting" | "success";

interface ReportIssueTabProps {
  onBackToDashboard: () => void;
}

export default function ReportIssueTab({ onBackToDashboard }: ReportIssueTabProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("details");
  const [loadingLoc, setLoadingLoc] = useState(false);

  const [data, setData] = useState({
    description: "",
    latitude: 0,
    longitude: 0,
    address: "",
    file: null as File | null,
  });

  const [error, setError] = useState("");

  const fetchLocation = () => {
    setLoadingLoc(true);
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoadingLoc(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let address = 'Could not fetch address';
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const geoData = await res.json();
          address = geoData.display_name || 'Address not found';
        } catch {
          // Keep default error message
        }
        setData({ ...data, latitude: lat, longitude: lng, address });
        setLoadingLoc(false);
      },
      (err) => {
        setError("Location access denied. We need your location to verify the report.");
        setLoadingLoc(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setData({ ...data, file: e.target.files[0] });
    }
  };

  const handleSubmit = async () => {
    if (!data.file || !data.latitude || !data.longitude) return;

    setStep("submitting");
    setError("");

    try {
      const formData = new FormData();
      formData.append("evidence", data.file);
      formData.append("latitude", data.latitude.toString());
      formData.append("longitude", data.longitude.toString());
      formData.append("description", data.description);
      formData.append("address", data.address);
      if (user) formData.append("userId", user.id);

      const res = await fetch("/api/report", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to submit report");

      setStep("success");
    } catch (err: any) {
      setError("Something went wrong while submitting. Please try again.");
      setStep("evidence");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3" style={{ color: "#040f0f" }}>
          <div className="bg-[#e0f7f9] p-2 rounded-xl">
            <AlertTriangle className="text-[#57737a]" size={28} />
          </div>
          Create New Audit
        </h1>
        <p className="text-sm mt-3" style={{ color: "#57737a" }}>Help us build a better city by reporting infrastructure issues with live proof.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden relative min-h-[500px] flex flex-col p-6 lg:p-8" style={{ borderColor: "#b0d8db" }}>
        {error && (
          <div className="mb-4 p-4 rounded-xl text-sm flex items-center gap-3 font-medium" style={{ backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fca5a5" }}>
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: DETAILS & LOCATION */}
          {step === "details" && (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">


              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: "#040f0f" }}>Description</label>
                <textarea
                  placeholder="Describe what you see clearly..."
                  className="w-full p-4 rounded-xl outline-none min-h-[120px] font-medium transition-colors focus:ring-2 focus:ring-[#85bdbf] focus:border-[#85bdbf]"
                  style={{ backgroundColor: "#f4feff", border: "1px solid #b0d8db", color: "#040f0f" }}
                  value={data.description}
                  onChange={(e) => setData({ ...data, description: e.target.value })}
                />
              </div>

              <div className="p-5 rounded-xl space-y-4" style={{ backgroundColor: "#e0f7f9", border: "1px solid #b0d8db" }}>
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <label className="text-sm font-bold flex items-center gap-2" style={{ color: "#040f0f" }}>
                    <MapPin size={18} style={{ color: "#57737a" }} /> Live Location Required
                  </label>
                  <button
                    onClick={fetchLocation}
                    disabled={loadingLoc}
                    className="w-full sm:w-auto px-4 py-2 bg-white font-bold text-xs rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-2 mt-2 sm:mt-0"
                    style={{ border: "1px solid #b0d8db", color: "#57737a" }}
                  >
                    {loadingLoc ? (
                      <span className="w-4 h-4 border-2 border-[#57737a] border-t-transparent rounded-full animate-spin"></span>
                    ) : <Navigation size={14} />}
                    {loadingLoc ? "Locating..." : "Get Current Location"}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Full Address"
                  className="w-full p-3 rounded-xl outline-none font-medium transition-colors focus:ring-2 focus:ring-[#85bdbf] focus:border-[#85bdbf]"
                  style={{ backgroundColor: "#f4feff", border: "1px solid #b0d8db", color: "#040f0f" }}
                  value={data.address}
                  onChange={(e) => setData({ ...data, address: e.target.value })}
                />
              </div>

              <button
                onClick={() => setStep("evidence")}
                disabled={!data.description || data.latitude === 0}
                className="w-full py-4 font-bold text-white rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: "#040f0f" }}
              >
                Continue to Evidence <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {/* STEP 2: EVIDENCE UPLOAD */}
          {step === "evidence" && (
            <motion.div key="evidence" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 flex flex-col justify-center min-h-[400px]">
              <div className="text-center mb-6">
                <h3 className="font-bold text-xl" style={{ color: "#040f0f" }}>Upload Evidence</h3>
                <p className="text-sm mt-2" style={{ color: "#57737a" }}>A clear, live photo helps our AI verify the issue securely.</p>
              </div>

              <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:bg-slate-50" style={{ borderColor: "#85bdbf", backgroundColor: "#f4feff" }}>
                <div className="flex flex-col items-center justify-center">
                  <div className="p-4 rounded-full mb-4 shadow-sm" style={{ backgroundColor: "#e0f7f9" }}>
                    <Camera className="w-8 h-8" style={{ color: "#57737a" }} />
                  </div>
                  <p className="text-sm font-bold px-4 text-center" style={{ color: "#040f0f" }}>
                    {data.file ? data.file.name : "Tap to capture or upload photo"}
                  </p>
                  {!data.file && <p className="text-xs mt-2" style={{ color: "#85bdbf" }}>JPG, PNG up to 10MB</p>}
                </div>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
              </label>

              <div className="flex gap-3 pt-6">
                <button
                  onClick={() => setStep("details")}
                  className="px-6 py-3.5 rounded-xl font-bold transition-colors"
                  style={{ backgroundColor: "#e0f7f9", color: "#57737a" }}
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!data.file}
                  className="flex-1 py-3.5 font-bold text-white rounded-xl disabled:opacity-50 transition-all hover:shadow-lg"
                  style={{ backgroundColor: "#57737a" }}
                >
                  Submit Audit Securely
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: LOADING / AI PROCESSING */}
          {step === "submitting" && (
            <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center py-16">
              <div className="w-20 h-20 border-4 rounded-full animate-spin mb-8" style={{ borderColor: "#e8f9fa", borderTopColor: "#57737a" }}></div>
              <h3 className="text-xl font-bold" style={{ color: "#040f0f" }}>Encrypting & Authenticating...</h3>
              <p className="mt-3 text-sm max-w-xs" style={{ color: "#57737a" }}>Our civic agent is securely processing your evidence to the blockchain ledger.</p>
            </motion.div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col justify-center items-center text-center py-12">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-sm" style={{ backgroundColor: "#e0f7f9" }}>
                <CheckCircle className="w-12 h-12" style={{ color: "#57737a" }} />
              </div>
              <h3 className="text-2xl font-bold" style={{ color: "#040f0f" }}>Audit Successfully Filed</h3>
              <p className="text-sm mt-3 mb-10 max-w-sm" style={{ color: "#57737a" }}>
                Thank you! Your verified report has been added to the public ledger. You can track its status securely.
              </p>
              <button
                onClick={onBackToDashboard}
                className="w-full py-4 rounded-xl font-bold transition-all hover:shadow-md"
                style={{ border: "1px solid #b0d8db", color: "#040f0f", backgroundColor: "#f4feff" }}
              >
                Return to Overview
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

'use client';
import React, { useState, useEffect, useRef, useContext } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Camera, 
  X, 
  RefreshCw, 
  Loader2, 
  AlertTriangle,
  Building2,
  Crosshair,
  ChevronRight,
  BrainCircuit,
  Gauge,
  Send,
  PenTool
} from 'lucide-react';
import { ProjectCategory, RiskLevel } from '@/types/types';
import { useAuth } from '@/hooks/useAuth';

// --- DYNAMIC MAP IMPORT ---
const MapVisualizer = dynamic(
  () => import('@/components/MapView/Mapvisualizer'), 
  { 
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-slate-100 flex items-center justify-center animate-pulse rounded-xl">
        <Building2 className="w-8 h-8 text-slate-300" />
      </div>
    )
  }
);

export default function CreateAuditPage() {

  const { user, emailVerified, loading } = useAuth();
  console.log(user)

  const router = useRouter();
  
  // --- STATE MANAGEMENT ---
  const [step, setStep] = useState(1); // 1: Location, 2: Evidence, 3: Details, 4: AI Result
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  
  // Location State
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  // Evidence State
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Details State
  const [category, setCategory] = useState<ProjectCategory>(ProjectCategory.ROAD);
  const [description, setDescription] = useState('');

  // AI Result State
  const [aiAnalysis, setAiAnalysis] = useState<{score: number, level: RiskLevel, reasoning: string} | null>(null);
  const [generatedComplaint, setGeneratedComplaint] = useState<string | null>(null);

  // useEffect(()=>{
  // })


  // --- INITIALIZATION ---
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          if (!selectedLocation) {
            setSelectedLocation(loc);
            setManualLat(loc.lat.toFixed(6));
            setManualLng(loc.lng.toFixed(6));
          }
        },
        () => console.log("GPS Denied")
      );
    }
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      setManualLat(selectedLocation.lat.toFixed(6));
      setManualLng(selectedLocation.lng.toFixed(6));
    }
  }, [selectedLocation]);

  // --- HANDLERS ---

  const handleMapClick = (lat: number, lng: number) => {
    if(step === 1) setSelectedLocation({ lat, lng });
  };

  const handleManualInput = (type: 'lat' | 'lng', value: string) => {
    if (type === 'lat') setManualLat(value);
    else setManualLng(value);
    const lat = parseFloat(type === 'lat' ? value : manualLat);
    const lng = parseFloat(type === 'lng' ? value : manualLng);
    if (!isNaN(lat) && !isNaN(lng)) setSelectedLocation({ lat, lng });
  };

  const handleResetToGPS = () => {
    if (userLocation) setSelectedLocation(userLocation);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (selected.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(selected);
      } else {
        setPreview(null);
      }
    }
  };

  // --- AI LOGIC SIMULATION ---
  const handleSubmit = async () => {
    // 1. Basic Validation
    if (!selectedLocation || !file) {
      alert("Please ensure a location is selected and an image is uploaded.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Create FormData
      const formData = new FormData();

      // Append textual data
      formData.append('latitude', selectedLocation.lat.toString());
      formData.append('longitude', selectedLocation.lng.toString());
      formData.append('category', category);
      formData.append('description', description);
      
      // Append User Data (Depending on your backend requirements)
      if (user) {
        formData.append('userId', user.id || ''); // Adjust based on your user object
        formData.append('userEmail', user.email || '');
      }

      // Append the File (The key 'evidence' must match what your backend expects)
      formData.append('evidence', file);

      console.log(formData)
      // 3. Make API Call
      const response = await fetch('/api/report', { // Replace with your actual endpoint
        method: 'POST',
        body: formData,
        // Note: Do NOT set 'Content-Type': 'multipart/form-data'. 
        // The browser automatically sets the boundary when passing FormData.
      });

      if (!response.ok) {
        throw new Error(`Error: ${response}`);
      }

      const result = await response.json();

      // 4. Handle Success & Set AI Analysis from backend response
      // Assuming your API returns: { score: number, level: string, reasoning: string }
      setAiAnalysis({
        score: result.score, 
        level: result.level as RiskLevel, 
        reasoning: result.reasoning
      });

      setStep(4); // Move to AI Result Step

    } catch (error) {
      console.error("Submission failed:", error);
      alert("Failed to submit complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateDraft = async () => {
    setIsGeneratingDraft(true);
    await new Promise(r => setTimeout(r, 1500));
    
    const draft = `Subject: Formal Complaint regarding ${category} issue at [${manualLat}, ${manualLng}]

To the Municipal Commissioner,

I am writing to formally report a critical infrastructure issue identified at the coordinates mentioned above. 

Visual evidence collected on ${new Date().toLocaleDateString()} indicates ${description}. 
Preliminary AI analysis assigns this a Risk Score of ${aiAnalysis?.score}/100 (${aiAnalysis?.level}), suggesting immediate attention is required to prevent public safety hazards.

I request an official inspection and prompt resolution.

Sincerely,
[Citizen Name]`;

    setGeneratedComplaint(draft);
    setIsGeneratingDraft(false);
  };

  const handleFinalSend = () => {
    alert("Complaint Sent to Authorities!");
    router.push('/dashboard');
  };

  // --- RENDER HELPERS ---
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-8">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            step >= s ? (s === 4 ? 'bg-purple-600 text-white' : 'bg-slate-900 text-white') : 'bg-slate-200 text-slate-500'
          }`}>
            {step > s ? <CheckCircle2 size={16} /> : (s === 4 ? <BrainCircuit size={16}/> : s)}
          </div>
          {s < 4 && (
            <div className={`w-8 md:w-12 h-1 mx-2 rounded-full ${step > s ? 'bg-slate-900' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      
      {/* 1. Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">New Audit Draft</h1>
            <p className="text-xs text-slate-500">
              {step === 4 ? "AI Analysis & Action" : `Step ${step} of 3`}
            </p>
          </div>
        </div>
        <button 
          onClick={() => router.push('/dashboard')}
          className="text-xs font-bold text-slate-500 hover:text-red-600 uppercase tracking-wider"
        >
          {step === 4 ? "Close" : "Cancel"}
        </button>
      </header>

      {/* 2. Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 lg:p-8">
        <StepIndicator />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* --- LEFT COL: FORM LOGIC --- */}
          <div className="space-y-6">
            <AnimatePresence mode='wait'>
              
              {/* STEP 1: LOCATION */}
              {step === 1 && (
                <motion.div 
                  key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
                >
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <MapPin className="text-blue-500" size={20} /> Confirm Location
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <div className="text-xs text-blue-700">
                        <span className="font-bold block">GPS Detected</span>
                        {userLocation ? `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}` : 'Fetching...'}
                      </div>
                      <button onClick={handleResetToGPS} className="p-2 bg-white rounded shadow-sm text-blue-600 hover:bg-blue-50">
                        <RefreshCw size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Latitude</label>
                        <input type="number" value={manualLat} onChange={(e) => handleManualInput('lat', e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-slate-900 outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Longitude</label>
                        <input type="number" value={manualLng} onChange={(e) => handleManualInput('lng', e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-slate-900 outline-none" />
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 italic">* You can click on the map to adjust the pin precisely.</div>
                    <button onClick={() => setStep(2)} className="w-full mt-4 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">Next: Add Evidence <ChevronRight size={16} /></button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: EVIDENCE */}
              {step === 2 && (
                <motion.div 
                  key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
                >
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Camera className="text-orange-500" size={20} /> Visual Evidence
                  </h2>
                  <div className="space-y-4">
                    {!file ? (
                      <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-colors group">
                        <div className="p-4 bg-slate-100 rounded-full text-slate-400 group-hover:text-blue-500 mb-3 transition-colors"><UploadCloud size={32} /></div>
                        <p className="text-sm font-medium text-slate-600">Click to upload Evidence</p>
                      </div>
                    ) : (
                      <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                        {preview ? <img src={preview} alt="Preview" className="w-full h-64 object-cover" /> : <div className="flex items-center justify-center h-32 gap-3 text-slate-700 font-medium"><FileText size={32} className="text-red-500" />{file.name}</div>}
                        <button onClick={() => { setFile(null); setPreview(null); }} className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm"><X size={16} /></button>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,application/pdf" />
                    <div className="flex gap-3 mt-6">
                      <button onClick={() => setStep(1)} className="flex-1 py-3 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Back</button>
                      <button onClick={() => setStep(3)} disabled={!file} className="flex-[2] bg-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">Next: Details <ChevronRight size={16} /></button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: DETAILS */}
              {step === 3 && (
                <motion.div 
                  key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
                >
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText className="text-green-500" size={20} /> Report Details
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[ProjectCategory.ROAD, ProjectCategory.BUILDING, ProjectCategory.SANITATION].map((cat) => (
                          <button key={cat} onClick={() => setCategory(cat)} className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${category === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>{cat}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                      <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the discrepancy..." className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none resize-none" />
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex items-start gap-3"><AlertTriangle className="text-yellow-600 shrink-0" size={18} /><p className="text-xs text-yellow-700">By submitting this audit, you declare that the evidence provided is authentic.</p></div>
                    <div className="flex gap-3 mt-6">
                      <button onClick={() => setStep(2)} className="flex-1 py-3 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Back</button>
                      <button onClick={handleSubmit} disabled={isSubmitting || !description} className="flex-[2] bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                        {isSubmitting ? <><Loader2 className="animate-spin" /> Analyzing...</> : 'Submit & Analyze'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: AI RESULTS & DRAFTING (NEW) */}
              {step === 4 && aiAnalysis && (
                <motion.div 
                  key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  {/* RISK CARD */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500" />
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <BrainCircuit className="text-purple-600" size={24} /> AI Risk Assessment
                    </h2>
                    
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      {/* Risk Meter */}
                      <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                          <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" 
                            strokeDasharray={351.86} 
                            strokeDashoffset={351.86 - (351.86 * aiAnalysis.score) / 100}
                            className={`${aiAnalysis.level === RiskLevel.HIGH ? 'text-red-500' : 'text-yellow-500'} transition-all duration-1000 ease-out`} 
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-3xl font-bold text-slate-900">{aiAnalysis.score}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Risk Score</span>
                        </div>
                      </div>

                      {/* Analysis Text */}
                      <div className="flex-1">
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-2 ${aiAnalysis.level === RiskLevel.HIGH ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {aiAnalysis.level} Severity
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-purple-200 pl-3">
                          "{aiAnalysis.reasoning}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DRAFTING ACTION */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <PenTool size={18} className="text-blue-600"/> Action Recommended
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Based on the high risk score, we recommend sending a formal complaint immediately.
                    </p>

                    {!generatedComplaint ? (
                      <button 
                        onClick={handleGenerateDraft}
                        disabled={isGeneratingDraft}
                        className="w-full py-3 bg-white border-2 border-slate-200 hover:border-purple-500 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-all group"
                      >
                        {isGeneratingDraft ? <Loader2 className="animate-spin" /> : <><BrainCircuit size={18} className="group-hover:text-purple-600"/> Generate Formal Draft with AI</>}
                      </button>
                    ) : (
                      <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                        <textarea 
                          value={generatedComplaint}
                          onChange={(e) => setGeneratedComplaint(e.target.value)}
                          className="w-full h-48 p-4 text-sm font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <div className="flex gap-3">
                          <button onClick={() => router.push('/dashboard')} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Skip & Return</button>
                          <button onClick={handleFinalSend} className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-200">
                            <Send size={18} /> Send to Authorities
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* --- RIGHT COL: MAP PREVIEW --- */}
          <div className="hidden lg:block relative h-[500px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
             
             {/* Map Status Overlay */}
             <div className="absolute top-4 left-4 z-[500] bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm border border-slate-200 flex items-center gap-2">
                <Crosshair size={14} className={step === 1 ? "text-purple-600 animate-pulse" : "text-slate-400"} />
                {step === 1 ? "Click map to set location" : "Location Locked"}
             </div>
             
             <MapVisualizer 
                records={[]} 
                reports={[]} 
                onRecordSelect={() => {}}
                userLocation={userLocation}
                draftLocation={selectedLocation} 
                onMapClick={handleMapClick}
             />
             
             {step > 1 && (
               <div className="absolute inset-0 bg-slate-900/10 z-[400] backdrop-grayscale-[0.5] pointer-events-none transition-all" />
             )}
          </div>

        </div>
      </main>
    </div>
  );
}
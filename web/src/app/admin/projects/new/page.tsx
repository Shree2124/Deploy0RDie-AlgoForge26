'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  Loader2, 
  UploadCloud, 
  FileText, 
  X, 
  FileSpreadsheet, 
  Download,
  Crosshair
} from 'lucide-react';
import { ProjectCategory } from '@/types/types';
// Map imports
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

// --- SETUP LEAFLET ICONS ---
// Fix for default marker icons missing in Leaflet with Webpack/Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- SUB-COMPONENT: LOCATION MARKER HANDLER ---
function LocationMarker({ position, onSelect }: { position: [number, number] | null, onSelect: (lat: number, lng: number) => void }) {
  const map = useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

// --- DYNAMIC MAP COMPONENT ---
const LocationPickerMap = dynamic(
  () => Promise.resolve(({ selectedLat, selectedLng, onLocationSelect }: any) => {
    // Default center (e.g., Mumbai) if nothing selected yet
    const defaultCenter: [number, number] = [19.0760, 72.8777];
    const position: [number, number] | null = selectedLat && selectedLng ? [parseFloat(selectedLat), parseFloat(selectedLng)] : null;
    
    return (
      <MapContainer 
        center={position || defaultCenter} 
        zoom={11} 
        scrollWheelZoom={false} // Disable scroll zoom so page scrolling isn't trapped
        style={{ height: '100%', width: '100%' }}
        className="z-0" // Ensure it doesn't overlap dropdowns
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} onSelect={onLocationSelect} />
      </MapContainer>
    );
  }), 
  { 
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-slate-100 flex items-center justify-center animate-pulse text-slate-400">
        <Loader2 className="animate-spin mr-2" /> Loading Map...
      </div>
    )
  }
);


export default function NewProjectPage() {
  const router = useRouter();
  
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  
  // Form Data (Added 'id' for Database compatibility)
  const [formData, setFormData] = useState({
    id: '', 
    projectName: '',
    category: ProjectCategory.ROAD,
    contractor: '',
    budget: '',
    deadline: '',
    lat: '',
    lng: '',
    description: ''
  });

  // File States
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [bulkFile, setBulkFile] = useState<File | null>(null);

  // Refs for hidden inputs
  const contractInputRef = useRef<HTMLInputElement>(null);
  const bulkInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Map Location Select Handler
  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      lat: lat.toFixed(6), // Limit precision for display
      lng: lng.toFixed(6)
    }));
  };

  // PDF Handler
  const handleContractFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setContractFile(e.target.files[0]);
    }
  };

  // CSV/Excel Handler
  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBulkFile(e.target.files[0]);
    }
  };

  // REAL API DB SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.lat || !formData.lng) {
      alert("Please select the project location on the map.");
      return;
    }

    setLoading(true);
    
    try {
      // Create payload matching the API route structure
      const payload = {
        id: formData.id,
        projectName: formData.projectName,
        category: formData.category,
        budget: formData.budget,
        contractor: formData.contractor,
        deadline: formData.deadline,
        status: "Planned",
        latitude: formData.lat,
        longitude: formData.lng,
        description: formData.description,
      };

      const res = await fetch("/api/dashboard/projects/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create project");
      }

      alert(`Project "${formData.projectName}" Created Successfully!`);
      router.push('/admin/dashboard');
    } catch (error: any) {
      alert(error.message || "Something went wrong while saving the project.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Bulk Import Submit
  const handleBulkSubmit = async () => {
    if (!bulkFile) return;
    setBulkLoading(true);
    // Simulate Parsing and Upload
    await new Promise(r => setTimeout(r, 2000));
    setBulkLoading(false);
    alert(`Successfully imported data from ${bulkFile.name}`);
    router.push('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Project Management</h1>
        </div>

        {/* =========================================== */}
        {/* SECTION 1: CREATE SINGLE PROJECT FORM       */}
        {/* =========================================== */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-blue-600" size={20}/> Create Single Project Record
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Project ID</label>
              <input 
                name="id" required
                value={formData.id} onChange={handleChange}
                placeholder="e.g. MCGM-003"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Project Name</label>
              <input 
                name="projectName" required
                value={formData.projectName} onChange={handleChange}
                placeholder="e.g. Andheri Metro Station Upgrade"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
              <select 
                name="category"
                value={formData.category} onChange={handleChange}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white"
              >
                {Object.values(ProjectCategory).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Contractor Name</label>
              <input 
                name="contractor" required
                value={formData.contractor} onChange={handleChange}
                placeholder="e.g. L&T Construction"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Budget (₹)</label>
              <input 
                name="budget" type="number" required
                value={formData.budget} onChange={handleChange}
                placeholder="50000000"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Deadline</label>
              <input 
                name="deadline" type="date" required
                value={formData.deadline} onChange={handleChange}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
          </div>

          {/* --- MAP LOCATION PICKER --- */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-blue-600" /> Project Location
            </h3>
            
            {/* Map Container - Fixed Small Height (h-64 = 16rem = 256px) */}
            <div className="h-64 w-full rounded-lg overflow-hidden border border-slate-300 shadow-sm relative z-0 mb-4">
               <LocationPickerMap 
                 selectedLat={formData.lat}
                 selectedLng={formData.lng}
                 onLocationSelect={handleLocationSelect}
               />
               {(!formData.lat || !formData.lng) && (
                 <div className="absolute inset-0 bg-black/10 pointer-events-none flex items-center justify-center">
                    <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 flex items-center gap-1 shadow-sm">
                      <Crosshair size={14}/> Click map to select location
                    </div>
                 </div>
               )}
            </div>

            {/* Read-only Inputs showing selected coordinates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Latitude</label>
                <input 
                  name="lat" readOnly
                  value={formData.lat}
                  placeholder="Select on map"
                  className="w-full p-2 border border-slate-300 rounded bg-white text-sm text-slate-500 font-mono focus:outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Longitude</label>
                <input 
                  name="lng" readOnly
                  value={formData.lng}
                  placeholder="Select on map"
                  className="w-full p-2 border border-slate-300 rounded bg-white text-sm text-slate-500 font-mono focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* --- CONTRACT PDF UPLOAD SECTION --- */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Contract Document (Optional)</label>
            <div 
              onClick={() => contractInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              {!contractFile ? (
                <>
                  <div className="p-3 bg-slate-100 rounded-full mb-3 text-slate-400 group-hover:text-blue-500 transition-colors">
                    <UploadCloud size={24} />
                  </div>
                  <p className="text-sm font-medium text-slate-600">Click to upload Contract PDF</p>
                  <p className="text-xs text-slate-400 mt-1">Max file size 10MB</p>
                </>
              ) : (
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                  <FileText className="text-red-500" size={20} />
                  <span className="text-sm font-medium text-slate-700">{contractFile.name}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setContractFile(null); }}
                    className="p-1 hover:bg-slate-100 rounded-full ml-2"
                  >
                    <X size={16} className="text-slate-400 hover:text-red-500"/>
                  </button>
                </div>
              )}
              <input 
                type="file" 
                ref={contractInputRef} 
                onChange={handleContractFileChange} 
                className="hidden" 
                accept="application/pdf" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
            <textarea 
              name="description" rows={4}
              value={formData.description} onChange={handleChange}
              placeholder="Scope of work..."
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none resize-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !formData.lat || !formData.projectName || !formData.id}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-slate-200 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Save size={20}/> Create Project Record</>}
          </button>
        </form>

        {/* Divider */}
        {/* <div className="flex items-center gap-4 py-4">
          <div className="h-px bg-slate-200 flex-1"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Or</span>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div> */}

        {/* =========================================== */}
        {/* SECTION 2: BULK IMPORT (CSV/EXCEL)          */}
        {/* =========================================== */}
        {/* <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-bold text-green-900 flex items-center gap-2">
                <FileSpreadsheet className="text-green-600" size={20}/> Bulk Import Projects
              </h2>
              <p className="text-green-800/70 text-sm mt-1">
                Upload a CSV or Excel file to create multiple project records at once.
              </p>
            </div>
            <button className="text-xs font-bold text-green-700 flex items-center gap-1 hover:underline bg-white px-3 py-1.5 rounded-lg border border-green-200 shadow-sm">
              <Download size={14} /> Download Template
            </button>
          </div>

          <div 
            onClick={() => bulkInputRef.current?.click()}
            className="bg-white border-2 border-dashed border-green-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:shadow-md transition-all group"
          >
            {!bulkFile ? (
              <>
                <div className="p-3 bg-green-50 rounded-full mb-3 text-green-400 group-hover:text-green-600 transition-colors">
                  <FileSpreadsheet size={32} />
                </div>
                <p className="text-sm font-medium text-slate-700">Click to upload Data Sheet</p>
                <p className="text-xs text-slate-400 mt-1">.csv, .xlsx, .xls</p>
              </>
            ) : (
              <div className="flex items-center gap-4 w-full justify-between px-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg text-green-700">
                    <FileSpreadsheet size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{bulkFile.name}</p>
                    <p className="text-xs text-slate-500">Ready to import</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setBulkFile(null); }}
                  className="text-slate-400 hover:text-red-500"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            <input 
              type="file" 
              ref={bulkInputRef} 
              onChange={handleBulkFileChange} 
              className="hidden" 
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleBulkSubmit}
              disabled={!bulkFile || bulkLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-green-200"
            >
              {bulkLoading ? <Loader2 className="animate-spin" size={18}/> : 'Import Data'}
            </button>
          </div>
        </div> */}

      </div>
    </div>
  );
}
'use client';
import React, { useState, useEffect, useCallback } from 'react';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Save,
  MapPin,
  Loader2,
  FileText,
  Crosshair,
  Trash2,
  Pencil
} from 'lucide-react';

import { ProjectCategory } from '@/types/types';
// Map imports
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

type LocationMarkerProps = {
  position: [number, number] | null;
  onSelect: (lat: number, lng: number) => void;
};

type LocationPickerMapProps = {
  selectedLat: string;
  selectedLng: string;
  onLocationSelect: (lat: number, lng: number) => void;
};

type ProjectRow = {
  id: string;
  project_name: string;
  category: string;
  budget: number | null;
  deadline: string | null;
  status: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  department: string | null;
  vendor_id: number | null;
  report: string | null;
  created_at?: string;
};

type VendorRow = {
  id: number;
  name: string;
  years_of_experience: number | null;
  phone_number: number | null;
  email: string | null;
  risk_score: number | null;
  created_at?: string;
};

type ProjectFormState = {
  id: string;
  project_name: string;
  category: string;
  budget: string;
  deadline: string;
  status: string;
  latitude: string;
  longitude: string;
  description: string;
  department: string;
  vendor_id: string;
  report: string;
};

type VendorFormState = {
  name: string;
  years_of_experience: string;
  phone_number: string;
  email: string;
};

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
function LocationMarker({ position, onSelect }: LocationMarkerProps) {

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
  () => Promise.resolve(({ selectedLat, selectedLng, onLocationSelect }: LocationPickerMapProps) => {

    // Default center (e.g., Mumbai) if nothing selected yet
    const defaultCenter: [number, number] = [19.0760, 72.8777];
    const position: [number, number] | null = selectedLat && selectedLng
      ? [parseFloat(selectedLat), parseFloat(selectedLng)]
      : null;

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
  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
  };

  const generateProjectId = () => `PRJ-${Date.now()}`;

  const [activeTab, setActiveTab] = useState<'projects' | 'vendor'>('projects');
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingVendorId, setEditingVendorId] = useState<number | null>(null);
  const [projectReportFile, setProjectReportFile] = useState<File | null>(null);

  const [projectForm, setProjectForm] = useState<ProjectFormState>({
    id: generateProjectId(),
    project_name: '',
    category: ProjectCategory.ROAD,
    budget: '',
    deadline: '',
    status: 'Planned',
    latitude: '',
    longitude: '',
    description: '',
    department: '',
    vendor_id: '',
    report: '',
  });

  const [vendorForm, setVendorForm] = useState<VendorFormState>({
    name: '',
    years_of_experience: '',
    phone_number: '',
    email: '',
  });

  const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProjectForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleReportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setProjectReportFile(selected);
  };

  const handleVendorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVendorForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setProjectForm((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));
  };

  const fetchProjects = useCallback(async () => {
    const res = await fetch('/api/dashboard/projects');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch projects');
    setProjects(data.projects || []);
  }, []);

  const fetchVendors = useCallback(async () => {
    const res = await fetch('/api/dashboard/vendor');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch vendors');
    setVendors(data.vendors || []);
  }, []);

  const loadAll = useCallback(async () => {
    setLoadingList(true);
    try {
      await Promise.all([fetchProjects(), fetchVendors()]);
    } catch (error) {
      alert(getErrorMessage(error, 'Failed to load data'));
    } finally {
      setLoadingList(false);
    }
  }, [fetchProjects, fetchVendors]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const resetProjectForm = () => {
    setEditingProjectId(null);
    setProjectReportFile(null);
    setProjectForm({
      id: generateProjectId(),
      project_name: '',
      category: ProjectCategory.ROAD,
      budget: '',
      deadline: '',
      status: 'Planned',
      latitude: '',
      longitude: '',
      description: '',
      department: '',
      vendor_id: '',
      report: '',
    });
  };

  const resetVendorForm = () => {
    setEditingVendorId(null);
    setVendorForm({
      name: '',
      years_of_experience: '',
      phone_number: '',
      email: '',
    });
  };

  const handleProjectSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!projectForm.id || !projectForm.project_name || !projectForm.category || !projectForm.budget) {
      alert('Please fill all required project fields.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('id', projectForm.id);
      formData.append('project_name', projectForm.project_name);
      formData.append('category', projectForm.category);
      formData.append('budget', projectForm.budget);
      formData.append('deadline', projectForm.deadline || '');
      formData.append('status', projectForm.status || 'Planned');
      formData.append('latitude', projectForm.latitude || '');
      formData.append('longitude', projectForm.longitude || '');
      formData.append('description', projectForm.description || '');
      formData.append('department', projectForm.department || '');
      formData.append('vendor_id', projectForm.vendor_id || '');
      formData.append('report', projectForm.report || '');
      if (projectReportFile) {
        formData.append('report_file', projectReportFile);
      }

      const endpoint = editingProjectId
        ? `/api/dashboard/projects/${editingProjectId}`
        : '/api/dashboard/projects';
      const method = editingProjectId ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Project save failed');

      alert(editingProjectId ? 'Project updated successfully.' : 'Project created successfully.');
      resetProjectForm();
      await fetchProjects();
    } catch (error) {
      alert(getErrorMessage(error, 'Failed to save project'));
    } finally {
      setLoading(false);
    }
  };

  const handleVendorSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!vendorForm.name) {
      alert('Vendor name is required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...vendorForm,
        years_of_experience: vendorForm.years_of_experience ? Number(vendorForm.years_of_experience) : null,
        phone_number: vendorForm.phone_number ? Number(vendorForm.phone_number) : null,
      };

      const endpoint = editingVendorId
        ? `/api/dashboard/vendor/${editingVendorId}`
        : '/api/dashboard/vendor';
      const method = editingVendorId ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Vendor save failed');

      alert(editingVendorId ? 'Vendor updated successfully.' : 'Vendor created successfully.');
      resetVendorForm();
      await fetchVendors();
    } catch (error) {
      alert(getErrorMessage(error, 'Failed to save vendor'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = (project: ProjectRow) => {
    setEditingProjectId(project.id);
    setProjectReportFile(null);
    setProjectForm({
      id: project.id,
      project_name: project.project_name || '',
      category: project.category || ProjectCategory.ROAD,
      budget: project.budget != null ? String(project.budget) : '',
      deadline: project.deadline || '',
      status: project.status || 'Planned',
      latitude: project.latitude != null ? String(project.latitude) : '',
      longitude: project.longitude != null ? String(project.longitude) : '',
      description: project.description || '',
      department: project.department || '',
      vendor_id: project.vendor_id != null ? String(project.vendor_id) : '',
      report: project.report || '',
    });
    setActiveTab('projects');
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    try {
      const res = await fetch(`/api/dashboard/projects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      await fetchProjects();
    } catch (error) {
      alert(getErrorMessage(error, 'Failed to delete project'));
    }
  };

  const handleEditVendor = (vendor: VendorRow) => {
    setEditingVendorId(vendor.id);
    setVendorForm({
      name: vendor.name || '',
      years_of_experience: vendor.years_of_experience != null ? String(vendor.years_of_experience) : '',
      phone_number: vendor.phone_number != null ? String(vendor.phone_number) : '',
      email: vendor.email || '',
    });
    setActiveTab('vendor');
  };

  const handleDeleteVendor = async (id: number) => {
    if (!confirm('Delete this vendor?')) return;
    try {
      const res = await fetch(`/api/dashboard/vendor/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      await fetchVendors();
    } catch (error) {
      alert(getErrorMessage(error, 'Failed to delete vendor'));
    }
  };

  const vendorNameById = (id: number | null) => {
    if (!id) return 'Not Assigned';
    const vendor = vendors.find((v) => v.id === id);
    return vendor ? vendor.name : `Vendor #${id}`;
  };

  const selectedLat = projectForm.latitude;
  const selectedLng = projectForm.longitude;

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Projects & Vendors</h1>
        </div>

        <div className="bg-white rounded-xl p-2 border border-slate-200 inline-flex gap-2">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'projects' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab('vendor')}
            className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'vendor' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            Vendor
          </button>
        </div>

        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <form onSubmit={handleProjectSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="text-blue-600" size={20} />
                {editingProjectId ? 'Update Project' : 'Create Project'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Project ID</label>
                  <input
                    name="id"
                    required
                    disabled
                    value={projectForm.id}
                    onChange={handleProjectChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none"
                    placeholder="PRJ-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Project Name</label>
                  <input
                    name="project_name"
                    required
                    value={projectForm.project_name}
                    onChange={handleProjectChange}
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none"
                    placeholder="Road Widening"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                  <select name="category" value={projectForm.category} onChange={handleProjectChange} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none bg-white">
                    {Object.values(ProjectCategory).map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                    <option value="General">General</option>
                    <option value="Road & Potholes">Road & Potholes</option>
                    <option value="Electricity & Streetlights">Electricity & Streetlights</option>
                    <option value="Building & Construction">Building & Construction</option>
                    <option value="Water & Sewage">Water & Sewage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Vendor</label>
                  <select name="vendor_id" value={projectForm.vendor_id} onChange={handleProjectChange} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none bg-white">
                    <option value="">Select vendor</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>{vendor.name} (#{vendor.id})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Budget</label>
                  <input name="budget" type="number" required value={projectForm.budget} onChange={handleProjectChange} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Deadline</label>
                  <input name="deadline" type="date" value={projectForm.deadline} onChange={handleProjectChange} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                  <select name="status" value={projectForm.status} onChange={handleProjectChange} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none bg-white">
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-blue-600" /> Project Location
                </h3>
                <div className="h-56 w-full rounded-lg overflow-hidden border border-slate-300 shadow-sm relative z-0 mb-3">
                  <LocationPickerMap selectedLat={selectedLat} selectedLng={selectedLng} onLocationSelect={handleLocationSelect} />
                  {(!selectedLat || !selectedLng) && (
                    <div className="absolute inset-0 bg-black/10 pointer-events-none flex items-center justify-center">
                      <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 flex items-center gap-1 shadow-sm">
                        <Crosshair size={14} /> Click map to select location
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input name="latitude" readOnly value={projectForm.latitude} placeholder="Latitude" className="w-full p-2 border border-slate-300 rounded text-sm font-mono bg-white text-slate-600" />
                  <input name="longitude" readOnly value={projectForm.longitude} placeholder="Longitude" className="w-full p-2 border border-slate-300 rounded text-sm font-mono bg-white text-slate-600" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  name="department"
                  value={projectForm.department}
                  onChange={handleProjectChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none bg-white"
                >
                  <option value="">Select Department</option>
                  <option value="Municipal Corporation (MCGM)">Municipal Corporation (MCGM)</option>
                  <option value="Public Works Department (PWD)">Public Works Department (PWD)</option>
                  <option value="Water Supply Board">Water Supply Board</option>
                  <option value="Electricity &amp; Power Board">Electricity &amp; Power Board</option>
                  <option value="Urban Development Authority">Urban Development Authority</option>
                </select>
                <div>
                  <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,image/*" onChange={handleReportFileChange} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none bg-white" />
                  <p className="text-xs text-slate-500 mt-1">Upload report file to `project_reports` bucket</p>
                </div>
              </div>

              {projectForm.report && (
                <p className="text-xs text-slate-600 -mt-2">
                  Existing Report: <a href={projectForm.report} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View File</a>
                </p>
              )}

              <textarea name="description" rows={3} value={projectForm.description} onChange={handleProjectChange} placeholder="Description" className="w-full p-2.5 border border-slate-300 rounded-lg outline-none resize-none" />

              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-60">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={16} /> {editingProjectId ? 'Update Project' : 'Create Project'}</>}
                </button>
                {editingProjectId && (
                  <button type="button" onClick={resetProjectForm} className="px-4 py-3 bg-slate-200 text-slate-800 font-bold rounded-lg hover:bg-slate-300">
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Projects List</h2>
              {loadingList ? (
                <div className="py-8 text-center text-slate-500">Loading projects...</div>
              ) : projects.length === 0 ? (
                <div className="py-8 text-center text-slate-500">No projects found.</div>
              ) : (
                <div className="space-y-3 max-h-[800px] overflow-auto pr-1">
                  {projects.map((project) => (
                    <div key={project.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-900">{project.project_name}</h3>
                          <p className="text-xs text-slate-500 font-mono">{project.id}</p>
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-700">{project.status || 'Planned'}</span>
                      </div>
                      <div className="mt-2 text-sm text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-1">
                        <p><strong>Category:</strong> {project.category || '-'}</p>
                        <p><strong>Budget:</strong> {project.budget ?? '-'}</p>
                        <p><strong>Vendor:</strong> {vendorNameById(project.vendor_id)}</p>
                        <p><strong>Deadline:</strong> {project.deadline || '-'}</p>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => handleEditProject(project)} className="px-3 py-1.5 text-xs font-bold rounded bg-amber-100 text-amber-800 hover:bg-amber-200 flex items-center gap-1">
                          <Pencil size={13} /> Edit
                        </button>
                        <button onClick={() => handleDeleteProject(project.id)} className="px-3 py-1.5 text-xs font-bold rounded bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-1">
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'vendor' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <form onSubmit={handleVendorSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-800">{editingVendorId ? 'Update Vendor' : 'Create Vendor'}</h2>
              <input name="name" required value={vendorForm.name} onChange={handleVendorChange} placeholder="Vendor Name" className="w-full p-2.5 border border-slate-300 rounded-lg outline-none" />
              <input name="email" type="email" value={vendorForm.email} onChange={handleVendorChange} placeholder="Email" className="w-full p-2.5 border border-slate-300 rounded-lg outline-none" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="phone_number" type="number" value={vendorForm.phone_number} onChange={handleVendorChange} placeholder="Phone Number" className="w-full p-2.5 border border-slate-300 rounded-lg outline-none" />
                <input name="years_of_experience" type="number" value={vendorForm.years_of_experience} onChange={handleVendorChange} placeholder="Years of Experience" className="w-full p-2.5 border border-slate-300 rounded-lg outline-none" />
              </div>

              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-60">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={16} /> {editingVendorId ? 'Update Vendor' : 'Create Vendor'}</>}
                </button>
                {editingVendorId && (
                  <button type="button" onClick={resetVendorForm} className="px-4 py-3 bg-slate-200 text-slate-800 font-bold rounded-lg hover:bg-slate-300">
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Vendors List</h2>
              {loadingList ? (
                <div className="py-8 text-center text-slate-500">Loading vendors...</div>
              ) : vendors.length === 0 ? (
                <div className="py-8 text-center text-slate-500">No vendors found.</div>
              ) : (
                <div className="space-y-3 max-h-[800px] overflow-auto pr-1">
                  {vendors.map((vendor) => (
                    <div key={vendor.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-900">{vendor.name}</h3>
                          <p className="text-xs text-slate-500">ID: {vendor.id}</p>
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-700">Risk: {vendor.risk_score ?? '-'}</span>
                      </div>
                      <div className="mt-2 text-sm text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-1">
                        <p><strong>Email:</strong> {vendor.email || '-'}</p>
                        <p><strong>Phone:</strong> {vendor.phone_number ?? '-'}</p>
                        <p><strong>Experience:</strong> {vendor.years_of_experience ?? '-'} years</p>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => handleEditVendor(vendor)} className="px-3 py-1.5 text-xs font-bold rounded bg-amber-100 text-amber-800 hover:bg-amber-200 flex items-center gap-1">
                          <Pencil size={13} /> Edit
                        </button>
                        <button onClick={() => handleDeleteVendor(vendor.id)} className="px-3 py-1.5 text-xs font-bold rounded bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-1">
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
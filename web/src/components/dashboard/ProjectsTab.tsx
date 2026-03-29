'use client';
import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Save,
  MapPin,
  Loader2,
  FileText,
  Crosshair,
  Trash2,
  Pencil,
  FolderOpen
} from 'lucide-react';

import { ProjectCategory } from '@/types/types';
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

// --- SETUP LEAFLET ICONS ---
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

function LocationMarker({ position, onSelect }: LocationMarkerProps) {
  const map = useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
      // Removed map.flyTo to stop jarring zoom jumps on click
    },
  });
  return position === null ? null : <Marker position={position}></Marker>;
}

const LocationPickerMap = dynamic(
  () => Promise.resolve(({ selectedLat, selectedLng, onLocationSelect }: LocationPickerMapProps) => {
    const defaultCenter: [number, number] = [19.0760, 72.8777];
    const position: [number, number] | null = selectedLat && selectedLng
      ? [parseFloat(selectedLat), parseFloat(selectedLng)]
      : null;
    return (
      <MapContainer
        center={position || defaultCenter}
        zoom={11}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
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
      <div className="h-full w-full flex items-center justify-center animate-pulse" style={{ backgroundColor: "#e0f7f9", color: "#57737a" }}>
        <Loader2 className="animate-spin mr-2" /> Loading Map...
      </div>
    )
  }
);

// Theme helpers
const inputStyle = {
  backgroundColor: "#f4feff",
  border: "1px solid #b0d8db",
  color: "#040f0f",
};
const inputClass = "w-full p-2.5 rounded-xl outline-none font-medium transition-colors focus:ring-2 focus:ring-[#85bdbf] focus:border-[#85bdbf]";

export default function ProjectsTab() {
  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
  };

  const generateProjectId = () => `PRJ-${Date.now()}`;

  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
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

  const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProjectForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleReportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setProjectReportFile(selected);
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

  const vendorNameById = (id: number | null) => {
    if (!id) return 'Not Assigned';
    const vendor = vendors.find((v) => v.id === id);
    return vendor ? vendor.name : `Vendor #${id}`;
  };

  const selectedLat = projectForm.latitude;
  const selectedLng = projectForm.longitude;

  const statusColor = (status: string | null) => {
    switch (status) {
      case 'Completed': return { bg: '#e0f7f9', text: '#057a55', border: '#85bdbf' };
      case 'In Progress': return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' };
      default: return { bg: '#f4feff', text: '#57737a', border: '#b0d8db' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl" style={{ backgroundColor: "#e0f7f9" }}>
          <FolderOpen size={22} style={{ color: "#57737a" }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#040f0f" }}>Project Management</h2>
          <p className="text-xs" style={{ color: "#57737a" }}>Create, edit, and manage infrastructure projects</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Create/Edit Form */}
        <form onSubmit={handleProjectSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4" style={{ border: "1px solid #b0d8db" }}>
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "#040f0f" }}>
            <FileText size={20} style={{ color: "#57737a" }} />
            {editingProjectId ? 'Update Project' : 'Create Project'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: "#040f0f" }}>Project ID</label>
              <input name="id" required disabled value={projectForm.id} onChange={handleProjectChange} className={inputClass} style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }} placeholder="PRJ-001" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: "#040f0f" }}>Project Name</label>
              <input name="project_name" required value={projectForm.project_name} onChange={handleProjectChange} className={inputClass} style={inputStyle} placeholder="Road Widening" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: "#040f0f" }}>Category</label>
              <select name="category" value={projectForm.category} onChange={handleProjectChange} className={inputClass} style={inputStyle}>
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
              <label className="block text-sm font-bold mb-1" style={{ color: "#040f0f" }}>Vendor</label>
              <select name="vendor_id" value={projectForm.vendor_id} onChange={handleProjectChange} className={inputClass} style={inputStyle}>
                <option value="">Select vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>{vendor.name} (#{vendor.id})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: "#040f0f" }}>Budget</label>
              <input name="budget" type="number" required value={projectForm.budget} onChange={handleProjectChange} className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: "#040f0f" }}>Deadline</label>
              <input name="deadline" type="date" value={projectForm.deadline} onChange={handleProjectChange} className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: "#040f0f" }}>Status</label>
              <select name="status" value={projectForm.status} onChange={handleProjectChange} className={inputClass} style={inputStyle}>
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl space-y-3" style={{ backgroundColor: "#e0f7f9", border: "1px solid #b0d8db" }}>
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: "#040f0f" }}>
              <MapPin size={16} style={{ color: "#57737a" }} /> Project Location
            </h3>
            <div className="h-56 w-full rounded-lg overflow-hidden shadow-sm relative z-0" style={{ border: "1px solid #b0d8db" }}>
              <LocationPickerMap selectedLat={selectedLat} selectedLng={selectedLng} onLocationSelect={handleLocationSelect} />
              {(!selectedLat || !selectedLng) && (
                <div className="absolute inset-0 bg-black/10 pointer-events-none flex items-center justify-center">
                  <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm" style={{ color: "#57737a" }}>
                    <Crosshair size={14} /> Click map to select location
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input name="latitude" readOnly value={projectForm.latitude} placeholder="Latitude" className="w-full p-2 rounded-lg text-sm font-mono" style={{ ...inputStyle, backgroundColor: "#fff" }} />
              <input name="longitude" readOnly value={projectForm.longitude} placeholder="Longitude" className="w-full p-2 rounded-lg text-sm font-mono" style={{ ...inputStyle, backgroundColor: "#fff" }} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select name="department" value={projectForm.department} onChange={handleProjectChange} className={inputClass} style={inputStyle}>
              <option value="">Select Department</option>
              <option value="Municipal Corporation (MCGM)">Municipal Corporation (MCGM)</option>
              <option value="Public Works Department (PWD)">Public Works Department (PWD)</option>
              <option value="Water Supply Board">Water Supply Board</option>
              <option value="Electricity &amp; Power Board">Electricity &amp; Power Board</option>
              <option value="Urban Development Authority">Urban Development Authority</option>
            </select>
            <div>
              <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,image/*" onChange={handleReportFileChange} className={inputClass} style={inputStyle} />
              <p className="text-xs mt-1" style={{ color: "#85bdbf" }}>Upload report file</p>
            </div>
          </div>

          {projectForm.report && (
            <p className="text-xs" style={{ color: "#57737a" }}>
              Existing Report: <a href={projectForm.report} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: "#85bdbf" }}>View File</a>
            </p>
          )}

          <textarea name="description" rows={3} value={projectForm.description} onChange={handleProjectChange} placeholder="Description" className={inputClass + " resize-none"} style={inputStyle} />

          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="flex-1 py-3 font-bold text-white rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-60 hover:-translate-y-0.5" style={{ backgroundColor: "#040f0f" }}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={16} /> {editingProjectId ? 'Update Project' : 'Create Project'}</>}
            </button>
            {editingProjectId && (
              <button type="button" onClick={resetProjectForm} className="px-4 py-3 font-bold rounded-xl transition-colors" style={{ backgroundColor: "#e0f7f9", color: "#57737a" }}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Projects List */}
        <div className="bg-white rounded-2xl shadow-sm p-6" style={{ border: "1px solid #b0d8db" }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: "#040f0f" }}>Projects List</h2>
          {loadingList ? (
            <div className="py-8 text-center font-medium" style={{ color: "#57737a" }}>Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="py-8 text-center font-medium" style={{ color: "#85bdbf" }}>No projects found.</div>
          ) : (
            <div className="space-y-3 max-h-[800px] overflow-auto pr-1">
              {projects.map((project) => {
                const sc = statusColor(project.status);
                return (
                  <div key={project.id} className="rounded-xl p-4 hover:shadow-md transition-shadow" style={{ border: "1px solid #b0d8db" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold" style={{ color: "#040f0f" }}>{project.project_name}</h3>
                        <p className="text-xs font-mono" style={{ color: "#85bdbf" }}>{project.id}</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                        {project.status || 'Planned'}
                      </span>
                    </div>
                    <div className="mt-2 text-sm grid grid-cols-1 sm:grid-cols-2 gap-1" style={{ color: "#57737a" }}>
                      <p><strong style={{ color: "#040f0f" }}>Category:</strong> {project.category || '-'}</p>
                      <p><strong style={{ color: "#040f0f" }}>Budget:</strong> {project.budget != null ? `₹${Number(project.budget).toLocaleString()}` : '-'}</p>
                      <p><strong style={{ color: "#040f0f" }}>Vendor:</strong> {vendorNameById(project.vendor_id)}</p>
                      <p><strong style={{ color: "#040f0f" }}>Deadline:</strong> {project.deadline || '-'}</p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => handleEditProject(project)} className="px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors" style={{ backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" }}>
                        <Pencil size={13} /> Edit
                      </button>
                      <button onClick={() => handleDeleteProject(project.id)} className="px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors bg-red-50 text-red-700 hover:bg-red-100 border border-red-200">
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

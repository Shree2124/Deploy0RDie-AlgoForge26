'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Save,
  Loader2,
  Trash2,
  Pencil,
  Users,
  Mail,
  Phone,
  Briefcase
} from 'lucide-react';

type VendorRow = {
  id: number;
  name: string;
  years_of_experience: number | null;
  phone_number: number | null;
  email: string | null;
  risk_score: number | null;
  created_at?: string;
};

type VendorFormState = {
  name: string;
  years_of_experience: string;
  phone_number: string;
  email: string;
};

// Theme helpers
const inputStyle = {
  backgroundColor: "#f4feff",
  border: "1px solid #b0d8db",
  color: "#040f0f",
};
const inputClass = "w-full p-2.5 rounded-xl outline-none font-medium transition-colors focus:ring-2 focus:ring-[#85bdbf] focus:border-[#85bdbf]";

export default function VendorsTab() {
  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
  };

  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState<number | null>(null);

  const [vendorForm, setVendorForm] = useState<VendorFormState>({
    name: '',
    years_of_experience: '',
    phone_number: '',
    email: '',
  });

  const handleVendorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVendorForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const fetchVendors = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch('/api/dashboard/vendor');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch vendors');
      setVendors(data.vendors || []);
    } catch (error) {
      alert(getErrorMessage(error, 'Failed to load vendors'));
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const resetVendorForm = () => {
    setEditingVendorId(null);
    setVendorForm({
      name: '',
      years_of_experience: '',
      phone_number: '',
      email: '',
    });
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

  const handleEditVendor = (vendor: VendorRow) => {
    setEditingVendorId(vendor.id);
    setVendorForm({
      name: vendor.name || '',
      years_of_experience: vendor.years_of_experience != null ? String(vendor.years_of_experience) : '',
      phone_number: vendor.phone_number != null ? String(vendor.phone_number) : '',
      email: vendor.email || '',
    });
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

  const getRiskColor = (score: number | null) => {
    if (score === null) return { bg: '#f4feff', text: '#85bdbf', border: '#b0d8db' };
    if (score >= 70) return { bg: '#fef2f2', text: '#b91c1c', border: '#fca5a5' };
    if (score >= 40) return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' };
    return { bg: '#e0f7f9', text: '#057a55', border: '#85bdbf' };
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl" style={{ backgroundColor: "#e0f7f9" }}>
          <Users size={22} style={{ color: "#57737a" }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#040f0f" }}>Vendor Management</h2>
          <p className="text-xs" style={{ color: "#57737a" }}>Create, edit, and manage vendor profiles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Create/Edit Form */}
        <form onSubmit={handleVendorSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4" style={{ border: "1px solid #b0d8db" }}>
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "#040f0f" }}>
            <Briefcase size={20} style={{ color: "#57737a" }} />
            {editingVendorId ? 'Update Vendor' : 'Create Vendor'}
          </h2>

          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: "#040f0f" }}>Vendor Name *</label>
            <input name="name" required value={vendorForm.name} onChange={handleVendorChange} placeholder="Enter vendor name" className={inputClass} style={inputStyle} />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 flex items-center gap-1" style={{ color: "#040f0f" }}><Mail size={14} /> Email</label>
            <input name="email" type="email" value={vendorForm.email} onChange={handleVendorChange} placeholder="vendor@email.com" className={inputClass} style={inputStyle} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1 flex items-center gap-1" style={{ color: "#040f0f" }}><Phone size={14} /> Phone Number</label>
              <input name="phone_number" type="number" value={vendorForm.phone_number} onChange={handleVendorChange} placeholder="Phone Number" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1 flex items-center gap-1" style={{ color: "#040f0f" }}><Briefcase size={14} /> Experience (Years)</label>
              <input name="years_of_experience" type="number" value={vendorForm.years_of_experience} onChange={handleVendorChange} placeholder="Years of Experience" className={inputClass} style={inputStyle} />
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="flex-1 py-3 font-bold text-white rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-60 hover:-translate-y-0.5" style={{ backgroundColor: "#040f0f" }}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={16} /> {editingVendorId ? 'Update Vendor' : 'Create Vendor'}</>}
            </button>
            {editingVendorId && (
              <button type="button" onClick={resetVendorForm} className="px-4 py-3 font-bold rounded-xl transition-colors" style={{ backgroundColor: "#e0f7f9", color: "#57737a" }}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Vendors List */}
        <div className="bg-white rounded-2xl shadow-sm p-6" style={{ border: "1px solid #b0d8db" }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: "#040f0f" }}>Vendors List</h2>
          {loadingList ? (
            <div className="py-8 text-center font-medium" style={{ color: "#57737a" }}>Loading vendors...</div>
          ) : vendors.length === 0 ? (
            <div className="py-8 text-center font-medium" style={{ color: "#85bdbf" }}>No vendors found.</div>
          ) : (
            <div className="space-y-3 max-h-[800px] overflow-auto pr-1">
              {vendors.map((vendor) => {
                const rc = getRiskColor(vendor.risk_score);
                return (
                  <div key={vendor.id} className="rounded-xl p-4 hover:shadow-md transition-shadow" style={{ border: "1px solid #b0d8db" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold" style={{ color: "#040f0f" }}>{vendor.name}</h3>
                        <p className="text-xs font-mono" style={{ color: "#85bdbf" }}>ID: {vendor.id}</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}>
                        Risk: {vendor.risk_score ?? '-'}
                      </span>
                    </div>
                    <div className="mt-2 text-sm grid grid-cols-1 sm:grid-cols-2 gap-1" style={{ color: "#57737a" }}>
                      <p className="flex items-center gap-1"><Mail size={12} /> <strong style={{ color: "#040f0f" }}>Email:</strong> {vendor.email || '-'}</p>
                      <p className="flex items-center gap-1"><Phone size={12} /> <strong style={{ color: "#040f0f" }}>Phone:</strong> {vendor.phone_number ?? '-'}</p>
                      <p className="flex items-center gap-1"><Briefcase size={12} /> <strong style={{ color: "#040f0f" }}>Experience:</strong> {vendor.years_of_experience ?? '-'} years</p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => handleEditVendor(vendor)} className="px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors" style={{ backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" }}>
                        <Pencil size={13} /> Edit
                      </button>
                      <button onClick={() => handleDeleteVendor(vendor.id)} className="px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors bg-red-50 text-red-700 hover:bg-red-100 border border-red-200">
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

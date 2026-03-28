'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Save } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function UserDetailPage() {
  const params = useParams();
  
  // Mock User State
  const [user, setUser] = useState({
    id: params?.id,
    name: 'Rahul S.',
    email: 'rahul@example.com',
    role: 'Citizen',
    status: 'Active',
    joined: '2024-05-12',
    reportsCount: 12,
    trustScore: 88
  });

  const handleSave = () => {
    alert("User Profile Updated!");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-3xl mx-auto">
        
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">User Profile</h1>
          </div>
          <button onClick={handleSave} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800">
            <Save size={18} /> Save Changes
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Profile Card */}
          <div className="md:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto flex items-center justify-center text-slate-400 mb-4">
              <User size={48} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-sm text-slate-500 mb-4">{user.email}</p>
            <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">
              {user.status}
            </div>
          </div>

          {/* Settings Form */}
          <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">Account Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={user.name} 
                  onChange={(e) => setUser({...user, name: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1">Email Address</label>
                <div className="flex items-center gap-2 p-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-600">
                  <Mail size={16} /> {user.email}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-1">Role</label>
                  <select 
                    value={user.role} 
                    onChange={(e) => setUser({...user, role: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="Citizen">Citizen</option>
                    <option value="Admin">Admin</option>
                    <option value="Auditor">Auditor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-1">Account Status</label>
                  <select 
                    value={user.status} 
                    onChange={(e) => setUser({...user, status: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Flagged">Flagged</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">{user.reportsCount}</div>
                  <div className="text-xs text-slate-500 uppercase font-bold">Reports Submitted</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{user.trustScore}%</div>
                  <div className="text-xs text-slate-500 uppercase font-bold">Trust Score</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
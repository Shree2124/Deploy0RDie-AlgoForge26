'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { FileText, Download } from 'lucide-react';

const DocsPage = () => {
  const [rtiRequests, setRtiRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRtiRequests = async () => {
      const { data, error } = await supabase
        .from('rti_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching RTI requests:', error);
      } else {
        setRtiRequests(data);
      }
      setLoading(false);
    };

    fetchRtiRequests();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pt-5 pb-12 px-4 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Documents & RTI Requests</h1>
          <Link href="/rti">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2">
              <FileText size={16} /> File New RTI
            </button>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Document</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : rtiRequests.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No RTI requests found.</td></tr>
              ) : (
                rtiRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{req.subject}</td>
                    <td className="px-6 py-4">{req.department}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-600`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs whitespace-nowrap">
                      {new Date(req.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4">
                      {req.document_url ? (
                        <a href={req.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                          <Download size={14} /> Download
                        </a>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;

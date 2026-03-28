'use client';
import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface RtiRequest {
  id: number;
  created_at: string;
  title: string;
  description: string;
  location_address: string;
  location: any;
  is_anonymous: boolean;
  department: string;
  status: string;
  questions: any;
  user_id: string;
  project_id: string;
  extract_data: any;
}

export default function RtiAdminPage() {
  const [rtiRequests, setRtiRequests] = useState<RtiRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRtiRequests = async () => {
      try {
        const res = await fetch('/api/get-rti');
        if (!res.ok) {
          throw new Error('Failed to fetch RTI requests');
        }
        const data = await res.json();
        setRtiRequests(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRtiRequests();
  }, []);

  if (loading) {
    return <div className="p-8">Loading RTI requests...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">RTI Requests</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the RTI requests filed by users.
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Title</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Department</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Filed On</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {rtiRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{request.title}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{request.department}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(request.created_at).toLocaleDateString()}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <a href={`/admin/rti/${request.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4"><Eye size={16} className="inline"/> View</a>
                        <a href="#" className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit size={16} className="inline"/> Edit</a>
                        <a href="#" className="text-red-600 hover:text-red-900"><Trash2 size={16} className="inline"/> Delete</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

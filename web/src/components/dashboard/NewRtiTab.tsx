"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, Send, Paperclip, AlertCircle, CheckCircle2,
    Building2, Link as LinkIcon, Loader2, X, MapPin
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";

interface NewRtiTabProps {
    onBack: () => void;
}

export default function NewRtiTab({ onBack }: NewRtiTabProps) {
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [userIssues, setUserIssues] = useState<any[]>([]);
    const [loadingIssues, setLoadingIssues] = useState(true);

    const [aiLoading, setAiLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isAnonymous, setIsAnonymous] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [locationAddress, setLocationAddress] = useState("");
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [questions, setQuestions] = useState(['']);

    const [formData, setFormData] = useState({
        department: "Municipal Corporation",
        subject: "",
        query: "",
        linkedReportId: "",
        file: null as File | null,
    });

    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(({ coords }) => {
                const { latitude, longitude } = coords;
                setLocation({ lat: latitude, lon: longitude });
            });
        }

        if (!user) return;
        const fetchUserIssues = async () => {
            try {
                const response = await fetch('/api/user-issues', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserIssues(data || []);
                }
            } catch (err) {
                console.error("Failed to fetch user issues:", err);
            } finally {
                setLoadingIssues(false);
            }
        };
        fetchUserIssues();
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGetCurrentLocation = () => {
        if (!('geolocation' in navigator)) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        setFetchingLocation(true);
        setError("");
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lon: longitude });

                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    if (data && data.display_name) {
                        setLocationAddress(data.display_name);
                    } else {
                        setLocationAddress(`${latitude}, ${longitude}`);
                    }
                } catch (err) {
                    console.error("Failed to fetch address", err);
                    setLocationAddress(`${latitude}, ${longitude}`);
                }
                setFetchingLocation(false);
            },
            (error) => {
                console.error(error);
                setFetchingLocation(false);
                setError("Failed to get your location. Please type it manually.");
            }
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, file: e.target.files[0] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError("You must be logged in to file an RTI.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const payload = new FormData();
            payload.append("department", formData.department);
            payload.append("subject", formData.subject);
            payload.append("query", formData.query);
            payload.append("userId", user.id);

            if (formData.linkedReportId) {
                payload.append("linkedReportId", formData.linkedReportId);
            }
            if (formData.file) {
                payload.append("file", formData.file);
            }

            payload.append("is_anonymous", isAnonymous.toString());
            if (location) {
                payload.append("location", JSON.stringify(location));
            }
            if (locationAddress) {
                payload.append("location_address", locationAddress);
            }
            if (questions.length > 0) {
                payload.append("questions", JSON.stringify(questions.filter(q => q.trim() !== '')));
            }

            const res = await fetch("/api/rti", {
                method: "POST",
                body: payload,
            });

            if (!res.ok) throw new Error("Failed to submit RTI application");

            setSuccess(true);
            // Wait for success animation, then switch tab back to RTI list
            setTimeout(() => {
                onBack();
            }, 2500);

        } catch (err: any) {
            setError(err.message || "An error occurred.");
            setLoading(false);
        }
    };

    const handleAiDraft = async () => {
        if (!formData.department || !formData.subject) {
            setError("Please provide a Target Department and Subject to intelligently draft the query.");
            return;
        }

        setAiLoading(true);
        setError("");

        try {
            const response = await fetch('/api/rti/ai-suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    department: formData.department,
                    subject: formData.subject,
                    questions: questions.filter(q => q.trim() !== ''),
                }),
            });

            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                throw new Error("Server returned an invalid format. The AI service may be temporarily down.");
            }

            if (!response.ok) {
                throw new Error(data.error || "AI service failed. Please check your network or try again.");
            }

            setFormData(prev => ({ ...prev, query: data.suggestion }));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 bg-white border border-[#b0d8db] rounded-lg hover:bg-[#e0f7f9] transition-colors"
                    style={{ color: '#57737a' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: '#040f0f' }}>File Right to Information (RTI)</h1>
                    <p className="text-sm mt-1" style={{ color: '#57737a' }}>Request official information or documents directly from government departments.</p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {success ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl border border-[#b0d8db] shadow-sm p-12 flex flex-col items-center text-center"
                    >
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2" style={{ color: '#040f0f' }}>RTI Application Submitted!</h2>
                        <p className="text-[#57737a] max-w-md">
                            Your request has been securely forwarded to the respective department. Returning to dashboard...
                        </p>
                    </motion.div>
                ) : (
                    <motion.form
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-[#b0d8db] shadow-sm overflow-hidden"
                    >
                        {/* Form Banner */}
                        <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: '#e0f7f9', borderBottom: '1px solid #b0d8db' }}>
                            <div className="p-2 bg-white rounded-lg"><Building2 size={20} style={{ color: '#57737a' }} /></div>
                            <p className="text-sm font-bold" style={{ color: '#040f0f' }}>Section 6(1) of the RTI Act, 2005</p>
                        </div>

                        <div className="p-6 md:p-8 space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            {/* Linked Evidence Section */}
                            <div className="p-5 rounded-xl border-2 border-dashed" style={{ borderColor: '#b0d8db', backgroundColor: '#f4feff' }}>
                                <label className="block text-sm font-bold mb-2 flex items-center gap-2" style={{ color: '#040f0f' }}>
                                    <LinkIcon size={16} style={{ color: '#85bdbf' }} /> Attach Related Issue (Highly Recommended)
                                </label>
                                <p className="text-xs mb-4" style={{ color: '#57737a' }}>Linking an issue you previously reported adds context and increases accountability.</p>

                                {loadingIssues ? (
                                    <div className="text-sm text-slate-400">Loading your reported issues...</div>
                                ) : userIssues.length === 0 ? (
                                    <div className="text-sm italic" style={{ color: '#85bdbf' }}>No issues available to link yet.</div>
                                ) : (
                                    <select
                                        name="linkedReportId"
                                        value={formData.linkedReportId}
                                        onChange={handleChange}
                                        className="w-full p-3 rounded-xl focus:outline-none bg-white transition-all"
                                        style={{ border: '1px solid #b0d8db', color: formData.linkedReportId ? '#040f0f' : '#57737a' }}
                                    >
                                        <option value="">-- Do not link any issue --</option>
                                        {userIssues.map(issue => (
                                            <option key={issue.id} value={issue.id}>
                                                {issue.category} - {issue.notes ? (issue.notes.substring(0, 40) + (issue.notes.length > 40 ? '...' : '')) : 'No notes'}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2" style={{ color: '#040f0f' }}>Your Questions</label>
                                {questions.map((question, index) => (
                                    <div key={index} className="flex items-center gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={question}
                                            onChange={(e) => {
                                                const newQuestions = [...questions];
                                                newQuestions[index] = e.target.value;
                                                setQuestions(newQuestions);
                                            }}
                                            placeholder={`Question ${index + 1}`}
                                            className="w-full p-3 rounded-xl focus:outline-none transition-all"
                                            style={{ border: '1px solid #b0d8db', backgroundColor: '#f4feff', color: '#040f0f' }}
                                        />
                                        <button type="button" onClick={() => setQuestions(questions.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-600">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => setQuestions([...questions, ''])} className="text-sm font-medium text-[#57737a] hover:text-[#040f0f]">
                                    + Add another question
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Location Section */}
                                <div className="md:col-span-2 p-5 rounded-xl bg-white space-y-4" style={{ border: '1px solid #b0d8db' }}>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                                        <label className="block text-sm font-bold" style={{ color: '#040f0f' }}>Location Address <span className="text-red-500">*</span></label>
                                        <button
                                            type="button"
                                            onClick={handleGetCurrentLocation}
                                            disabled={fetchingLocation}
                                            className="text-xs font-bold px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors hover:bg-[#b0d8db]"
                                            style={{ backgroundColor: '#e0f7f9', color: '#57737a', border: '1px solid #b0d8db' }}
                                        >
                                            {fetchingLocation ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />}
                                            {fetchingLocation ? 'Fetching...' : 'Use Current Location'}
                                        </button>
                                    </div>
                                    <input
                                        required
                                        type="text"
                                        value={locationAddress}
                                        onChange={(e) => setLocationAddress(e.target.value)}
                                        placeholder="Enter the related location (e.g. Dadar Station West)"
                                        className="w-full p-3 rounded-xl focus:outline-none transition-all"
                                        style={{ border: '1px solid #b0d8db', backgroundColor: '#f4feff', color: '#040f0f' }}
                                    />
                                    {location && (
                                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                            <CheckCircle2 size={12} /> Coordinates captured: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2" style={{ color: '#040f0f' }}>Target Department</label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="w-full p-3 rounded-xl focus:outline-none transition-all"
                                        style={{ border: '1px solid #b0d8db', backgroundColor: '#f4feff', color: '#040f0f' }}
                                    >
                                        <option>Municipal Corporation (MCGM)</option>
                                        <option>Public Works Department (PWD)</option>
                                        <option>Water Supply Board</option>
                                        <option>Electricity & Power Board</option>
                                        <option>Urban Development Authority</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2" style={{ color: '#040f0f' }}>Subject</label>
                                    <input
                                        required type="text" name="subject"
                                        value={formData.subject} onChange={handleChange}
                                        placeholder="e.g. Budget breakdown for Dadar Skywalk"
                                        className="w-full p-3 rounded-xl focus:outline-none transition-all"
                                        style={{ border: '1px solid #b0d8db', backgroundColor: '#f4feff', color: '#040f0f' }}
                                    />
                                </div>
                            </div>

                            <div className="relative">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-2 gap-2">
                                    <label className="block text-sm font-bold" style={{ color: '#040f0f' }}>Detailed Query / Information Required</label>
                                    <button
                                        type="button"
                                        onClick={handleAiDraft}
                                        disabled={aiLoading || !formData.subject}
                                        className="text-xs transition-all shadow-sm font-bold px-3 py-1.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                                        style={{ backgroundColor: '#040f0f', color: '#c2fcf7' }}
                                    >
                                        {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <span> Auto-Draft with AI</span>}
                                    </button>
                                </div>
                                <textarea
                                    required name="query" rows={6}
                                    value={formData.query} onChange={handleChange}
                                    placeholder="I, a citizen of India, kindly request the following information under the RTI Act, 2005..."
                                    className="w-full p-3 rounded-xl focus:outline-none transition-all resize-none"
                                    style={{ border: '1px solid #b0d8db', backgroundColor: '#f4feff', color: '#040f0f' }}
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: "#fefce8", border: "1px solid #fef08a" }}>
                                <input
                                    type="checkbox"
                                    id="anonymous-rti"
                                    checked={isAnonymous}
                                    onChange={(e) => setIsAnonymous(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-[#57737a] focus:ring-[#85bdbf] cursor-pointer"
                                />
                                <div>
                                    <label htmlFor="anonymous-rti" className="font-bold cursor-pointer" style={{ color: "#854d0e" }}>
                                        File Anonymously
                                    </label>
                                    <p className="text-xs mt-0.5" style={{ color: "#a16207" }}>
                                        Your identity will be protected and not revealed to the department.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2" style={{ color: '#040f0f' }}>Additional Documents (Optional)</label>
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 bg-white rounded-lg flex items-center gap-2 font-medium transition-colors hover:bg-slate-50"
                                        style={{ border: '1px solid #b0d8db', color: '#57737a' }}
                                    >
                                        <Paperclip size={16} /> Choose File
                                    </button>
                                    <span className="text-sm font-mono truncate max-w-[200px]" style={{ color: '#85bdbf' }}>
                                        {formData.file ? formData.file.name : "No file chosen"}
                                    </span>
                                    {formData.file && (
                                        <button type="button" onClick={() => setFormData({ ...formData, file: null })} className="text-red-400 hover:text-red-600">
                                            <X size={16} />
                                        </button>
                                    )}
                                    <input
                                        type="file" ref={fileInputRef} onChange={handleFileChange}
                                        className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end" style={{ borderTop: '1px solid #e0f7f9' }}>
                                <button
                                    type="submit" disabled={loading || !formData.subject || !formData.query}
                                    className="px-6 py-3 font-bold rounded-xl text-white transition-all flex items-center gap-2 disabled:opacity-50"
                                    style={{ backgroundColor: '#57737a', boxShadow: '0 4px 14px rgba(87, 115, 122, 0.2)' }}
                                >
                                    {loading ? (
                                        <><Loader2 size={18} className="animate-spin" /> Processing...</>
                                    ) : (
                                        <><Send size={18} /> Submit Application</>
                                    )}
                                </button>
                            </div>

                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Shield, AlertCircle, ArrowLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function TestLoginPage() {
    const router = useRouter();
    const [loadingType, setLoadingType] = useState<'admin' | 'citizen' | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleTestLogin = async (userType: 'admin' | 'citizen') => {
        console.log(`Starting test login for: ${userType}`);
        setLoadingType(userType);
        setError(null);

        try {
            const response = await fetch('/api/auth/test-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userType }),
            });

            console.log(`Response status: ${response.status}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Test login failed');
            }

            const data = await response.json();
            console.log('Login successful, setting session data...');

            // Store session in localStorage - IMPORTANT: Do this before redirecting
            localStorage.setItem('test_session_user', JSON.stringify(data.user));

            if (data.user.isAdmin) {
                localStorage.setItem('admin_session', JSON.stringify(data.user));
            }

            const target = data.user.isAdmin ? '/admin/dashboard' : '/dashboard';
            console.log(`Redirecting to: ${target}`);

            // Small delay to ensure localStorage is written before page transition starts
            setTimeout(() => {
                window.location.assign(target);
            }, 500);

        } catch (err: any) {
            console.error('Test login error details:', err);
            setError(err.message || 'Test login failed. Check console for details.');
            setLoadingType(null);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4 font-sans" style={{ backgroundColor: '#f4feff' }}>
            {/* Ambient Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full opacity-20 blur-[120px]" style={{ backgroundColor: '#85bdbf' }} />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full opacity-20 blur-[120px]" style={{ backgroundColor: '#b0d8db' }} />

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-4xl text-center"
            >
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm font-semibold mb-8 transition-colors hover:opacity-70"
                    style={{ color: '#57737a' }}
                >
                    <ArrowLeft size={16} /> Back to Login
                </Link>

                <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight" style={{ color: '#040f0f' }}>
                    Quick Test Login
                </h1>
                <p className="text-lg mb-12" style={{ color: '#57737a' }}>
                    Select your access type to proceed safely.
                </p>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 p-4 rounded-xl border flex items-center gap-3 justify-center"
                        style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#991b1b' }}
                    >
                        <AlertCircle size={18} />
                        <span className="text-sm font-medium">{error}</span>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Admin Access Card */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="p-10 rounded-3xl border transition-all flex flex-col items-center text-center group"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            backdropFilter: 'blur(20px)',
                            borderColor: 'rgba(176, 216, 219, 0.5)',
                            boxShadow: '0 20px 40px rgba(4, 15, 15, 0.05)'
                        }}
                    >
                        <div className="w-20 h-20 rounded-2xl mb-8 flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: '#e0f7f9' }}>
                            <Shield className="w-10 h-10" style={{ color: '#57737a' }} />
                        </div>
                        <h2 className="text-2xl font-bold mb-4" style={{ color: '#040f0f' }}>Admin Access</h2>
                        <p className="text-sm leading-relaxed mb-8 flex-1" style={{ color: '#57737a' }}>
                            Full platform control, data management, and security oversight.
                        </p>
                        <button
                            onClick={() => handleTestLogin('admin')}
                            disabled={loadingType !== null}
                            className="w-full py-4 px-6 rounded-2xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: '#57737a',
                                boxShadow: '0 10px 20px rgba(87, 115, 122, 0.2)'
                            }}
                        >
                            {loadingType === 'admin' ? 'Authenticating...' : <>LOGIN AS ADMIN <ChevronRight size={18} /></>}
                        </button>
                    </motion.div>

                    {/* Citizen Access Card */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="p-10 rounded-3xl border transition-all flex flex-col items-center text-center group"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            backdropFilter: 'blur(20px)',
                            borderColor: 'rgba(176, 216, 219, 0.5)',
                            boxShadow: '0 20px 40px rgba(4, 15, 15, 0.05)'
                        }}
                    >
                        <div className="w-20 h-20 rounded-2xl mb-8 flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: '#e0f7f9' }}>
                            <User className="w-10 h-10" style={{ color: '#57737a' }} />
                        </div>
                        <h2 className="text-2xl font-bold mb-4" style={{ color: '#040f0f' }}>Citizen Access</h2>
                        <p className="text-sm leading-relaxed mb-8 flex-1" style={{ color: '#57737a' }}>
                            Access public services, profiles, documents, and notifications.
                        </p>
                        <button
                            onClick={() => handleTestLogin('citizen')}
                            disabled={loadingType !== null}
                            className="w-full py-4 px-6 rounded-2xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: '#57737a',
                                boxShadow: '0 10px 20px rgba(87, 115, 122, 0.2)'
                            }}
                        >
                            {loadingType === 'citizen' ? 'Authenticating...' : <>LOGIN AS CITIZEN <ChevronRight size={18} /></>}
                        </button>
                    </motion.div>
                </div>

                {/* Footer Info */}
                <div className="flex flex-col items-center gap-6 pb-12">
                    <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#85bdbf' }}>
                        <CheckCircle2 size={14} />
                        <span>Development Environment · Secure Session Storage</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#b0d8db' }}>
                        © 2024 SecureGov Platforms | Privacy | Terms
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

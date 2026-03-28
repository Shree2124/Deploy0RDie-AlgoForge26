"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, RefreshCw, LogOut, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { getCurrentUser } from "@/lib/supabase/auth";

const VerifyEmailView = () => {
  const router = useRouter();
  const {
    user,
    emailVerified,
    resendVerification,
    signOut,
    loading,
  } = useAuthContext();
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!loading && emailVerified) {
      router.push("/dashboard");
    }
  }, [emailVerified, loading, router]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || emailVerified) return null;
  if (!user) return null;

  const handleResendEmail = async () => {
    setSendingEmail(true);
    try {
      await resendVerification();
      setEmailSent(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-200">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Verify your email</h2>
        <p className="mt-2 text-slate-500">We've sent a link to <span className="font-bold">{user.email}</span>. Click it to activate your account.</p>

        <div className="mt-8 space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
          >
            I've Verified My Email
          </button>

          <button
            onClick={handleResendEmail}
            disabled={sendingEmail}
            className="w-full py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            {sendingEmail ? <RefreshCw className="animate-spin" size={16} /> : <RefreshCw size={16} />}
            {emailSent ? "Sent!" : "Resend Link"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailView;

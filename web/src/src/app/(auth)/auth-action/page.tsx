"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Building2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const AuthActionPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleAuthAction = async () => {
      // Supabase handles verification via its own redirect if configured
      // But if we landed here, we might want to verify the session
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setStatus("success");
        setMessage("Your account is active! Redirecting to dashboard...");
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        setStatus("error");
        setMessage("Session could not be verified. Please log in again.");
      }
    };

    handleAuthAction();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative flex-col justify-between p-12 text-white overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-serif font-bold mb-6 leading-tight">Civic.ai</h1>
          <p className="text-slate-400 text-lg leading-relaxed">Processing your request...</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-12 relative bg-white">
        <div className="text-center">
          {status === "loading" && <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />}
          {status === "success" && <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />}
          {status === "error" && <XCircle className="h-12 w-12 text-red-600 mx-auto" />}
          <h2 className="text-2xl font-bold mt-4">{status === "loading" ? "Processing..." : status === "success" ? "Success!" : "Action Failed"}</h2>
          <p className="mt-2 text-slate-500">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthActionPage;

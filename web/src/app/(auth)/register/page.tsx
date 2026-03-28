"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  UserPlus,
  ShieldAlert,
  FileText,
  Brain,
  LayoutDashboard,
  TrendingUp,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ErrorAlert } from "@/components/auth/ErrorAlert";
import Link from "next/link";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

const timelineData = [
  {
    id: 1,
    title: "Register",
    date: "Step 1",
    content: "Create your Citizen ID with email verification and secure credentials.",
    category: "Onboarding",
    icon: UserPlus,
    relatedIds: [2],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "Verify ID",
    date: "Step 2",
    content: "Complete identity verification via email OTP and citizen pledge.",
    category: "Security",
    icon: ShieldAlert,
    relatedIds: [1, 3],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 3,
    title: "File Report",
    date: "Step 3",
    content: "Submit infrastructure issues with geo-tagged photos and descriptions.",
    category: "Reporting",
    icon: FileText,
    relatedIds: [2, 4],
    status: "in-progress" as const,
    energy: 70,
  },
  {
    id: 4,
    title: "AI Audit",
    date: "Step 4",
    content: "AI agents verify reports against tender specs and satellite data.",
    category: "Analysis",
    icon: Brain,
    relatedIds: [3, 5],
    status: "pending" as const,
    energy: 45,
  },
  {
    id: 5,
    title: "Dashboard",
    date: "Step 5",
    content: "Track all audits, fund utilization, and project progress in real-time.",
    category: "Monitoring",
    icon: LayoutDashboard,
    relatedIds: [4, 6],
    status: "pending" as const,
    energy: 25,
  },
  {
    id: 6,
    title: "Impact",
    date: "Step 6",
    content: "See how your reports drive accountability and infrastructure improvement.",
    category: "Outcome",
    icon: TrendingUp,
    relatedIds: [5],
    status: "pending" as const,
    energy: 10,
  },
];


const RegisterView = () => {
  const router = useRouter();
  const { signUp, signInWithGoogle, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (localError) setLocalError(null);
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }
    if (!formData.agreed) {
      setLocalError("You must agree to the Citizen Pledge.");
      return;
    }

    setIsLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.fullName);
      router.push("/verify-email");
    } catch (err) {
      // Error handled by context
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    clearError();
    setLocalError(null);

    try {
      await signInWithGoogle(`${window.location.origin}/dashboard`);
    } catch (err) {
      // Error handled by context
      setIsLoading(false);
    } 
  };

  // Visual Password Strength Logic
  const strength = Math.min(
    (formData.password.length > 5 ? 1 : 0) +
    (formData.password.length > 8 ? 1 : 0) +
    (/[A-Z]/.test(formData.password) ? 1 : 0) +
    (/[0-9]/.test(formData.password) ? 1 : 0),
    4
  );

  const strengthColors = ["#ef4444", "#f59e0b", "#85bdbf", "#057a55"];

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex overflow-hidden font-sans" style={{ backgroundColor: '#f4feff' }}>
      {/* LEFT SIDE: Orbital Timeline + Brand */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 text-white overflow-hidden"
        style={{ backgroundColor: '#040f0f' }}
      >
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(133,189,191,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(133,189,191,0.15) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Top: Logo + Back */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-48 h-14">
              <img src="/mainlogo.svg" alt="Civic.ai" className="w-full h-full object-contain" />
            </div>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg"
            style={{ color: '#85bdbf', border: '1px solid rgba(133, 189, 191, 0.2)' }}
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>

        {/* Center: Orbital Timeline */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <RadialOrbitalTimeline timelineData={timelineData} />
        </div>

        {/* Bottom: Tagline & Steps */}
        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-bold mb-4 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Become a <br />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(to right, #c2fcf7, #85bdbf)',
                WebkitBackgroundClip: 'text',
              }}
            >
              Guardian of Truth.
            </span>
          </h1>
          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-3 text-sm" style={{ color: '#b0d8db' }}>
              <CheckCircle2 size={18} style={{ color: '#c2fcf7' }} />
              <span>Secure Email Verification</span>
            </div>
            <div className="flex items-center gap-3 text-sm" style={{ color: '#b0d8db' }}>
              <CheckCircle2 size={18} style={{ color: '#c2fcf7' }} />
              <span>Role-Based Access Control</span>
            </div>
            <div className="flex items-center gap-3 text-sm" style={{ color: '#b0d8db' }}>
              <CheckCircle2 size={18} style={{ color: '#c2fcf7' }} />
              <span>Zero-Knowledge Proof Identity</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-12 relative overflow-y-auto" style={{ backgroundColor: '#ffffff' }}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-6"
        >
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-sm mb-4" style={{ color: '#57737a' }}>
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <div className="flex items-center justify-center gap-3">
              <img src="/mainlogo.svg" alt="Civic.ai" className="w-40 h-14 object-contain" />
            </div>
            <p className="text-sm mt-2" style={{ color: '#57737a' }}>Citizen Registration</p>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: '#040f0f' }}>
              Create Account
            </h2>
            <p className="mt-2" style={{ color: '#57737a' }}>
              Enter your details to generate your Citizen ID.
            </p>
          </div>

          {displayError && (
            <ErrorAlert
              error={displayError}
              onDismiss={() => {
                setLocalError(null);
                clearError();
              }}
            />
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-sm font-medium ml-1" style={{ color: '#040f0f' }}>
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: '#85bdbf' }}>
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-3 py-3 rounded-xl placeholder-opacity-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#f4feff',
                    border: '1px solid #b0d8db',
                    color: '#040f0f',
                  }}
                  placeholder="Ravi Kumar"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-sm font-medium ml-1" style={{ color: '#040f0f' }}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: '#85bdbf' }}>
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-3 py-3 rounded-xl placeholder-opacity-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#f4feff',
                    border: '1px solid #b0d8db',
                    color: '#040f0f',
                  }}
                  placeholder="citizen@civic.ai"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-sm font-medium ml-1" style={{ color: '#040f0f' }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: '#85bdbf' }}>
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-3 py-3 rounded-xl placeholder-opacity-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#f4feff',
                    border: '1px solid #b0d8db',
                    color: '#040f0f',
                  }}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors hover:text-[#57737a]"
                  style={{ color: '#85bdbf' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Strength Meter */}
              {formData.password && (
                <div className="flex gap-1 mt-2 h-1 px-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-full flex-1 rounded-full transition-colors duration-300"
                      style={{
                        backgroundColor: i <= strength ? strengthColors[strength - 1] : '#e0f7f9',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block text-sm font-medium ml-1" style={{ color: '#040f0f' }}>
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: '#85bdbf' }}>
                  <Lock size={18} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-3 py-3 rounded-xl placeholder-opacity-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#f4feff',
                    border: formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? '1px solid #ef4444'
                      : '1px solid #b0d8db',
                    color: '#040f0f',
                  }}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors hover:text-[#57737a]"
                  style={{ color: '#85bdbf' }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreed"
                  name="agreed"
                  type="checkbox"
                  checked={formData.agreed}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="h-4 w-4 rounded cursor-pointer disabled:opacity-50"
                  style={{ accentColor: '#57737a' }}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreed" className="font-medium" style={{ color: '#040f0f' }}>
                  Citizen Pledge
                </label>
                <p style={{ color: '#57737a' }}>
                  I agree to the{" "}
                  <a
                    href="#"
                    className="underline"
                    style={{ color: '#57737a' }}
                  >
                    Terms of Service
                  </a>{" "}
                  and confirm that all reports filed will be accurate to the
                  best of my knowledge.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
              style={{
                backgroundColor: '#57737a',
                boxShadow: '0 4px 14px rgba(87, 115, 122, 0.3)',
              }}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating ID...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid #b0d8db' }} />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 font-medium" style={{ backgroundColor: '#ffffff', color: '#85bdbf' }}>
                Or sign up with
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ border: '1px solid #b0d8db', backgroundColor: '#ffffff' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-sm font-semibold" style={{ color: '#040f0f' }}>
              Sign up with Google
            </span>
          </button>

          {/* Login Link */}
          <div className="text-center pt-2">
            <p className="text-sm" style={{ color: '#57737a' }}>
              Already have a Citizen ID?{" "}
              <Link
                href="/login"
                className="font-bold transition-colors"
                style={{ color: '#040f0f' }}
              >
                Sign in here
              </Link>
            </p>
          </div>

          {/* Footer Security Note */}
          <div className="pt-4 flex items-center justify-center gap-2 text-xs" style={{ color: '#85bdbf' }}>
            <ShieldCheck size={14} style={{ color: '#85bdbf' }} />
            <span>Data stored on Government Private Blockchain</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterView;

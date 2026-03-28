"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  MapPin,
  Camera,
  FileSearch,
  Shield,
  BarChart3,
  Globe,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ErrorAlert } from "@/components/auth/ErrorAlert";
import Link from "next/link";
import { Radar, IconContainer, RadarCycleProvider } from "@/components/ui/radar-effect";

const LoginView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") || "/dashboard";

  const { signIn, signInWithGoogle, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      await signIn(email, password);

      // Use router.push for soft navigation so that the application seamlessly
      // transitions states without unmounting and showing blank screens.
      const adminSession = localStorage.getItem("admin_session");
      if (adminSession) {
        router.push("/admin/dashboard");
      } else {
        router.push(redirectTo);
      }
    } catch (err) {
      // Error handled by context
      setIsLoading(false); // Only stop loading if there's an error, otherwise let the page redirect
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    clearError();

    try {
      // Pass the redirect URL so Supabase knows where to send them back
      await signInWithGoogle(`${window.location.origin}${redirectTo}`);
      // No routing needed here because Supabase redirects the browser page natively
    } catch (err) {
      // Error handled by context
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden font-sans" style={{ backgroundColor: '#f4feff' }}>
      {/* LEFT SIDE: Radar Visual + Brand */}
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

        {/* Center: Radar Effect */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <RadarCycleProvider>
            <div className="relative flex h-96 w-full max-w-3xl flex-col items-center justify-center space-y-4 overflow-hidden px-4">
              {/* Row 1 */}
              <div className="mx-auto w-full max-w-3xl">
                <div className="flex w-full items-center justify-center space-x-10 md:justify-between md:space-x-0">
                  <IconContainer
                    text="Geo Verification"
                    revealAt={0.8}
                    color="#4ecdc4"
                    icon={<MapPin className="h-8 w-8" style={{ color: '#4ecdc4' }} />}
                  />
                  <IconContainer
                    text="Fund Tracking"
                    revealAt={2.3}
                    color="#ffe66d"
                    icon={<BarChart3 className="h-8 w-8" style={{ color: '#ffe66d' }} />}
                  />
                  <IconContainer
                    text="Photo Audit"
                    revealAt={1.5}
                    color="#ff6b6b"
                    icon={<Camera className="h-8 w-8" style={{ color: '#ff6b6b' }} />}
                  />
                </div>
              </div>
              {/* Row 2 */}
              <div className="mx-auto w-full max-w-md">
                <div className="flex w-full items-center justify-center space-x-10 md:justify-between md:space-x-0">
                  <IconContainer
                    text="Report Issues"
                    revealAt={3.2}
                    color="#ffa07a"
                    icon={<AlertTriangle className="h-8 w-8" style={{ color: '#ffa07a' }} />}
                  />
                  <IconContainer
                    text="AI Analysis"
                    revealAt={5.5}
                    color="#a78bfa"
                    icon={<FileSearch className="h-8 w-8" style={{ color: '#a78bfa' }} />}
                  />
                </div>
              </div>
              {/* Row 3 */}
              <div className="mx-auto w-full max-w-3xl">
                <div className="flex w-full items-center justify-center space-x-10 md:justify-between md:space-x-0">
                  <IconContainer
                    text="Secure Identity"
                    revealAt={4.3}
                    color="#34d399"
                    icon={<Shield className="h-8 w-8" style={{ color: '#34d399' }} />}
                  />
                  <IconContainer
                    text="Global Network"
                    revealAt={6.5}
                    color="#60a5fa"
                    icon={<Globe className="h-8 w-8" style={{ color: '#60a5fa' }} />}
                  />
                </div>
              </div>

              <Radar className="absolute -bottom-12" />
              <div className="absolute bottom-0 z-[41] h-px w-full" style={{ background: 'linear-gradient(to right, transparent, #57737a, transparent)' }} />
            </div>
          </RadarCycleProvider>
        </div>

        {/* Bottom: Tagline */}
        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-bold mb-4 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Verify the <br />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(to right, #c2fcf7, #85bdbf)',
                WebkitBackgroundClip: 'text',
              }}
            >
              Public Promise.
            </span>
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#85bdbf' }}>
            Join 1.2 Million citizens securing national infrastructure through
            transparency and AI-powered audits.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-12 relative" style={{ backgroundColor: '#ffffff' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-sm mb-4" style={{ color: '#57737a' }}>
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <div className="flex items-center justify-center gap-3">
              <img src="/mainlogo.svg" alt="Civic.ai" className="w-40 h-14 object-contain" />
            </div>
            <p className="text-sm mt-2" style={{ color: '#57737a' }}>Citizen Audit Portal</p>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: '#040f0f' }}>
              Welcome Back
            </h2>
            <p className="mt-2" style={{ color: '#57737a' }}>
              Please enter your credentials to access the dashboard.
            </p>
          </div>

          {error && <ErrorAlert error={error} onDismiss={clearError} />}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <div className="space-y-1">
                <label className="block text-sm font-medium ml-1" style={{ color: '#040f0f' }}>
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: '#85bdbf' }}>
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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

              <div className="space-y-1 mt-4">
                <label className="block text-sm font-medium ml-1" style={{ color: '#040f0f' }}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: '#85bdbf' }}>
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="block w-full pl-10 pr-3 py-3 rounded-xl placeholder-opacity-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: '#f4feff',
                      border: '1px solid #b0d8db',
                      color: '#040f0f',
                    }}
                    placeholder="••••••••"
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
                <div className="flex justify-end">
                  <Link
                    href="/reset-password"
                    className="text-xs font-medium transition-colors"
                    style={{ color: '#57737a' }}
                  >
                    Forgot password?
                  </Link>
                </div>
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
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Secure Login <ArrowRight size={16} />
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
                Or continue with
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
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
              Sign in with Google
            </span>
          </button>

          <div className="text-center">
            <p className="text-sm" style={{ color: '#57737a' }}>
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold transition-colors"
                style={{ color: '#040f0f' }}
              >
                Sign up now
              </Link>
            </p>
          </div>

          <div className="pt-4" style={{ borderTop: '1px solid #e0f7f9' }}>
            <p className="text-[10px] uppercase tracking-widest font-bold text-center mb-3" style={{ color: '#b0d8db' }}>
              🧪 Development Bypass
            </p>
            <Link
              href="/test-login"
              className="block w-full text-center py-3 px-4 text-sm font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                color: '#57737a',
                backgroundColor: '#ffffff',
                border: '1px solid #b0d8db',
                boxShadow: '0 4px 12px rgba(176, 216, 219, 0.2)'
              }}
            >
              Quick Test Login →
            </Link>
          </div>

          <div className="pt-6 flex items-center justify-center gap-2 text-xs" style={{ color: '#85bdbf' }}>
            <ShieldCheck size={14} style={{ color: '#85bdbf' }} />
            <span>256-bit End-to-End Encrypted Session</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginView;
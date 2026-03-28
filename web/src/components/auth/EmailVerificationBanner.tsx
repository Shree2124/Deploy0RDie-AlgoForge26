'use client';

import { useState } from 'react';
import { AlertCircle, Mail, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const EmailVerificationBanner = () => {
  const { emailVerified, resendVerification, user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (emailVerified || dismissed || !user) return null;

  const handleResend = async () => {
    setSending(true);
    setMessage(null);
    try {
      await resendVerification();
      setMessage('Verification email sent! Please check your inbox.');
    } catch (error) {
      setMessage('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-orange-500/10 border-b border-orange-500/20 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center flex-1">
          <Mail className="h-5 w-5 text-orange-500 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-orange-500 font-medium">
              Your email is not verified. Please check your inbox and verify your email to access all features.
            </p>
            {message && (
              <p className="text-xs text-orange-400 mt-1">{message}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3 ml-4">
          <button
            onClick={handleResend}
            disabled={sending}
            className="text-sm text-orange-500 hover:text-orange-400 font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {sending ? 'Sending...' : 'Resend Email'}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-orange-500 hover:text-orange-400 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

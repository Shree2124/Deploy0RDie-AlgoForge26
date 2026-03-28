import { AlertCircle, X } from 'lucide-react';
import { useEffect } from 'react';

interface ErrorAlertProps {
  error: string | null;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  duration?: number;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  onDismiss,
  autoDismiss = false,
  duration = 5000,
}) => {
  useEffect(() => {
    if (error && autoDismiss && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [error, autoDismiss, onDismiss, duration]);

  if (!error) return null;

  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-500">{error}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-3 text-red-500 hover:text-red-400 transition-colors"
            aria-label="Dismiss error"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

import { useAuthContext } from '@/contexts/AuthContext';
import { useCallback, useState } from 'react';

/**
 * Hook for test login functionality
 * Allows quick testing with predefined test user accounts
 */
export const useTestLogin = () => {
    const { signIn } = useAuthContext();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const testLogin = useCallback(
        async (userType: 'admin' | 'citizen') => {
            setIsLoading(true);
            setError(null);

            try {
                // Call test login endpoint
                const response = await fetch('/api/auth/test-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userType }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Test login failed');
                }

                const data = await response.json();

                // Store session in localStorage for context to pick up
                localStorage.setItem('test_session_user', JSON.stringify(data.user));

                // If admin, also store admin session
                if (data.user.isAdmin) {
                    localStorage.setItem('admin_session', JSON.stringify(data.user));
                }

                // Reload the window to trigger session restoration
                window.location.href = '/dashboard';
            } catch (err: any) {
                setError(err.message || 'Test login failed');
                console.error('Test login error:', err);
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    return {
        testLogin,
        isLoading,
        error,
        clearError: () => setError(null),
    };
};

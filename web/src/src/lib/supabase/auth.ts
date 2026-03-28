import { supabase } from './client';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Define our mock User return type to keep it compatible with existing context
export type AuthUser = SupabaseUser | any;

// Error mapping for consistent UI feedback
export const getAuthErrorMessage = (error: any): string => {
    if (!error) return 'An unknown error occurred.';
    const msg = error?.message || error?.error_description || '';

    // Supabase specific error codes or messages
    if (msg.includes('Email not confirmed')) return 'Please verify your email address before logging in.';
    if (msg.includes('Invalid login credentials')) return 'Invalid email or password.';
    if (msg.includes('User already registered')) return 'This email is already registered. Please login instead.';
    if (msg.includes('Password should be at least')) return 'Password should be at least 8 characters long.';
    if (msg.includes('rate limit')) return 'Too many requests. Please try again later.';

    return msg || 'An error occurred during authentication. Please try again.';
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (
    email: string,
    password: string,
    displayName: string
): Promise<AuthUser> => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: displayName,
            },
        },
    });

    if (error) throw new Error(getAuthErrorMessage(error));
    return data.user;
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (
    email: string,
    password: string
): Promise<AuthUser> => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw new Error(getAuthErrorMessage(error));
    return data.user;
};

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async (redirectTo?: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: redirectTo || `${window.location.origin}/dashboard`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    });

    if (error) throw new Error(getAuthErrorMessage(error));
};

/**
 * Sign out the current user
 */
export const signOutUser = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error('Failed to sign out. Please try again.');
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(getAuthErrorMessage(error));
};

/**
 * Send email verification to current user (Resend)
 */
export const sendEmailVerification = async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
            emailRedirectTo: `${window.location.origin}/auth-action`,
        }
    });
    if (error) throw new Error('Failed to send verification email. Please try again.');
};

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChanged = (callback: (user: AuthUser | null, session: any) => void) => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
        callback(session?.user || null, session);
    });

    return () => {
        if (data?.subscription) {
            data.subscription.unsubscribe();
        }
    };
};

/**
 * Get current session user asynchronously
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
};
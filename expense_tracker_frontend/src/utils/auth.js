import { supabase } from './supabaseClient';
import { getURL } from './getURL';

// Error handling for auth redirects and general auth errors
export const handleAuthError = (error, navigate) => {
  // eslint-disable-next-line no-console
  console.error('Authentication error:', error);
  if (!navigate) return;

  const msg = (error?.message || '').toLowerCase();
  if (msg.includes('redirect')) {
    navigate('/auth/error?type=redirect');
  } else if (msg.includes('email')) {
    navigate('/auth/error?type=email');
  } else {
    navigate('/auth/error');
  }
};

export const signUp = async (email, password) => {
  if (!supabase) throw new Error('Supabase not initialized');
  return supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${getURL()}auth/callback` },
  });
};

export const resetPassword = async (email) => {
  if (!supabase) throw new Error('Supabase not initialized');
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getURL()}auth/reset-password`,
  });
};

export const signInWithMagicLink = async (email) => {
  if (!supabase) throw new Error('Supabase not initialized');
  return supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${getURL()}auth/callback` },
  });
};

export const signInWithOAuth = async (provider) => {
  if (!supabase) throw new Error('Supabase not initialized');
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${getURL()}auth/callback` },
  });
};

export const signOut = async () => {
  if (!supabase) throw new Error('Supabase not initialized');
  return supabase.auth.signOut();
};

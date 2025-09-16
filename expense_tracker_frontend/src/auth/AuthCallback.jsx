import React, { useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function AuthCallback() {
  useEffect(() => {
    const handle = async () => {
      try {
        if (!supabase) throw new Error('Supabase not initialized');
        // getSessionFromUrl has been removed in v2; use exchangeCodeForSession
        // for PKCE/OAuth magic link flows when using custom router.
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          // eslint-disable-next-line no-console
          console.error('Auth callback error:', error);
        }
        // We don't navigate here since the app may not have a router.
        // In your app, navigate to dashboard or home after success.
        // Example (if using react-router): navigate('/dashboard');
        return data;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Auth callback exception:', e);
        return null;
      }
    };
    handle();
  }, []);

  return <div style={{ padding: 16 }}>Processing authentication...</div>;
}

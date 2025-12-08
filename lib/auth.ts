// Supabase client for authentication
import { supabase } from './supabase';

// Client-side token management using Supabase sessions
export const tokenManager = {
  async getSession(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  },

  async setSession(access_token: string, refresh_token: string): Promise<void> {
    if (typeof window === 'undefined') return;
    await supabase.auth.setSession({ access_token, refresh_token });
  },

  async removeSession(): Promise<void> {
    if (typeof window === 'undefined') return;
    await supabase.auth.signOut();
    localStorage.removeItem('tokita_admin_session'); // Remove custom session flag
  },

  async isValid(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const { data } = await supabase.auth.getSession();
    return !!data.session; // Session exists and is valid
  },
};

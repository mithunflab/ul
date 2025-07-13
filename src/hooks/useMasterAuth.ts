
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface MasterUser {
  id: string;
  email: string;
  full_name: string | null;
  role: 'super_admin' | 'admin';
  is_active: boolean;
  last_login_at: string | null;
}

interface MasterAuthState {
  user: MasterUser | null;
  loading: boolean;
  error: string | null;
}

export const useMasterAuth = () => {
  const [authState, setAuthState] = useState<MasterAuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    checkMasterAuth();
  }, []);

  const checkMasterAuth = async () => {
    try {
      const masterToken = localStorage.getItem('master_auth_token');
      if (!masterToken) {
        setAuthState({ user: null, loading: false, error: null });
        return;
      }

      // Verify token with backend
      const { data, error } = await supabase.functions.invoke('master-auth', {
        body: { action: 'verify', token: masterToken }
      });

      if (error) throw error;

      setAuthState({
        user: data.user,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Master auth check failed:', error);
      localStorage.removeItem('master_auth_token');
      setAuthState({
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.functions.invoke('master-auth', {
        body: { action: 'signin', email, password }
      });

      if (error) throw error;

      localStorage.setItem('master_auth_token', data.token);
      setAuthState({
        user: data.user,
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('master_auth_token');
    setAuthState({
      user: null,
      loading: false,
      error: null,
    });
  };

  return {
    ...authState,
    signIn,
    signOut,
    refresh: checkMasterAuth,
  };
};

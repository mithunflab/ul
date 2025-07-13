import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface MasterUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  permissions: any;
  created_at: string | null;
  updated_at: string | null;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [masterUser, setMasterUser] = useState<MasterUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setMasterUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      setProfile(profileData);

      // Check if user is a master user
      const { data: masterData, error: masterError } = await supabase
        .from('master_users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (masterError && masterError.code !== 'PGRST116') {
        console.log('Not a master user:', masterError);
      }

      setMasterUser(masterData);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const isMaster = !!masterUser;
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin' || isMaster;

  return {
    profile,
    masterUser,
    loading,
    error,
    isMaster,
    isAdmin,
    refetch: fetchProfile
  };
};
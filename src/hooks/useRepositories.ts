
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../integrations/supabase/client';

interface Repository {
  id: string;
  user_id: string;
  workflow_id: string;
  repository_name: string;
  github_url: string;
  description: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useRepositories = () => {
  const { user } = useAuth();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRepositories = async () => {
    if (!user) {
      setRepositories([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('repositories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRepositories(data || []);
    } catch (err) {
      console.error('Error fetching repositories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch repositories');
    } finally {
      setLoading(false);
    }
  };

  const createRepository = async (repositoryData: {
    workflow_id: string;
    repository_name: string;
    github_url: string;
    description?: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('repositories')
        .insert([{
          user_id: user.id,
          ...repositoryData
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchRepositories();
      return data;
    } catch (err) {
      console.error('Error creating repository:', err);
      throw err;
    }
  };

  const updateRepository = async (id: string, updates: Partial<Repository>) => {
    try {
      const { error } = await supabase
        .from('repositories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await fetchRepositories();
    } catch (err) {
      console.error('Error updating repository:', err);
      throw err;
    }
  };

  const deleteRepository = async (id: string) => {
    try {
      const { error } = await supabase
        .from('repositories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchRepositories();
    } catch (err) {
      console.error('Error deleting repository:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchRepositories();
  }, [user]);

  return {
    repositories,
    loading,
    error,
    refetch: fetchRepositories,
    createRepository,
    updateRepository,
    deleteRepository
  };
};

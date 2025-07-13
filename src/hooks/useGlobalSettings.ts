
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface GlobalSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string | null;
  is_encrypted: boolean;
  created_at: string;
  updated_at: string;
}

export const useGlobalSettings = () => {
  const [settings, setSettings] = useState<GlobalSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('global_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;
      setSettings(data || []);
    } catch (err) {
      console.error('Error fetching global settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('global_settings')
        .update({ setting_value: value, updated_at: new Date().toISOString() })
        .eq('setting_key', key);

      if (error) throw error;
      await fetchSettings();
    } catch (err) {
      console.error('Error updating setting:', err);
      throw err;
    }
  };

  const getSetting = (key: string): string => {
    const setting = settings.find(s => s.setting_key === key);
    return setting?.setting_value || '';
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    updateSetting,
    getSetting
  };
};

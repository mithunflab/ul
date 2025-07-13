
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

interface UserCredits {
  ai_credits: number;
  workflow_credits: number;
}

export const useCredits = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = async () => {
    if (!user) {
      setCredits(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_user_credits', {
        p_user_id: user.id
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setCredits(data[0]);
      } else {
        setCredits({ ai_credits: 0, workflow_credits: 0 });
      }
    } catch (err) {
      console.error('Error fetching credits:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch credits');
    } finally {
      setLoading(false);
    }
  };

  const deductCredits = async (
    creditType: 'ai' | 'workflow',
    amount: number,
    transactionType: string,
    description?: string,
    referenceId?: string
  ) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.rpc('deduct_credits', {
      p_user_id: user.id,
      p_credit_type: creditType,
      p_amount: amount,
      p_transaction_type: transactionType,
      p_description: description,
      p_reference_id: referenceId
    });

    if (error) throw error;

    if (!data) {
      throw new Error('Insufficient credits');
    }

    // Refresh credits after successful deduction
    await fetchCredits();
    return data;
  };

  useEffect(() => {
    fetchCredits();
  }, [user]);

  return {
    credits,
    loading,
    error,
    refetch: fetchCredits,
    deductCredits
  };
};

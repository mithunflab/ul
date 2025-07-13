
import { supabase } from '../lib/supabase';

export const creditService = {
  // Deduct AI credits for chat usage
  deductAiCredits: async (userId: string, amount: number = 5, referenceId?: string) => {
    const { data, error } = await supabase.rpc('deduct_credits', {
      p_user_id: userId,
      p_credit_type: 'ai',
      p_amount: amount,
      p_transaction_type: 'chat_usage',
      p_description: 'AI chat interaction',
      p_reference_id: referenceId
    });

    if (error) throw error;
    return data;
  },

  // Deduct workflow credits for workflow creation
  deductWorkflowCredits: async (userId: string, amount: number = 1, referenceId?: string) => {
    const { data, error } = await supabase.rpc('deduct_credits', {
      p_user_id: userId,
      p_credit_type: 'workflow',
      p_amount: amount,
      p_transaction_type: 'workflow_usage',
      p_description: 'Workflow creation',
      p_reference_id: referenceId
    });

    if (error) throw error;
    return data;
  },

  // Get user's current credit balance
  getUserCredits: async (userId: string) => {
    const { data, error } = await supabase.rpc('get_user_credits', {
      p_user_id: userId
    });

    if (error) throw error;
    return data?.[0] || { ai_credits: 0, workflow_credits: 0 };
  },

  // Get credit transaction history
  getCreditTransactions: async (userId: string, limit: number = 50) => {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
};

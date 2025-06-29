import { useState, useEffect, useCallback } from 'react';
import WebSubscriptionService, { SubscriptionTier, SUBSCRIPTION_TIERS, CustomerInfo } from '../lib/revenuecat';

interface SubscriptionState {
  customerInfo: CustomerInfo | null;
  currentTier: SubscriptionTier;
  isLoading: boolean;
  error: string | null;
}

interface UsageState {
  workflows: number;
  voiceMinutes: number;
  lastReset: Date;
}

export const useSubscription = (userId?: string) => {
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>({
    customerInfo: null,
    currentTier: SUBSCRIPTION_TIERS[0], // Default to free tier
    isLoading: true,
    error: null,
  });

  const [usage, setUsage] = useState<UsageState>({
    workflows: 0,
    voiceMinutes: 0,
    lastReset: new Date(),
  });

  const subscriptionService = WebSubscriptionService.getInstance();

  // Initialize subscription service and fetch customer info
  const initializeSubscription = useCallback(async () => {
    try {
      setSubscriptionState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await subscriptionService.configure(userId);
      const customerInfo = await subscriptionService.getCustomerInfo();
      const currentTier = subscriptionService.getSubscriptionTier(customerInfo);

      setSubscriptionState({
        customerInfo,
        currentTier,
        isLoading: false,
        error: null,
      });

      // Load usage from localStorage
      loadUsage();
    } catch (error: any) {
      console.error('Failed to initialize subscription:', error);
      setSubscriptionState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to initialize subscription',
      }));
    }
  }, [userId]);

  // Load usage data from localStorage
  const loadUsage = useCallback(() => {
    try {
      const savedUsage = localStorage.getItem('workflow_ai_usage');
      if (savedUsage) {
        const parsedUsage = JSON.parse(savedUsage);
        const lastReset = new Date(parsedUsage.lastReset);
        const now = new Date();
        
        // Reset usage if it's a new month
        if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
          setUsage({
            workflows: 0,
            voiceMinutes: 0,
            lastReset: now,
          });
          saveUsage({ workflows: 0, voiceMinutes: 0, lastReset: now });
        } else {
          setUsage({
            workflows: parsedUsage.workflows || 0,
            voiceMinutes: parsedUsage.voiceMinutes || 0,
            lastReset,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load usage:', error);
    }
  }, []);

  // Save usage data to localStorage
  const saveUsage = useCallback((newUsage: UsageState) => {
    try {
      localStorage.setItem('workflow_ai_usage', JSON.stringify(newUsage));
    } catch (error) {
      console.error('Failed to save usage:', error);
    }
  }, []);

  // Update usage for workflows
  const incrementWorkflowUsage = useCallback(() => {
    setUsage(prev => {
      const newUsage = {
        ...prev,
        workflows: prev.workflows + 1,
      };
      saveUsage(newUsage);
      return newUsage;
    });
  }, [saveUsage]);

  // Update usage for voice minutes
  const incrementVoiceUsage = useCallback((minutes: number) => {
    setUsage(prev => {
      const newUsage = {
        ...prev,
        voiceMinutes: prev.voiceMinutes + minutes,
      };
      saveUsage(newUsage);
      return newUsage;
    });
  }, [saveUsage]);

  // Check if user can perform an action
  const canPerformAction = useCallback((action: 'workflow' | 'voice'): boolean => {
    const currentUsage = action === 'workflow' ? usage.workflows : usage.voiceMinutes;
    return subscriptionService.canPerformAction(subscriptionState.customerInfo, action, currentUsage);
  }, [subscriptionState.customerInfo, usage]);

  // Get remaining usage for current tier
  const getRemainingUsage = useCallback(() => {
    const { currentTier } = subscriptionState;
    return {
      workflows: currentTier.limits.workflows === -1 
        ? -1 // Unlimited
        : Math.max(0, currentTier.limits.workflows - usage.workflows),
      voiceMinutes: currentTier.limits.voiceMinutes === -1 
        ? -1 // Unlimited
        : Math.max(0, currentTier.limits.voiceMinutes - usage.voiceMinutes),
    };
  }, [subscriptionState.currentTier, usage]);

  // Purchase a subscription
  const purchaseSubscription = useCallback(async (packageToPurchase: any) => {
    try {
      setSubscriptionState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result = await subscriptionService.purchasePackage(packageToPurchase);
      
      if (result.success && result.customerInfo) {
        const currentTier = subscriptionService.getSubscriptionTier(result.customerInfo);
        setSubscriptionState({
          customerInfo: result.customerInfo,
          currentTier,
          isLoading: false,
          error: null,
        });
        return { success: true };
      } else {
        setSubscriptionState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Purchase failed',
        }));
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Purchase failed';
      setSubscriptionState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Restore purchases
  const restorePurchases = useCallback(async () => {
    try {
      setSubscriptionState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result = await subscriptionService.restorePurchases();
      
      if (result.success && result.customerInfo) {
        const currentTier = subscriptionService.getSubscriptionTier(result.customerInfo);
        setSubscriptionState({
          customerInfo: result.customerInfo,
          currentTier,
          isLoading: false,
          error: null,
        });
        return { success: true };
      } else {
        setSubscriptionState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Restore failed',
        }));
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Restore failed';
      setSubscriptionState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Get offerings for purchase
  const getOfferings = useCallback(async () => {
    try {
      return await subscriptionService.getOfferings();
    } catch (error) {
      console.error('Failed to get offerings:', error);
      return [];
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeSubscription();
  }, [initializeSubscription]);

  return {
    // Subscription state
    ...subscriptionState,
    
    // Usage state
    usage,
    remainingUsage: getRemainingUsage(),
    
    // Actions
    incrementWorkflowUsage,
    incrementVoiceUsage,
    canPerformAction,
    purchaseSubscription,
    restorePurchases,
    getOfferings,
    
    // Helper methods
    isFreeTier: subscriptionState.currentTier.id === 'free',
    isProTier: subscriptionState.currentTier.id === 'pro',
    isEnterpriseTier: subscriptionState.currentTier.id === 'enterprise',
    
    // Refresh method
    refresh: initializeSubscription,
  };
}; 
import React, { useState, useEffect } from 'react';
import { X, Check, Zap, Crown, Users, Sparkles } from 'lucide-react';
import { SUBSCRIPTION_TIERS, PRODUCTS } from '../lib/revenuecat';
import { useSubscription } from '../hooks/useSubscription';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, userId }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setPurchasing] = useState<string | null>(null);
  const [offerings, setOfferings] = useState<any[]>([]);
  
  const subscription = useSubscription(userId);

  useEffect(() => {
    if (isOpen) {
      loadOfferings();
    }
  }, [isOpen]);

  const loadOfferings = async () => {
    try {
      const availableOfferings = await subscription.getOfferings();
      console.log('Loaded offerings:', availableOfferings);
      
      if (availableOfferings && availableOfferings.length > 0) {
        setOfferings(availableOfferings);
      } else {
        // Fallback to mock offerings if none available
        console.log('No offerings available, using mock data');
        const mockOfferings = [{
          identifier: 'default',
          availablePackages: [
            {
              identifier: PRODUCTS.PRO_MONTHLY,
              product: {
                identifier: PRODUCTS.PRO_MONTHLY,
                title: 'WorkFlow AI Pro Monthly',
                description: 'Pro features for one month',
                price: 19.00,
                priceString: '$19.00',
              },
            },
            {
              identifier: PRODUCTS.PRO_YEARLY,
              product: {
                identifier: PRODUCTS.PRO_YEARLY,
                title: 'WorkFlow AI Pro Yearly',
                description: 'Pro features for one year (2 months free)',
                price: 190.00,
                priceString: '$190.00',
              },
            },
            {
              identifier: PRODUCTS.ENTERPRISE_MONTHLY,
              product: {
                identifier: PRODUCTS.ENTERPRISE_MONTHLY,
                title: 'WorkFlow AI Enterprise Monthly',
                description: 'Enterprise features for one month',
                price: 49.00,
                priceString: '$49.00',
              },
            },
            {
              identifier: PRODUCTS.ENTERPRISE_YEARLY,
              product: {
                identifier: PRODUCTS.ENTERPRISE_YEARLY,
                title: 'WorkFlow AI Enterprise Yearly',
                description: 'Enterprise features for one year (2 months free)',
                price: 490.00,
                priceString: '$490.00',
              },
            },
          ],
        }];
        setOfferings(mockOfferings);
      }
    } catch (error) {
      console.error('Failed to load offerings:', error);
      // Set mock offerings as fallback
      const mockOfferings = [{
        identifier: 'default',
        availablePackages: [
          {
            identifier: PRODUCTS.PRO_MONTHLY,
            product: {
              identifier: PRODUCTS.PRO_MONTHLY,
              title: 'WorkFlow AI Pro Monthly',
              description: 'Pro features for one month',
              price: 19.00,
              priceString: '$19.00',
            },
          },
          {
            identifier: PRODUCTS.PRO_YEARLY,
            product: {
              identifier: PRODUCTS.PRO_YEARLY,
              title: 'WorkFlow AI Pro Yearly',
              description: 'Pro features for one year (2 months free)',
              price: 190.00,
              priceString: '$190.00',
            },
          },
          {
            identifier: PRODUCTS.ENTERPRISE_MONTHLY,
            product: {
              identifier: PRODUCTS.ENTERPRISE_MONTHLY,
              title: 'WorkFlow AI Enterprise Monthly',
              description: 'Enterprise features for one month',
              price: 49.00,
              priceString: '$49.00',
            },
          },
          {
            identifier: PRODUCTS.ENTERPRISE_YEARLY,
            product: {
              identifier: PRODUCTS.ENTERPRISE_YEARLY,
              title: 'WorkFlow AI Enterprise Yearly',
              description: 'Enterprise features for one year (2 months free)',
              price: 490.00,
              priceString: '$490.00',
            },
          },
        ],
      }];
      setOfferings(mockOfferings);
    }
  };

  const handlePurchase = async (tierId: string) => {
    if (!offerings.length) return;
    
    setPurchasing(tierId);
    
    try {
      // Find the appropriate package based on tier and billing period
      const offering = offerings[0]; // Assuming default offering
      
      // Map tier ID and billing period to actual RevenueCat package identifiers
      let packageId: string;
      if (tierId === 'pro') {
        // RevenueCat auto-generated package IDs for Pro plans
        packageId = selectedPlan === 'yearly' ? '$rc_annual' : '$rc_monthly';
      } else if (tierId === 'enterprise') {
        // Custom package IDs for Enterprise plans
        packageId = selectedPlan === 'yearly' ? 'enterprise_yearly' : 'enterprise_monthly';
      } else {
        throw new Error('Invalid tier selected');
      }

      console.log('Looking for package:', packageId);
      console.log('Available packages:', offering.availablePackages?.map((pkg: any) => pkg.identifier));

      const packageToPurchase = offering.availablePackages?.find(
        (pkg: any) => pkg.identifier === packageId
      );

      if (!packageToPurchase) {
        throw new Error(`Package not found: ${packageId}`);
      }

      const result = await subscription.purchaseSubscription(packageToPurchase);
      
      if (result.success) {
        onClose();
        // Show success message
        alert('Subscription activated successfully!');
      } else {
        alert(result.error || 'Purchase failed');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      alert(error.message || 'Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    try {
      const result = await subscription.restorePurchases();
      if (result.success) {
        alert('Purchases restored successfully!');
        onClose();
      } else {
        alert(result.error || 'No purchases to restore');
      }
    } catch (error: any) {
      alert(error.message || 'Restore failed');
    }
  };

  const getPlanIcon = (tierId: string) => {
    switch (tierId) {
      case 'free':
        return <Sparkles className="w-6 h-6" />;
      case 'pro':
        return <Zap className="w-6 h-6" />;
      case 'enterprise':
        return <Crown className="w-6 h-6" />;
      default:
        return <Users className="w-6 h-6" />;
    }
  };

  const getPlanColor = (tierId: string) => {
    switch (tierId) {
      case 'free':
        return 'border-slate-600 bg-slate-800/50';
      case 'pro':
        return 'border-blue-500 bg-gradient-to-br from-blue-600/20 to-purple-600/20 ring-2 ring-blue-500/30';
      case 'enterprise':
        return 'border-amber-500 bg-gradient-to-br from-amber-600/20 to-orange-600/20';
      default:
        return 'border-slate-600 bg-slate-800/50';
    }
  };

  const getYearlyDiscount = (monthlyPrice: string) => {
    const monthly = parseInt(monthlyPrice.replace('$', ''));
    const yearly = monthly * 10; // 2 months free
    const savings = (monthly * 12) - yearly;
    return savings;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Choose Your Plan</h2>
            <p className="text-slate-400 mt-1">Scale your workflow automation with the right features</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Billing Toggle */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-center">
            <div className="bg-slate-800 rounded-lg p-1 flex">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedPlan === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all relative ${
                  selectedPlan === 'yearly'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 rounded">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUBSCRIPTION_TIERS.map((tier) => {
              const isCurrentTier = subscription.currentTier.id === tier.id;
              const yearlyPrice = tier.id !== 'free' 
                ? `$${parseInt(tier.price.replace('$', '')) * 10}`
                : '$0';
              
              return (
                <div
                  key={tier.id}
                  className={`relative rounded-xl border-2 p-6 ${getPlanColor(tier.id)} ${
                    tier.id === 'pro' ? 'transform scale-105' : ''
                  }`}
                >
                  {tier.id === 'pro' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {isCurrentTier && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Current Plan
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 rounded-lg ${
                      tier.id === 'free' ? 'bg-slate-700' :
                      tier.id === 'pro' ? 'bg-blue-600' : 'bg-amber-600'
                    }`}>
                      {getPlanIcon(tier.id)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                      <p className="text-slate-400 text-sm">{tier.description}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-bold text-white">
                        {selectedPlan === 'yearly' && tier.id !== 'free' ? yearlyPrice : tier.price}
                      </span>
                      <span className="text-slate-400">
                        {tier.id !== 'free' ? `/${selectedPlan === 'yearly' ? 'year' : 'month'}` : ''}
                      </span>
                    </div>
                    {selectedPlan === 'yearly' && tier.id !== 'free' && (
                      <p className="text-green-400 text-sm mt-1">
                        Save ${getYearlyDiscount(tier.price)} per year
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    {tier.id === 'free' ? (
                      <div className="text-center py-3 text-slate-400 text-sm">
                        {isCurrentTier ? 'Current Plan' : 'Always Free'}
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePurchase(tier.id)}
                        disabled={isProcessing === tier.id || isCurrentTier}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                          isCurrentTier
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            : tier.id === 'pro'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                            : 'bg-amber-600 hover:bg-amber-700 text-white'
                        } ${isProcessing === tier.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isProcessing === tier.id ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Processing...</span>
                          </div>
                        ) : isCurrentTier ? (
                          'Current Plan'
                        ) : (
                          `Upgrade to ${tier.name}`
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Usage Display */}
          {!subscription.isLoading && (
            <div className="mt-8 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
              <h4 className="text-lg font-semibold text-white mb-4">Current Usage</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Workflows</span>
                    <span className="text-white">
                      {subscription.usage.workflows} / {
                        subscription.currentTier.limits.workflows === -1 
                          ? 'Unlimited' 
                          : subscription.currentTier.limits.workflows
                      }
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{
                        width: subscription.currentTier.limits.workflows === -1 
                          ? '0%' 
                          : `${Math.min(100, (subscription.usage.workflows / subscription.currentTier.limits.workflows) * 100)}%`
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Voice Minutes</span>
                    <span className="text-white">
                      {subscription.usage.voiceMinutes} / {
                        subscription.currentTier.limits.voiceMinutes === -1 
                          ? 'Unlimited' 
                          : subscription.currentTier.limits.voiceMinutes
                      }
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{
                        width: subscription.currentTier.limits.voiceMinutes === -1 
                          ? '0%' 
                          : `${Math.min(100, (subscription.usage.voiceMinutes / subscription.currentTier.limits.voiceMinutes) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-slate-400 text-sm">
              <p>• All plans include 7-day free trial</p>
              <p>• Cancel anytime, no questions asked</p>
              <p>• 30-day money-back guarantee</p>
            </div>
            <button
              onClick={handleRestore}
              className="text-blue-400 hover:text-blue-300 text-sm underline"
            >
              Restore Purchases
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal; 
import React from 'react';
import { X, AlertTriangle, Zap, Crown } from 'lucide-react';
import { SubscriptionTier } from '../lib/revenuecat';

interface UsageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  limitType: 'workflow' | 'voice';
  currentTier: SubscriptionTier;
  usage: {
    workflows: number;
    voiceMinutes: number;
  };
}

const UsageLimitModal: React.FC<UsageLimitModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  limitType,
  currentTier,
  usage,
}) => {
  if (!isOpen) return null;

  const getUpgradeRecommendation = () => {
    if (currentTier.id === 'free') {
      return {
        tier: 'Pro',
        price: '$19/month',
        icon: <Zap className="w-6 h-6" />,
        color: 'from-blue-600 to-purple-600',
        benefits: [
          limitType === 'workflow' ? '300 workflows per month' : '500 voice minutes per month',
          'All 3 platforms (n8n, Zapier, Make.com)',
          'Advanced AI models',
          'Premium voice features',
          'Email support',
        ],
      };
    } else {
      return {
        tier: 'Enterprise',
        price: '$49/month',
        icon: <Crown className="w-6 h-6" />,
        color: 'from-amber-600 to-orange-600',
        benefits: [
          'Unlimited workflows',
          'Unlimited voice minutes',
          'Custom integrations',
          'Premium AI models',
          'Priority support',
          'White-label branding',
        ],
      };
    }
  };

  const recommendation = getUpgradeRecommendation();

  const getLimitMessage = () => {
    if (limitType === 'workflow') {
      return {
        title: 'Workflow Generation Limit Reached',
        message: `You've used all ${currentTier.limits.workflows} workflows included in your ${currentTier.name} plan this month.`,
        icon: '🔄',
      };
    } else {
      return {
        title: 'Voice Minutes Limit Reached',
        message: `You've used all ${currentTier.limits.voiceMinutes} voice minutes included in your ${currentTier.name} plan this month.`,
        icon: '🎤',
      };
    }
  };

  const limitInfo = getLimitMessage();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-600/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white">{limitInfo.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">{limitInfo.icon}</div>
            <p className="text-slate-300 leading-relaxed">
              {limitInfo.message}
            </p>
          </div>

          {/* Current Usage */}
          <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-slate-400 mb-3">Current Usage</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Workflows</span>
                  <span className="text-white">
                    {usage.workflows} / {currentTier.limits.workflows}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, (usage.workflows / currentTier.limits.workflows) * 100)}%`
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Voice Minutes</span>
                  <span className="text-white">
                    {usage.voiceMinutes} / {currentTier.limits.voiceMinutes}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, (usage.voiceMinutes / currentTier.limits.voiceMinutes) * 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade Recommendation */}
          <div className={`bg-gradient-to-r ${recommendation.color} p-4 rounded-lg mb-6`}>
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-white/20 rounded-lg">
                {recommendation.icon}
              </div>
              <div>
                <h4 className="text-white font-semibold">Upgrade to {recommendation.tier}</h4>
                <p className="text-white/80 text-sm">{recommendation.price}</p>
              </div>
            </div>
            <ul className="space-y-1">
              {recommendation.benefits.map((benefit, index) => (
                <li key={index} className="text-white/90 text-sm flex items-center">
                  <span className="w-1 h-1 bg-white/60 rounded-full mr-2 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={onUpgrade}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white bg-gradient-to-r ${recommendation.color} hover:opacity-90 transition-opacity`}
            >
              Upgrade to {recommendation.tier}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-lg font-medium text-slate-400 border border-slate-600 hover:text-white hover:border-slate-500 transition-colors"
            >
              Maybe Later
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-xs">
              Your usage will reset on the 1st of next month
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageLimitModal; 
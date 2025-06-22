import React, { useState } from 'react';
import { Mic, Play, BarChart3, Globe, Zap, Infinity, Rocket } from 'lucide-react';
import AuthModal from './AuthModal';
import { useAuth } from '../hooks/useAuth';

interface HeroSectionProps {
  onDashboardClick?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onDashboardClick }) => {
  const [isListening, setIsListening] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, loading } = useAuth();

  const handleVoiceClick = () => {
    setIsListening(!isListening);
    // Simulate listening for demo
    if (!isListening) {
      setTimeout(() => setIsListening(false), 3000);
    }
  };

  const handleStartBuildingClick = () => {
    if (user && onDashboardClick) {
      onDashboardClick();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden pt-24">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%236366f1%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Hackathon Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8 animate-pulse">
            🏆 Built with Bolt for Hackathon 2025
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-slate-50 mb-6 leading-tight">
            Voice-Powered
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-amber-400 bg-clip-text text-transparent">
              n8n Automation
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Create sophisticated workflows using just your voice. Describe what you want to automate, 
            and our AI generates, validates, and deploys complete n8n workflows instantly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
            {loading ? (
              // Loading skeleton for button
              <div className="w-48 h-14 bg-slate-700/50 rounded-xl animate-pulse"></div>
            ) : (
              <button 
                onClick={handleStartBuildingClick}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center space-x-3 hover:scale-105"
              >
                <Rocket className="w-5 h-5" />
                <span>{user ? 'Go to Dashboard' : 'Start Building'}</span>
              </button>
            )}
            <button className="border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 flex items-center space-x-3">
              <Play className="w-5 h-5" />
              <span>View Demo</span>
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto pb-16">
            <div className="flex flex-col items-center space-y-2">
              <Globe className="w-8 h-8 text-indigo-400" />
              <span className="text-2xl font-bold text-slate-50">29+</span>
              <span className="text-sm text-slate-400">Languages</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Zap className="w-8 h-8 text-amber-400" />
              <span className="text-2xl font-bold text-slate-50">AI</span>
              <span className="text-sm text-slate-400">Powered</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Mic className="w-8 h-8 text-emerald-400" />
              <span className="text-2xl font-bold text-slate-50">100%</span>
              <span className="text-sm text-slate-400">Voice-First</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Infinity className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-slate-50">∞</span>
              <span className="text-sm text-slate-400">Workflows</span>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal - Only show if user is not logged in */}
      {!user && (
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          initialMode="signup"
        />
      )}
    </>
  );
};

export default HeroSection;
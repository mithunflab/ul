import React, { useState } from 'react';
import { Menu, X, Rocket, User, LogOut, Settings, ChevronDown, LayoutDashboard } from 'lucide-react';
import Logo from './Logo';
import AuthModal from './AuthModal';
import { useAuth } from '../hooks/useAuth';
import { authHelpers } from '../lib/supabase';

interface NavigationProps {
  onProfileClick?: () => void;
  onDashboardClick?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onProfileClick, onDashboardClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { user, loading } = useAuth();

  const handleLogoClick = () => {
    // Scroll to top of page (home)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGetStartedClick = () => {
    if (user && onDashboardClick) {
      onDashboardClick();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleLogout = async () => {
    try {
      await authHelpers.signOut();
      setIsUserDropdownOpen(false);
      // Optionally redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileClick = () => {
    setIsUserDropdownOpen(false);
    if (onProfileClick) {
      onProfileClick();
    }
  };

  const handleDashboardClick = () => {
    setIsUserDropdownOpen(false);
    if (onDashboardClick) {
      onDashboardClick();
    }
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Clickable */}
            <button 
              onClick={handleLogoClick}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
            >
              <Logo size={32} />
              <span className="text-xl font-bold text-slate-50">WorkFlow AI</span>
            </button>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors duration-200">
                Features
              </a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition-colors duration-200">
                Pricing
              </a>
              <a href="#docs" className="text-slate-300 hover:text-white transition-colors duration-200">
                Docs
              </a>
              
              {/* Conditional rendering based on auth state */}
              {loading ? (
                // Loading skeleton
                <div className="w-32 h-10 bg-slate-700/50 rounded-xl animate-pulse"></div>
              ) : user ? (
                // User dropdown when logged in
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600 hover:border-slate-500 px-4 py-2 rounded-xl transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-amber-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {getUserInitials()}
                    </div>
                    <span className="text-slate-300 font-medium">{getUserDisplayName()}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl py-2 animate-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-slate-700/50">
                        <p className="text-sm font-medium text-slate-300">{getUserDisplayName()}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                      
                      <div className="py-1">
                        <button 
                          onClick={handleDashboardClick}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-200"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Dashboard</span>
                        </button>
                        <button 
                          onClick={handleProfileClick}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-200"
                        >
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </button>
                        <button className="w-full flex items-center space-x-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-200">
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </button>
                      </div>
                      
                      <div className="border-t border-slate-700/50 py-1">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Get Started button when not logged in
                <button 
                  onClick={handleGetStartedClick}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center space-x-2"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Get Started</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-300 hover:text-white transition-colors duration-200"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-slate-800/95 backdrop-blur-sm border-t border-slate-700/50">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#features" className="block px-3 py-2 text-slate-300 hover:text-white transition-colors duration-200">
                  Features
                </a>
                <a href="#pricing" className="block px-3 py-2 text-slate-300 hover:text-white transition-colors duration-200">
                  Pricing
                </a>
                <a href="#docs" className="block px-3 py-2 text-slate-300 hover:text-white transition-colors duration-200">
                  Docs
                </a>
                
                {/* Mobile Auth Section */}
                {loading ? (
                  <div className="w-full h-12 bg-slate-700/50 rounded-xl animate-pulse mt-4"></div>
                ) : user ? (
                  // Mobile user menu when logged in
                  <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-2">
                    <div className="flex items-center space-x-3 px-3 py-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-amber-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {getUserInitials()}
                      </div>
                      <div>
                        <p className="text-slate-300 font-medium">{getUserDisplayName()}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleDashboardClick}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-slate-300 hover:text-white transition-colors duration-200"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </button>
                    <button 
                      onClick={handleProfileClick}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-slate-300 hover:text-white transition-colors duration-200"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-3 py-2 text-slate-300 hover:text-white transition-colors duration-200">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-red-400 hover:text-red-300 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  // Mobile Get Started button when not logged in
                  <button 
                    onClick={handleGetStartedClick}
                    className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>Get Started</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode="signup"
      />
    </>
  );
};

export default Navigation;
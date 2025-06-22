import React, { useState } from 'react';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import VoiceDemoSection from './components/VoiceDemoSection';
import FeaturesSection from './components/FeaturesSection';
import TechStackSection from './components/TechStackSection';
import UseCasesSection from './components/UseCasesSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import ProfilePage from './components/ProfilePage';
import Dashboard from './components/Dashboard';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'dashboard'>('home');

  const handleProfileClick = () => {
    setCurrentView('profile');
  };

  const handleHomeClick = () => {
    setCurrentView('home');
  };

  const handleDashboardClick = () => {
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900 font-['Inter',sans-serif]">
      {currentView !== 'dashboard' && (
        <Navigation 
          onProfileClick={handleProfileClick} 
          onDashboardClick={handleDashboardClick}
        />
      )}
      
      {currentView === 'home' && (
        <>
          <HeroSection onDashboardClick={handleDashboardClick} />
          <VoiceDemoSection />
          <FeaturesSection />
          <TechStackSection />
          <UseCasesSection />
          <CTASection onDashboardClick={handleDashboardClick} />
          <Footer />
        </>
      )}
      
      {currentView === 'profile' && <ProfilePage />}
      {currentView === 'dashboard' && <Dashboard />}
    </div>
  );
}

export default App;
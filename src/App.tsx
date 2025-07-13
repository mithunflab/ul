
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import VoiceDemoSection from './components/VoiceDemoSection';
import UseCasesSection from './components/UseCasesSection';
import TechStackSection from './components/TechStackSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import { Dashboard } from './pages/Dashboard';
import { MasterPortal } from './pages/MasterPortal';
import { useAuth } from './hooks/useAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const LandingPage: React.FC = () => {
  const { user } = useAuth();

  const handleDashboardClick = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      <HeroSection />
      <FeaturesSection />
      <VoiceDemoSection />
      <UseCasesSection />
      <TechStackSection />
      <CTASection onDashboardClick={user ? handleDashboardClick : undefined} />
      <Footer />
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* User Dashboard */}
          <Route path="/dashboard/*" element={<Dashboard />} />
          
          {/* Master Portal */}
          <Route path="/master/*" element={<MasterPortal />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

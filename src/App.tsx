
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from './hooks/useAuth';
import { AuthModal } from './components/AuthModal';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import VoiceDemoSection from './components/VoiceDemoSection';
import UseCasesSection from './components/UseCasesSection';
import TechStackSection from './components/TechStackSection';
import CTASection from './components/CTASection';
import { Dashboard } from './pages/Dashboard';
import { MasterPortal } from './pages/MasterPortal';
import Footer from './components/Footer';

// Landing page component
const LandingPage = () => (
  <div className="min-h-screen bg-slate-900 text-slate-50">
    <HeroSection />
    <FeaturesSection />
    <VoiceDemoSection />
    <UseCasesSection />
    <TechStackSection />
    <CTASection />
    <Footer />
  </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Protected user dashboard routes */}
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected master portal routes */}
          <Route 
            path="/master/*" 
            element={
              <ProtectedRoute>
                <MasterPortal />
              </ProtectedRoute>
            } 
          />
        </Routes>
        
        <AuthModal isOpen={false} onClose={() => {}} />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;

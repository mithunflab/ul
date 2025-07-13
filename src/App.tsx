
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import VoiceDemoSection from './components/VoiceDemoSection';
import UseCasesSection from './components/UseCasesSection';
import TechStackSection from './components/TechStackSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import { Dashboard } from './pages/Dashboard';
import { MasterPortal } from './pages/MasterPortal';
import AuthPage from './pages/AuthPage';
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
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      <HeroSection />
      <FeaturesSection />
      <VoiceDemoSection />
      <UseCasesSection />
      <TechStackSection />
      <CTASection onDashboardClick={handleDashboardClick} />
      <Footer />
    </div>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // TODO: Implement role checking when needed
  console.log('Required role:', requiredRole);

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Authentication */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* User Dashboard - Protected */}
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Master Portal - Protected */}
          <Route 
            path="/master/*" 
            element={
              <ProtectedRoute requiredRole="master">
                <MasterPortal />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

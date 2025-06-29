import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Play, 
  Sparkles, 
  Zap, 
  CheckCircle, 
  Menu, 
  X,
  ArrowRight,
  MessageSquare,
  Database,
  Globe,
  Heart,
  User,
  LogOut,
  BarChart3
} from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './pages/Dashboard';
import PricingModal from './components/PricingModal';
import { useAuth } from './hooks/useAuth';
import Logo from './components/Logo';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [pricingRequested, setPricingRequested] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'dashboard'>('home');
  const { user, loading, signOut } = useAuth();

  // Check URL path and set current page
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/dashboard' && user) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('home');
    }
  }, [user]);

  // Update URL when page changes
  useEffect(() => {
    if (currentPage === 'dashboard' && user) {
      window.history.pushState({}, '', '/dashboard');
    } else {
      window.history.pushState({}, '', '/');
    }
  }, [currentPage, user]);

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  const handleGetStarted = () => {
    if (user) {
      // User is authenticated, go to dashboard
      setCurrentPage('dashboard');
    } else {
      // User is not authenticated, show auth modal
      setAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    if (pricingRequested) {
      // User wanted pricing, show pricing modal instead of going to dashboard
      setPricingModalOpen(true);
      setPricingRequested(false);
    } else {
      // Normal flow - redirect to dashboard
      setCurrentPage('dashboard');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setCurrentPage('home');
  };

  const handlePricingClick = () => {
    if (user) {
      // User is authenticated, show pricing modal
      setPricingModalOpen(true);
    } else {
      // User is not authenticated, show auth modal first
      setPricingRequested(true);
      setAuthModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-slate-400">
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-amber-500 rounded-full animate-pulse"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Show dashboard if user is authenticated and on dashboard page
  if (currentPage === 'dashboard' && user) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-['Inter',sans-serif]">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-50 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentPage('home')}>
              <Logo size={40} />
              <span className="text-xl font-bold text-slate-50">WorkFlow AI</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors duration-200">Features</a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition-colors duration-200">Pricing</a>
              
              
              {user ? (
                // Authenticated user menu
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setCurrentPage('dashboard')}
                    className="text-slate-300 hover:text-white transition-colors duration-200"
                  >
                    Dashboard
                  </button>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                // Unauthenticated user
                <button 
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/25"
                >
                  Get Started
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-slate-800/95 backdrop-blur-sm border-t border-slate-700/50">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#features" className="block px-3 py-2 text-slate-300 hover:text-white">Features</a>
                <a href="#pricing" className="block px-3 py-2 text-slate-300 hover:text-white">Pricing</a>
                <a href="#docs" className="block px-3 py-2 text-slate-300 hover:text-white">Docs</a>
                
                {user ? (
                  <div className="border-t border-slate-700/50 pt-2 mt-2">
                    <button
                      onClick={() => {
                        setCurrentPage('dashboard');
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-slate-300 hover:text-white"
                    >
                      Dashboard
                    </button>
                    <div className="px-3 py-2 text-slate-300 text-sm">{user.email}</div>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-400 hover:text-white"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      handleGetStarted();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2 rounded-xl font-semibold"
                  >
                    Get Started
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div 
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Hackathon Badge */}
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
            🏆 Built for Bolt.new Hackathon 2025 Using BOLT
          </div>

          {/* Main Headlines */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-50 to-slate-300 bg-clip-text text-transparent">
            Voice-Powered<br />
            n8n Automation
          </h1>

          <p className="text-xl sm:text-2xl text-slate-400 max-w-4xl mx-auto mb-12 leading-relaxed">
            Create sophisticated workflows using just your voice. Describe what you want to automate, and our AI generates, validates, and deploys complete n8n workflows instantly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center space-x-2"
            >
              {user ? (
                <BarChart3 className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
              <span>{user ? 'Go to Dashboard' : 'Start Speaking'}</span>
            </button>
            <button className="border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span>View Demo</span>
            </button>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-slate-400">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              <span>29+ Languages</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>AI Powered</span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <span>100% Voice-First</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-indigo-400 text-xl">∞</span>
              <span>Workflows</span>
            </div>
          </div>
        </div>
      </section>

      {/* Voice Demo Section */}
      <section className="py-20 bg-slate-800/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-12">Experience Voice Automation</h2>
          
          {/* Voice Button */}
          <div className="mb-12">
            <button 
              onClick={toggleListening}
              className={`w-32 h-32 bg-gradient-to-br from-indigo-500 to-amber-500 rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-lg shadow-indigo-500/25 relative ${isListening ? 'animate-pulse' : ''}`}
            >
              {isListening && (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-amber-500 rounded-full animate-ping opacity-20"></div>
              )}
              <div className="relative">
                {isListening ? (
                  <MicOff className="w-12 h-12 text-white" />
                ) : (
                  <Mic className="w-12 h-12 text-white" />
                )}
              </div>
            </button>
            <p className="mt-4 text-slate-400">Click the microphone and describe your automation needs</p>
          </div>

          {/* Demo Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Voice Input Card */}
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-600">
              <div className="text-indigo-400 text-sm font-medium mb-3 flex items-center space-x-2">
                <Mic className="w-4 h-4" />
                <span>Voice Input:</span>
              </div>
              <div className="text-slate-50 text-lg leading-relaxed">
                "Create a workflow that sends me Slack notifications when we get new leads in HubSpot"
              </div>
            </div>

            {/* AI Response Card */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-amber-500/10 border border-indigo-500/20 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-400 font-medium">AI Generated</span>
              </div>
              <div className="text-slate-50 space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Generated 4-node workflow</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>HubSpot trigger configured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Slack integration ready</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Ready to deploy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Revolutionary Features</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Experience the future of automation with cutting-edge voice AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-indigo-500/30 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Voice-First Interface</h3>
              <p className="text-slate-400 leading-relaxed">
                Describe complex workflows naturally in 29+ languages. No coding required, just speak your automation needs and watch them come to life.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-indigo-500/30 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI-Powered Generation</h3>
              <p className="text-slate-400 leading-relaxed">
                Claude AI creates production-ready n8n workflows with proper error handling, data validation, and security best practices.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-indigo-500/30 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Instant Deployment</h3>
              <p className="text-slate-400 leading-relaxed">
                Automatically deploy and activate workflows in your n8n instance with one click. Test, validate, and go live in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powered By Best-in-Class Tech</h2>
            <p className="text-xl text-slate-400">Built with the most advanced tools in the industry</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Bolt.new */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-600/50 transition-colors duration-300">
                <Zap className="w-10 h-10 text-indigo-400" />
              </div>
              <h4 className="font-semibold text-slate-50">Bolt.new</h4>
              <p className="text-sm text-slate-400">Development Platform</p>
            </div>

            {/* Supabase */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-600/50 transition-colors duration-300">
                <Database className="w-10 h-10 text-emerald-400" />
              </div>
              <h4 className="font-semibold text-slate-50">Supabase</h4>
              <p className="text-sm text-slate-400">Backend & Database</p>
            </div>

            {/* ElevenLabs */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-600/50 transition-colors duration-300">
                <MessageSquare className="w-10 h-10 text-amber-400" />
              </div>
              <h4 className="font-semibold text-slate-50">ElevenLabs</h4>
              <p className="text-sm text-slate-400">Voice AI</p>
            </div>

            {/* Claude */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-600/50 transition-colors duration-300">
                <Sparkles className="w-10 h-10 text-indigo-400" />
              </div>
              <h4 className="font-semibold text-slate-50">Claude</h4>
              <p className="text-sm text-slate-400">AI Generation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Real-World Use Cases</h2>
            <p className="text-xl text-slate-400">See how teams are automating with voice commands</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Use Case 1 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <div className="text-amber-400 font-semibold mb-2">Business Automation</div>
              <h4 className="text-lg font-semibold mb-3 text-slate-50">Lead Management</h4>
              <p className="text-slate-400 text-sm italic mb-3">
                "Create a workflow that sends me Slack notifications when we get new leads in HubSpot"
              </p>
              <div className="text-xs text-emerald-400">✓ Generated in 12 seconds</div>
            </div>

            {/* Use Case 2 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <div className="text-indigo-400 font-semibold mb-2">Data Integration</div>
              <h4 className="text-lg font-semibold mb-3 text-slate-50">Payment Sync</h4>
              <p className="text-slate-400 text-sm italic mb-3">
                "Import customer data from Stripe to Airtable every hour"
              </p>
              <div className="text-xs text-emerald-400">✓ Generated in 8 seconds</div>
            </div>

            {/* Use Case 3 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <div className="text-emerald-400 font-semibold mb-2">Content Management</div>
              <h4 className="text-lg font-semibold mb-3 text-slate-50">Social Media</h4>
              <p className="text-slate-400 text-sm italic mb-3">
                "Auto-post Instagram content to Twitter and LinkedIn"
              </p>
              <div className="text-xs text-emerald-400">✓ Generated in 15 seconds</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Choose the perfect plan for your automation needs. Start free, upgrade when you're ready.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Tier */}
            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 relative">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-50 mb-2">Free</h3>
                <div className="text-4xl font-bold text-slate-50 mb-2">$0</div>
                <p className="text-slate-400">Perfect for trying out WorkFlow AI</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">5 workflow generations per month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">10 voice minutes per month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">n8n platform support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Basic AI models</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Community support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">JSON export only</span>
                </li>
              </ul>

              <button 
                onClick={handleGetStarted}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200"
              >
                {user ? 'Current Plan' : 'Get Started Free'}
              </button>
            </div>

            {/* Pro Tier */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 border-2 border-indigo-500/30 rounded-2xl p-8 relative">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              </div>

              <div className="text-center mb-8 pt-4">
                <h3 className="text-2xl font-bold text-slate-50 mb-2">Pro</h3>
                <div className="text-4xl font-bold text-slate-50 mb-2">
                  $19
                  <span className="text-lg font-normal text-slate-400">/month</span>
                </div>
                <p className="text-slate-400">For individuals and small teams</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">300 workflow generations per month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">500 voice minutes per month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">All 3 platforms (n8n, Zapier, Make.com)</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Advanced AI models (Claude Sonnet)</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Premium voice features</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Email support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Advanced analytics</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">3 team members</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Visual diagrams export</span>
                </li>
              </ul>

              <button 
                onClick={handlePricingClick}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/25"
              >
                Upgrade to Pro
              </button>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 relative">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-50 mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-slate-50 mb-2">
                  $49
                  <span className="text-lg font-normal text-slate-400">/month</span>
                </div>
                <p className="text-slate-400">For organizations and power users</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Unlimited workflow generations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Unlimited voice minutes</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">All platforms + custom integrations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Premium AI models (Claude Opus)</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Custom voice options</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Priority support + phone</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">White-label branding</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Unlimited team members</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Full API access</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-300">Enterprise dashboard</span>
                </li>
              </ul>

              <button 
                onClick={handlePricingClick}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-amber-500/25"
              >
                Contact Sales
              </button>
            </div>
          </div>

          {/* Pricing FAQ */}
          <div className="mt-16 text-center">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-slate-50 mb-6">Frequently Asked Questions</h3>
              
              <div className="grid md:grid-cols-2 gap-8 text-left">
                <div>
                  <h4 className="font-semibold text-slate-50 mb-2">What happens when I hit my limits?</h4>
                  <p className="text-slate-400 text-sm">
                    You'll receive a notification when you're approaching your limits. You can upgrade anytime to continue using the service without interruption.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-50 mb-2">Can I change plans anytime?</h4>
                  <p className="text-slate-400 text-sm">
                    Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-50 mb-2">Do you offer yearly discounts?</h4>
                  <p className="text-slate-400 text-sm">
                    Yes! Save 2 months with our yearly plans. Annual subscribers get priority support and early access to new features.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-50 mb-2">What platforms do you support?</h4>
                  <p className="text-slate-400 text-sm">
                    Free users get n8n support. Pro and Enterprise users get access to n8n, Zapier, and Make.com with custom integrations available for Enterprise.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-500/10 to-amber-500/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to Automate<br />with Your Voice?</h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
            Join the future of automation. No coding required, just natural conversation with AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/25 flex items-center space-x-2"
            >
              <span>{user ? 'Go to Dashboard' : 'Get Started Free'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300">
              View Documentation
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Logo size={40} />
              <span className="text-xl font-bold text-slate-50">WorkFlow AI</span>
            </div>

            <p className="text-slate-400 mb-4">
              Democratizing automation through the power of voice and AI
            </p>

            <div className="flex items-center justify-center space-x-2 text-slate-500 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>by Rahees Ahmed for the Bolt.new Hackathon 2025</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Pricing Modal */}
      <PricingModal 
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
        userId={user?.id}
      />
    </div>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Home, 
  Database, 
  Github, 
  CreditCard, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Activity
} from 'lucide-react';
import { useMasterAuth } from '../hooks/useMasterAuth';
import { MasterPortalLogin } from '../components/MasterPortalLogin';

// Placeholder components for different sections
const MasterDashboard = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-50 mb-6">Master Portal Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-50 mb-2">Total Users</h3>
        <p className="text-3xl font-bold text-indigo-400">1,234</p>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-50 mb-2">Active Workflows</h3>
        <p className="text-3xl font-bold text-emerald-400">567</p>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-50 mb-2">Credits Used</h3>
        <p className="text-3xl font-bold text-amber-400">89,123</p>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-50 mb-2">System Health</h3>
        <p className="text-3xl font-bold text-emerald-400">99.9%</p>
      </div>
    </div>
  </div>
);

const N8nConfiguration = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-50 mb-6">N8N Configuration</h1>
    <p className="text-slate-400">Global N8N settings and configuration management.</p>
  </div>
);

const GitHubConfiguration = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-50 mb-6">GitHub Configuration</h1>
    <p className="text-slate-400">GitHub repository and webhook management.</p>
  </div>
);

const CreditManagement = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-50 mb-6">Credit Management</h1>
    <p className="text-slate-400">Manage credit packages and user credit allocations.</p>
  </div>
);

const UserManagement = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-50 mb-6">User Management</h1>
    <p className="text-slate-400">Manage user accounts and permissions.</p>
  </div>
);

const Analytics = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-50 mb-6">Analytics & Reports</h1>
    <p className="text-slate-400">System analytics and usage reports.</p>
  </div>
);

const SystemSettings = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-50 mb-6">System Settings</h1>
    <p className="text-slate-400">Global system configuration and settings.</p>
  </div>
);

const navigationItems = [
  { name: 'Dashboard', path: '/master', icon: Home, component: MasterDashboard },
  { name: 'N8N Config', path: '/master/n8n', icon: Database, component: N8nConfiguration },
  { name: 'GitHub Config', path: '/master/github', icon: Github, component: GitHubConfiguration },
  { name: 'Credit Management', path: '/master/credits', icon: CreditCard, component: CreditManagement },
  { name: 'User Management', path: '/master/users', icon: Users, component: UserManagement },
  { name: 'Analytics', path: '/master/analytics', icon: BarChart3, component: Analytics },
  { name: 'System Settings', path: '/master/settings', icon: Settings, component: SystemSettings },
];

export const MasterPortal: React.FC = () => {
  const { user, loading, signOut } = useMasterAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setShowLogin(true);
    }
  }, [loading, user]);

  const handleLoginSuccess = () => {
    setShowLogin(false);
    navigate('/master');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading Master Portal...</p>
        </div>
      </div>
    );
  }

  if (!user || showLogin) {
    return (
      <MasterPortalLogin 
        onSuccess={handleLoginSuccess}
        onCancel={() => navigate('/')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-50">Master Portal</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg mb-2 transition-all duration-200 ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user.email?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-300 truncate">{user.email}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-slate-300"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-slate-50">
              {navigationItems.find(item => item.path === location.pathname)?.name || 'Master Portal'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors">
              <Activity className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)]">
          <Routes>
            {navigationItems.map((item) => (
              <Route
                key={item.path}
                path={item.path.replace('/master', '') || '/'}
                element={<item.component />}
              />
            ))}
          </Routes>
        </main>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

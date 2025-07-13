
import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  Settings, 
  Github, 
  CreditCard, 
  Users, 
  Database, 
  BarChart3, 
  Shield, 
  ArrowLeft,
  Home,
  Workflow,
  Activity,
  FileText,
  Zap
} from 'lucide-react';
import Logo from '../components/Logo';
import { N8nConfigPage } from '../components/master/N8nConfigPage';
import { GitHubConfigPage } from '../components/master/GitHubConfigPage';
import { CreditManagementPage } from '../components/master/CreditManagementPage';
import { UserManagementPage } from '../components/master/UserManagementPage';
import { AnalyticsDashboard } from '../components/master/AnalyticsDashboard';
import { WorkflowMonitoring } from '../components/master/WorkflowMonitoring';
import { SystemSettings } from '../components/master/SystemSettings';
import { AuditLogs } from '../components/master/AuditLogs';

export const MasterPortal: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { path: '/master', icon: Home, label: 'Dashboard', component: AnalyticsDashboard },
    { path: '/master/users', icon: Users, label: 'User Management', component: UserManagementPage },
    { path: '/master/credits', icon: CreditCard, label: 'Credit Management', component: CreditManagementPage },
    { path: '/master/n8n-config', icon: Database, label: 'n8n Configuration', component: N8nConfigPage },
    { path: '/master/github-config', icon: Github, label: 'GitHub Configuration', component: GitHubConfigPage },
    { path: '/master/workflows', icon: Workflow, label: 'Workflow Monitoring', component: WorkflowMonitoring },
    { path: '/master/analytics', icon: BarChart3, label: 'Analytics', component: AnalyticsDashboard },
    { path: '/master/audit-logs', icon: FileText, label: 'Audit Logs', component: AuditLogs },
    { path: '/master/system', icon: Settings, label: 'System Settings', component: SystemSettings },
  ];

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex">
      {/* Navigation Sidebar */}
      <div className="w-64 bg-slate-800/50 border-r border-slate-700/50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3 mb-4">
            <Logo size={32} />
            <div>
              <h1 className="text-lg font-bold text-slate-50">Master Portal</h1>
              <p className="text-xs text-slate-400">Admin Control Center</p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to User Portal</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isActive && <div className="w-2 h-2 bg-white rounded-full animate-pulse ml-auto"></div>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center space-x-2 text-slate-400 text-sm">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Admin Session Active</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-slate-800/30 border-b border-slate-700/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-50">
                {navigationItems.find(item => item.path === currentPath)?.label || 'Master Portal'}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Manage your platform's infrastructure and users
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg px-3 py-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-slate-300">System Online</span>
              </div>
              
              <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg px-3 py-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-slate-300">All Services Active</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<AnalyticsDashboard />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/credits" element={<CreditManagementPage />} />
            <Route path="/n8n-config" element={<N8nConfigPage />} />
            <Route path="/github-config" element={<GitHubConfigPage />} />
            <Route path="/workflows" element={<WorkflowMonitoring />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/system" element={<SystemSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

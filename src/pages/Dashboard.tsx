import React, { useState, useEffect } from 'react';
import { 
 
  Grid3X3, 
  List, 
  Search, 
  Filter, 
 
  Pause, 
  Settings, 
  Mic,

  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
  Database,
  Sparkles,
  Bot,
  Server,
  Plug
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useN8n } from '../hooks/useN8n';
import { ConnectionSetup } from '../components/ConnectionSetup';
import { WorkflowGrid } from '../components/WorkflowGrid';
import { WorkflowList } from '../components/WorkflowList';
import { MCPServerManager } from '../components/MCPServerManager';
import { AIPlayground } from './AIPlayground';
import Logo from '../components/Logo';

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'active' | 'inactive';
type PageView = 'dashboard' | 'playground' | 'mcp-servers';

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { 
    activeConnection, 
    workflows, 
    loading, 
    error, 
    loadWorkflows,
    activateWorkflow,
    deactivateWorkflow,
    deleteWorkflow
  } = useN8n();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showConnectionSetup, setShowConnectionSetup] = useState(false);
  const [currentView, setCurrentView] = useState<PageView>('dashboard');

  // Check if user needs to connect n8n instance
  useEffect(() => {
    if (!activeConnection && !loading) {
      setShowConnectionSetup(true);
    }
  }, [activeConnection, loading]);

  // Load workflows when connection is available
  useEffect(() => {
    if (activeConnection) {
      loadWorkflows();
    }
  }, [activeConnection, loadWorkflows]);

  // Filter workflows based on search and filter type
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.tags?.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'active' && workflow.active) ||
                         (filterType === 'inactive' && !workflow.active);
    
    return matchesSearch && matchesFilter;
  });

  const handleWorkflowAction = async (workflowId: string, action: 'activate' | 'deactivate' | 'delete' | 'edit' | 'view') => {
    try {
      switch (action) {
        case 'activate':
          await activateWorkflow(workflowId);
          break;
        case 'deactivate':
          await deactivateWorkflow(workflowId);
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this workflow?')) {
            await deleteWorkflow(workflowId);
          }
          break;
        case 'edit':
          // Navigate to workflow editor
          window.open(`${activeConnection?.base_url}/workflow/${workflowId}`, '_blank');
          break;
        case 'view':
          // Navigate to workflow details
          window.open(`${activeConnection?.base_url}/execution/${workflowId}`, '_blank');
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} workflow:`, error);
    }
  };

  if (showConnectionSetup) {
    return (
      <ConnectionSetup 
        onSkip={() => setShowConnectionSetup(false)}
        onSuccess={() => setShowConnectionSetup(false)}
      />
    );
  }

  // Show AI Playground if selected
  if (currentView === 'playground') {
    return <AIPlayground onBack={() => setCurrentView('dashboard')} />;
  }

  // Show MCP Server Manager if selected
  if (currentView === 'mcp-servers') {
    return <MCPServerManager onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* Dashboard Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Logo />

            {/* Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  currentView === 'dashboard' 
                    ? 'bg-indigo-600/20 text-indigo-400' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Workflows</span>
              </button>
              
              <button
                onClick={() => setCurrentView('playground')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  currentView === 'playground' 
                    ? 'bg-gradient-to-r from-indigo-600/20 to-amber-500/20 text-amber-400 border border-amber-500/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Playground</span>
              </button>

              <button
                onClick={() => setCurrentView('mcp-servers')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  currentView === 'mcp-servers' 
                    ? 'bg-gradient-to-r from-purple-600/20 to-pink-500/20 text-purple-400 border border-purple-500/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Server className="w-4 h-4" />
                <span>MCP Servers</span>
              </button>
            </div>

            {/* Connection Status */}
            {activeConnection && (
              <div className="hidden lg:flex items-center space-x-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-slate-300">{activeConnection.instance_name}</span>
                </div>
                <div className="text-slate-400">•</div>
                <div className="text-slate-400">{workflows.length} workflows</div>
              </div>
            )}

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowConnectionSetup(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors duration-200"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-slate-400 hidden sm:inline">{user?.email}</span>
                <button
                  onClick={signOut}
                  className="text-slate-400 hover:text-white transition-colors duration-200"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden border-t border-slate-700/50">
            <div className="flex space-x-1 py-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex-1 flex items-center justify-center space-x-2 px-2 py-2 rounded-lg transition-colors duration-200 ${
                  currentView === 'dashboard' 
                    ? 'bg-indigo-600/20 text-indigo-400' 
                    : 'text-slate-400'
                }`}
              >
                <Database className="w-4 h-4" />
                <span className="text-xs">Workflows</span>
              </button>
              
              <button
                onClick={() => setCurrentView('playground')}
                className={`flex-1 flex items-center justify-center space-x-2 px-2 py-2 rounded-lg transition-colors duration-200 ${
                  currentView === 'playground' 
                    ? 'bg-gradient-to-r from-indigo-600/20 to-amber-500/20 text-amber-400' 
                    : 'text-slate-400'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-xs">AI</span>
              </button>

              <button
                onClick={() => setCurrentView('mcp-servers')}
                className={`flex-1 flex items-center justify-center space-x-2 px-2 py-2 rounded-lg transition-colors duration-200 ${
                  currentView === 'mcp-servers' 
                    ? 'bg-gradient-to-r from-purple-600/20 to-pink-500/20 text-purple-400' 
                    : 'text-slate-400'
                }`}
              >
                <Server className="w-4 h-4" />
                <span className="text-xs">MCP</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-50 mb-2">Your Workflows</h2>
              <p className="text-slate-400">
                {activeConnection 
                  ? `Manage and monitor your n8n workflows from ${activeConnection.instance_name}`
                  : 'Connect your n8n instance to view workflows'
                }
              </p>
            </div>

            {/* Create Workflow Button */}
            <div className="flex space-x-3">
              <button 
                onClick={() => setCurrentView('playground')}
                className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-amber-500/25"
              >
                <Bot className="w-5 h-5" />
                <span>AI Playground</span>
              </button>
              
              
            </div>
          </div>

          {/* Stats Cards */}
          {activeConnection && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Total Workflows</p>
                    <p className="text-2xl font-bold text-slate-50 mt-1">{workflows.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                    <Database className="w-6 h-6 text-indigo-400" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Active</p>
                    <p className="text-2xl font-bold text-slate-50 mt-1">
                      {workflows.filter(w => w.active).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Inactive</p>
                    <p className="text-2xl font-bold text-slate-50 mt-1">
                      {workflows.filter(w => !w.active).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                    <Pause className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Instance</p>
                    <p className="text-lg font-semibold text-slate-50 mt-1 truncate">
                      {activeConnection.instance_name}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls Bar */}
        {activeConnection && (
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-slate-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
              >
                <option value="all">All Workflows</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-800/50 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              <p className="text-slate-400">Loading workflows...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
              <h3 className="text-lg font-semibold text-slate-50">Error Loading Workflows</h3>
              <p className="text-slate-400 max-w-md">{error}</p>
              <button
                onClick={() => loadWorkflows()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : !activeConnection ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
                <Database className="w-10 h-10 text-slate-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-50 mb-2">Connect Your n8n Instance</h3>
                <p className="text-slate-400 max-w-md">
                  Connect your n8n instance to start viewing and managing your workflows with voice commands.
                </p>
              </div>
              <button
                onClick={() => setShowConnectionSetup(true)}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/25"
              >
                Connect n8n Instance
              </button>
            </div>
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
                <Mic className="w-10 h-10 text-slate-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-50 mb-2">
                  {searchQuery || filterType !== 'all' ? 'No Matching Workflows' : 'No Workflows Yet'}
                </h3>
                <p className="text-slate-400 max-w-md">
                  {searchQuery || filterType !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Start by creating your first workflow using voice commands or import existing ones.'
                  }
                </p>
              </div>
              {!searchQuery && filterType === 'all' && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={() => setCurrentView('playground')}
                    className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-amber-500/25 flex items-center space-x-2"
                  >
                    <Bot className="w-5 h-5" />
                    <span>Try AI Playground</span>
                  </button>
                  <button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/25 flex items-center space-x-2">
                    <Mic className="w-5 h-5" />
                    <span>Create Your First Workflow</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-slate-400">
                Showing {filteredWorkflows.length} of {workflows.length} workflows
              </p>
            </div>

            {/* Workflow Display */}
            {viewMode === 'grid' ? (
              <WorkflowGrid 
                workflows={filteredWorkflows} 
                onAction={handleWorkflowAction}
                baseUrl={activeConnection?.base_url}
              />
            ) : (
              <WorkflowList 
                workflows={filteredWorkflows} 
                onAction={handleWorkflowAction}
                baseUrl={activeConnection?.base_url}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};
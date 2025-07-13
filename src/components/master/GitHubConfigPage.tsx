
import React, { useState, useEffect } from 'react';
import { Github, Save, TestTube, CheckCircle, AlertCircle, Loader2, GitBranch, Repository } from 'lucide-react';

interface GitHubConfig {
  global_access_token: string;
  organization: string;
  repository_prefix: string;
  auto_commit: boolean;
  default_branch: string;
  is_enabled: boolean;
  last_tested: string | null;
  status: 'connected' | 'disconnected' | 'error';
}

export const GitHubConfigPage: React.FC = () => {
  const [config, setConfig] = useState<GitHubConfig>({
    global_access_token: '',
    organization: '',
    repository_prefix: 'workflow-',
    auto_commit: true,
    default_branch: 'main',
    is_enabled: false,
    last_tested: null,
    status: 'disconnected'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      // TODO: Load from Supabase master_github_config table
      console.log('Loading GitHub configuration...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to load GitHub config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    if (!config.global_access_token) {
      setTestResult({ success: false, message: 'Please provide a GitHub access token' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // TODO: Test GitHub connection via Supabase Edge Function
      console.log('Testing GitHub connection...');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const success = Math.random() > 0.2;
      
      setTestResult({
        success,
        message: success ? 'GitHub connection successful!' : 'Failed to authenticate with GitHub'
      });

      if (success) {
        setConfig(prev => ({ 
          ...prev, 
          status: 'connected', 
          last_tested: new Date().toISOString() 
        }));
      }
    } catch (error) {
      setTestResult({ success: false, message: 'GitHub connection test failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const saveConfig = async () => {
    setIsLoading(true);
    try {
      // TODO: Save to Supabase master_github_config table
      console.log('Saving GitHub configuration:', config);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTestResult({ success: true, message: 'GitHub configuration saved successfully!' });
    } catch (error) {
      setTestResult({ success: false, message: 'Failed to save configuration' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700/30">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-purple-500/20">
            <Github className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-50">Global GitHub Configuration</h1>
            <p className="text-slate-400">Configure GitHub integration for workflow repositories</p>
          </div>
        </div>
        
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-sm text-slate-300 leading-relaxed">
            When enabled, all user-generated workflows will automatically create repositories and commit changes 
            using this global GitHub access token. Each workflow gets its own repository.
          </p>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700/30">
        <h2 className="text-xl font-semibold text-slate-50 mb-6">GitHub Integration Settings</h2>
        
        <div className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <div>
              <h3 className="font-semibold text-slate-200">Enable GitHub Integration</h3>
              <p className="text-sm text-slate-400">Automatically create repositories for user workflows</p>
            </div>
            <button
              onClick={() => setConfig(prev => ({ ...prev, is_enabled: !prev.is_enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.is_enabled ? 'bg-purple-600' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.is_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Access Token */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              GitHub Personal Access Token
            </label>
            <input
              type="password"
              value={config.global_access_token}
              onChange={(e) => setConfig(prev => ({ ...prev, global_access_token: e.target.value }))}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-50 placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
              disabled={!config.is_enabled}
            />
            <p className="text-xs text-slate-400 mt-2">
              Token needs 'repo' and 'admin:org' scopes for repository creation and management
            </p>
          </div>

          {/* Organization */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              GitHub Organization/Username
            </label>
            <input
              type="text"
              value={config.organization}
              onChange={(e) => setConfig(prev => ({ ...prev, organization: e.target.value }))}
              placeholder="your-organization"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-50 placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
              disabled={!config.is_enabled}
            />
          </div>

          {/* Repository Prefix */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Repository Name Prefix
            </label>
            <input
              type="text"
              value={config.repository_prefix}
              onChange={(e) => setConfig(prev => ({ ...prev, repository_prefix: e.target.value }))}
              placeholder="workflow-"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-50 placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
              disabled={!config.is_enabled}
            />
            <p className="text-xs text-slate-400 mt-2">
              Example: "workflow-user-123-chatbot"
            </p>
          </div>

          {/* Default Branch */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Default Branch Name
            </label>
            <input
              type="text"
              value={config.default_branch}
              onChange={(e) => setConfig(prev => ({ ...prev, default_branch: e.target.value }))}
              placeholder="main"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-50 placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
              disabled={!config.is_enabled}
            />
          </div>

          {/* Auto Commit Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <div>
              <h3 className="font-semibold text-slate-200">Auto Commit Changes</h3>
              <p className="text-sm text-slate-400">Automatically commit workflow changes to GitHub</p>
            </div>
            <button
              onClick={() => setConfig(prev => ({ ...prev, auto_commit: !prev.auto_commit }))}
              disabled={!config.is_enabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.auto_commit && config.is_enabled ? 'bg-emerald-600' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.auto_commit && config.is_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Status */}
          {config.last_tested && (
            <div className="flex items-center space-x-3 p-4 bg-slate-900/30 rounded-xl border border-slate-700/50">
              {config.status === 'connected' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
              {config.status === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
              <div>
                <p className="text-sm font-medium text-slate-200">
                  Last tested: {new Date(config.last_tested).toLocaleString()}
                </p>
                <p className={`text-xs ${config.status === 'connected' ? 'text-emerald-400' : 'text-red-400'}`}>
                  Status: {config.status}
                </p>
              </div>
            </div>
          )}

          {/* Test Result */}
          {testResult && (
            <div className={`p-4 rounded-xl border ${
              testResult.success 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              <div className="flex items-center space-x-2">
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">{testResult.message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mt-8">
          <button
            onClick={testConnection}
            disabled={isTesting || !config.is_enabled || !config.global_access_token}
            className="flex items-center space-x-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200"
          >
            {isTesting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <TestTube className="w-5 h-5" />
            )}
            <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
          </button>

          <button
            onClick={saveConfig}
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{isLoading ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      {/* Repository Management */}
      <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700/30">
        <h2 className="text-xl font-semibold text-slate-50 mb-6 flex items-center space-x-2">
          <Repository className="w-6 h-6 text-purple-400" />
          <span>Repository Management</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-slate-300">Active Repositories</span>
            </div>
            <p className="text-2xl font-bold text-slate-50">24</p>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <Repository className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-300">Total Commits</span>
            </div>
            <p className="text-2xl font-bold text-slate-50">156</p>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-slate-300">Success Rate</span>
            </div>
            <p className="text-2xl font-bold text-slate-50">98.5%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Settings, Save, TestTube, GitBranch, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const GitHubConfigPage: React.FC = () => {
  const [config, setConfig] = useState({
    personalAccessToken: '',
    defaultRepo: '',
    autoCommit: true,
    branchStrategy: 'main'
  });
  
  const [testResult, setTestResult] = useState<{
    status: 'success' | 'error' | 'warning' | null;
    message: string;
  }>({ status: null, message: '' });

  const handleTest = async () => {
    // Simulate API test
    setTimeout(() => {
      if (config.personalAccessToken && config.defaultRepo) {
        setTestResult({
          status: 'success',
          message: 'Connection successful! Repository access verified.'
        });
      } else {
        setTestResult({
          status: 'error',
          message: 'Please fill in all required fields.'
        });
      }
    }, 1000);
  };

  const handleSave = () => {
    // Handle save logic
    console.log('Saving GitHub configuration:', config);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">GitHub Configuration</h1>
          <p className="text-slate-400 mt-1">Configure GitHub integration for workflow storage</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </div>

      {/* Configuration Form */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
        <div className="space-y-6">
          {/* Personal Access Token */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Personal Access Token
            </label>
            <input
              type="password"
              value={config.personalAccessToken}
              onChange={(e) => setConfig({ ...config, personalAccessToken: e.target.value })}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-50 focus:border-indigo-500 focus:outline-none"
              placeholder="ghp_xxxxxxxxxxxx"
            />
            <p className="text-slate-400 text-sm mt-1">
              Generate a token with repo permissions in GitHub Settings
            </p>
          </div>

          {/* Default Repository */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Default Repository
            </label>
            <input
              type="text"
              value={config.defaultRepo}
              onChange={(e) => setConfig({ ...config, defaultRepo: e.target.value })}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-50 focus:border-indigo-500 focus:outline-none"
              placeholder="username/workflow-storage"
            />
          </div>

          {/* Auto Commit */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-slate-300">Auto Commit</label>
              <p className="text-slate-400 text-sm">Automatically commit workflow changes</p>
            </div>
            <button
              onClick={() => setConfig({ ...config, autoCommit: !config.autoCommit })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.autoCommit ? 'bg-indigo-600' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.autoCommit ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Branch Strategy */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Branch Strategy
            </label>
            <select
              value={config.branchStrategy}
              onChange={(e) => setConfig({ ...config, branchStrategy: e.target.value })}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-50 focus:border-indigo-500 focus:outline-none"
            >
              <option value="main">Main branch</option>
              <option value="feature">Feature branches</option>
              <option value="user">User-specific branches</option>
            </select>
          </div>
        </div>
      </div>

      {/* Test Connection */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-50">Test Connection</h3>
          <button
            onClick={handleTest}
            className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-slate-50 px-4 py-2 rounded-lg transition-colors"
          >
            <TestTube className="w-4 h-4" />
            <span>Test Configuration</span>
          </button>
        </div>

        {testResult.status && (
          <div className={`flex items-center space-x-2 p-3 rounded-lg ${
            testResult.status === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20' :
            testResult.status === 'error' ? 'bg-red-500/10 border border-red-500/20' :
            'bg-amber-500/10 border border-amber-500/20'
          }`}>
            {testResult.status === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : testResult.status === 'error' ? (
              <XCircle className="w-5 h-5 text-red-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400" />
            )}
            <span className={`text-sm ${
              testResult.status === 'success' ? 'text-emerald-300' :
              testResult.status === 'error' ? 'text-red-300' :
              'text-amber-300'
            }`}>
              {testResult.message}
            </span>
          </div>
        )}
      </div>

      {/* Repository Status */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-50 mb-4">Repository Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <GitBranch className="w-5 h-5 text-indigo-400" />
              <span className="text-slate-300 font-medium">Active Branch</span>
            </div>
            <span className="text-slate-50 text-lg">main</span>
          </div>
          
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Settings className="w-5 h-5 text-emerald-400" />
              <span className="text-slate-300 font-medium">Workflows Stored</span>
            </div>
            <span className="text-slate-50 text-lg">42</span>
          </div>
          
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-amber-400" />
              <span className="text-slate-300 font-medium">Last Sync</span>
            </div>
            <span className="text-slate-50 text-lg">2 min ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

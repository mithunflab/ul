
import React, { useState, useEffect } from 'react';
import { Database, Save, TestTube, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface N8nConfig {
  global_url: string;
  global_api_key: string;
  is_enabled: boolean;
  last_tested: string | null;
  status: 'connected' | 'disconnected' | 'error';
}

export const N8nConfigPage: React.FC = () => {
  const [config, setConfig] = useState<N8nConfig>({
    global_url: '',
    global_api_key: '',
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
      // TODO: Load from Supabase master_n8n_config table
      console.log('Loading n8n configuration...');
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to load n8n config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    if (!config.global_url || !config.global_api_key) {
      setTestResult({ success: false, message: 'Please provide both URL and API key' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // TODO: Test n8n connection via Supabase Edge Function
      console.log('Testing n8n connection:', { url: config.global_url });
      
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const success = Math.random() > 0.3; // Simulate test result
      
      setTestResult({
        success,
        message: success ? 'Connection successful!' : 'Failed to connect to n8n instance'
      });

      if (success) {
        setConfig(prev => ({ 
          ...prev, 
          status: 'connected', 
          last_tested: new Date().toISOString() 
        }));
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Connection test failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const saveConfig = async () => {
    setIsLoading(true);
    try {
      // TODO: Save to Supabase master_n8n_config table
      console.log('Saving n8n configuration:', config);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTestResult({ success: true, message: 'Configuration saved successfully!' });
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
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/20">
            <Database className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-50">Global n8n Configuration</h1>
            <p className="text-slate-400">Configure the global n8n instance for all users</p>
          </div>
        </div>
        
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-sm text-slate-300 leading-relaxed">
            When global n8n configuration is enabled, all user workflows will be deployed to this instance. 
            If disabled, users will use their own n8n credentials from the user portal.
          </p>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700/30">
        <h2 className="text-xl font-semibold text-slate-50 mb-6">Instance Configuration</h2>
        
        <div className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <div>
              <h3 className="font-semibold text-slate-200">Enable Global n8n Instance</h3>
              <p className="text-sm text-slate-400">Use this global instance for all user workflows</p>
            </div>
            <button
              onClick={() => setConfig(prev => ({ ...prev, is_enabled: !prev.is_enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.is_enabled ? 'bg-indigo-600' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.is_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* n8n URL */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              n8n Instance URL
            </label>
            <input
              type="url"
              value={config.global_url}
              onChange={(e) => setConfig(prev => ({ ...prev, global_url: e.target.value }))}
              placeholder="https://your-n8n-instance.com"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
              disabled={!config.is_enabled}
            />
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={config.global_api_key}
              onChange={(e) => setConfig(prev => ({ ...prev, global_api_key: e.target.value }))}
              placeholder="Enter your n8n API key"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-50 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
              disabled={!config.is_enabled}
            />
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
            disabled={isTesting || !config.is_enabled || !config.global_url || !config.global_api_key}
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
            className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200"
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
    </div>
  );
};

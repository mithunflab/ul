import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  Database, 
  Mail, 
  Shield,
  AlertTriangle
} from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    // System Settings
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'info',
    maxConcurrentWorkflows: 100,
    
    // Email Settings
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    
    // Security Settings
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    requireEmailVerification: true,
    enableTwoFactor: false,
    
    // Notification Settings
    slackWebhook: '',
    discordWebhook: '',
    enableAlerts: true,
    alertThresholds: {
      errorRate: 5,
      responseTime: 5000,
      failedLogins: 10
    }
  });

  const handleSave = async () => {
    try {
      // TODO: Save settings to Supabase
      console.log('Saving system settings:', settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700/30">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-xl flex items-center justify-center border border-slate-500/20">
            <Settings className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-50">System Settings</h1>
            <p className="text-slate-400">Configure global system parameters and integrations</p>
          </div>
        </div>
        
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
          <div>
            <p className="text-amber-400 font-medium">Warning</p>
            <p className="text-amber-300/80 text-sm">
              Changes to these settings will affect all users. Please review carefully before saving.
            </p>
          </div>
        </div>
      </div>

      {/* System Configuration */}
      <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700/30">
        <div className="flex items-center space-x-3 mb-6">
          <Database className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-semibold text-slate-50">System Configuration</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
              <div>
                <h3 className="font-semibold text-slate-200">Maintenance Mode</h3>
                <p className="text-sm text-slate-400">Temporarily disable user access</p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.maintenanceMode ? 'bg-amber-600' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
              <div>
                <h3 className="font-semibold text-slate-200">Debug Mode</h3>
                <p className="text-sm text-slate-400">Enable detailed logging</p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, debugMode: !prev.debugMode }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.debugMode ? 'bg-emerald-600' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.debugMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Log Level
              </label>
              <select
                value={settings.logLevel}
                onChange={(e) => setSettings(prev => ({ ...prev, logLevel: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
              >
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Max Concurrent Workflows
              </label>
              <input
                type="number"
                value={settings.maxConcurrentWorkflows}
                onChange={(e) => setSettings(prev => ({ ...prev, maxConcurrentWorkflows: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700/30">
        <div className="flex items-center space-x-3 mb-6">
          <Mail className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-slate-50">Email Configuration</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              SMTP Host
            </label>
            <input
              type="text"
              value={settings.smtpHost}
              onChange={(e) => setSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
              placeholder="smtp.gmail.com"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-50 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              SMTP Port
            </label>
            <input
              type="number"
              value={settings.smtpPort}
              onChange={(e) => setSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) || 587 }))}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              SMTP Username
            </label>
            <input
              type="text"
              value={settings.smtpUser}
              onChange={(e) => setSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              From Email Address
            </label>
            <input
              type="email"
              value={settings.fromEmail}
              onChange={(e) => setSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
              placeholder="noreply@yourapp.com"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-50 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700/30">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-emerald-400" />
          <h2 className="text-xl font-semibold text-slate-50">Security Settings</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Session Timeout (hours)
            </label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) || 24 }))}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Max Login Attempts
            </label>
            <input
              type="number"
              value={settings.maxLoginAttempts}
              onChange={(e) => setSettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) || 5 }))}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <div>
              <h3 className="font-semibold text-slate-200">Require Email Verification</h3>
              <p className="text-sm text-slate-400">Users must verify email before access</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, requireEmailVerification: !prev.requireEmailVerification }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.requireEmailVerification ? 'bg-emerald-600' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.requireEmailVerification ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <div>
              <h3 className="font-semibold text-slate-200">Enable Two-Factor Auth</h3>
              <p className="text-sm text-slate-400">Require 2FA for all users</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, enableTwoFactor: !prev.enableTwoFactor }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enableTwoFactor ? 'bg-emerald-600' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enableTwoFactor ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-white font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/25"
        >
          <Save className="w-5 h-5" />
          <span>Save All Settings</span>
        </button>
      </div>
    </div>
  );
};

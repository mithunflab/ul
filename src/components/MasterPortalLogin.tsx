
import React, { useState } from 'react';
import { Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { useMasterAuth } from '../hooks/useMasterAuth';
import Logo from './Logo';

interface MasterPortalLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const MasterPortalLogin: React.FC<MasterPortalLoginProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, loading, error } = useMasterAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    const result = await signIn(email, password);
    if (result.success) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <Logo size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-50 mb-2">Master Portal Access</h2>
          <p className="text-slate-400">Administrator authentication required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Admin Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-slate-50 placeholder-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
              placeholder="admin@company.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-slate-50 placeholder-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200 pr-12"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold rounded-xl transition-all duration-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Access Portal</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-700">
          <p className="text-xs text-slate-500 text-center">
            Authorized personnel only. All access is monitored and logged.
          </p>
        </div>
      </div>
    </div>
  );
};

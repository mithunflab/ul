import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Mail, Lock, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import Logo from './Logo';
import { authHelpers } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setErrors({});
      setSuccessMessage('');
      setShowPassword(false);
    }
  }, [isOpen, mode]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (mode === 'signup') {
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /\d/.test(password);
      
      if (!hasUppercase || !hasLowercase || !hasNumber) {
        newErrors.password = 'Password must contain uppercase, lowercase, and number';
      }
    }

    // Confirm password validation (signup only)
    if (mode === 'signup') {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      if (mode === 'login') {
        const { data, error } = await authHelpers.signIn(email, password);
        
        if (error) {
          setErrors({ general: error.message });
        } else if (data.user) {
          setSuccessMessage('Successfully signed in! Redirecting...');
          setTimeout(() => {
            onClose();
            // Redirect to dashboard or refresh page
            window.location.href = '/dashboard';
          }, 1500);
        }
      } else {
        const { data, error } = await authHelpers.signUp(email, password);
        
        if (error) {
          setErrors({ general: error.message });
        } else {
          setSuccessMessage('Account created! Please check your email to verify your account.');
        }
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-4 duration-300 sm:slide-in-from-bottom-0 sm:zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <Logo size={32} />
            <div>
              <h2 className="text-xl font-bold text-slate-50">
                {mode === 'login' ? 'Welcome Back' : 'Join WorkFlow AI'}
              </h2>
              <p className="text-sm text-slate-400">
                {mode === 'login' 
                  ? 'Sign in to start building workflows' 
                  : 'Create your account to get started'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300 transition-colors duration-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Success Message */}
          {successMessage && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <p className="text-emerald-400 font-medium text-sm">{successMessage}</p>
              </div>
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-400 font-medium text-sm">{errors.general}</p>
              </div>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                    errors.email ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                    errors.password ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field (Signup only) */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="Confirm your password"
                    disabled={loading}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Mode Toggle */}
          <div className="text-center">
            <button
              onClick={toggleMode}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-200"
            >
              {mode === 'login' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>

          {/* Terms & Privacy (Signup only) */}
          {mode === 'signup' && (
            <p className="text-xs text-slate-400 text-center">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200">
                Privacy Policy
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
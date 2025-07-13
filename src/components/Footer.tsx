
import React, { useState } from 'react';
import { Heart, Shield, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const [showMasterAccess, setShowMasterAccess] = useState(false);

  const handleMasterPortalAccess = () => {
    navigate('/master');
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Logo size={32} />
              <span className="text-xl font-bold text-slate-50">WorkFlow AI</span>
            </div>
            <p className="text-slate-400 mb-6 max-w-md">
              Empowering automation through intelligent voice interfaces and AI-driven workflow generation. Transform your productivity with cutting-edge technology.
            </p>
            <div className="flex items-center space-x-2 text-slate-500 text-sm">
              <span>Crafted with</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span>for the future of automation</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-slate-50 font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-slate-400 hover:text-slate-300 transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-slate-400 hover:text-slate-300 transition-colors">Pricing</a></li>
              <li><a href="#use-cases" className="text-slate-400 hover:text-slate-300 transition-colors">Use Cases</a></li>
              <li><a href="#tech-stack" className="text-slate-400 hover:text-slate-300 transition-colors">Technology</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-slate-50 font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-400 hover:text-slate-300 transition-colors">Documentation</a></li>
              <li><a href="#" className="text-slate-400 hover:text-slate-300 transition-colors">API Reference</a></li>
              <li><a href="#" className="text-slate-400 hover:text-slate-300 transition-colors">Support</a></li>
              <li><a href="#" className="text-slate-400 hover:text-slate-300 transition-colors">Community</a></li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Start Free Trial Button */}
            <button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:scale-105">
              Start Free Trial
            </button>

            {/* Master Portal Access Button */}
            <button
              onClick={handleMasterPortalAccess}
              className="group flex items-center space-x-3 px-6 py-3 bg-slate-800/50 hover:bg-red-600/20 border border-slate-700 hover:border-red-500/50 text-slate-400 hover:text-red-400 rounded-xl transition-all duration-300"
            >
              <Shield className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium">Master Portal</span>
              <ExternalLink className="w-4 h-4 opacity-60" />
            </button>
          </div>
          
          <p className="text-slate-500 text-sm text-center mt-6">
            Enterprise automation platform trusted by teams worldwide
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-6 text-slate-500 text-sm">
            <span>© 2025 WorkFlow AI. All rights reserved.</span>
          </div>
          
          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <a href="#" className="text-slate-500 hover:text-slate-400 text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-500 hover:text-slate-400 text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-slate-500 hover:text-slate-400 text-sm transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

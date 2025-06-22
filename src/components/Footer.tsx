import React from 'react';
import Logo from './Logo';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-700/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6">
          {/* Logo and Brand */}
          <div className="flex items-center justify-center space-x-3">
            <Logo size={40} />
            <span className="text-2xl font-bold text-slate-50">WorkFlow AI</span>
          </div>
          
          {/* Tagline */}
          <p className="text-slate-400 max-w-2xl mx-auto">
            Democratizing automation through the power of voice and AI
          </p>
          
          {/* Creator Credit */}
          <div className="flex items-center justify-center space-x-2 text-slate-400">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span>by</span>
            <span className="text-indigo-400 font-medium">Rahees Ahmed</span>
            <span>for the</span>
            <span className="text-amber-400 font-medium">Bolt.new Hackathon 2025</span>
          </div>
          
          {/* Links */}
          <div className="flex items-center justify-center space-x-8 text-sm">
            <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
              Terms of Service
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
              Support
            </a>
          </div>
          
          {/* Copyright */}
          <div className="pt-6 border-t border-slate-700/50">
            <p className="text-slate-500 text-sm">
              © 2025 WorkFlow AI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
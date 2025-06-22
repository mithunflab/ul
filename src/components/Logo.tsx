import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 48, className = '' }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background square with rounded corners */}
      <rect x="0" y="0" width="48" height="48" rx="10" ry="10" fill="url(#backgroundGradient)" />
      
      {/* Main geometric W shape for WorkFlow */}
      <path 
        d="M 12 14 L 16 30 L 20 20 L 24 30 L 28 20 L 32 30 L 36 14" 
        stroke="white" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none" 
      />
      
      {/* AI dot - perfectly positioned */}
      <circle cx="24" cy="34" r="2" fill="#F59E0B" />
      
      {/* Background gradient */}
      <defs>
        <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#4f46e5', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Logo;
import React from 'react';

const Logo = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    {/* Stylized QR-code like Logo for "Parys" */}
    {/* Top Left Eye */}
    <rect x="10" y="10" width="25" height="25" rx="4" stroke="currentColor" strokeWidth="6" fill="none" />
    <rect x="17" y="17" width="11" height="11" rx="2" fill="currentColor" />
    
    {/* Bottom Left Eye */}
    <rect x="10" y="65" width="25" height="25" rx="4" stroke="currentColor" strokeWidth="6" fill="none" />
    <rect x="17" y="72" width="11" height="11" rx="2" fill="currentColor" />
    
    {/* Right side forming a "P" out of QR dots/modules */}
    <rect x="45" y="10" width="30" height="8" rx="4" fill="currentColor" />
    <rect x="45" y="27" width="40" height="8" rx="4" fill="currentColor" />
    <rect x="77" y="44" width="8" height="25" rx="4" fill="currentColor" />
    <rect x="45" y="61" width="40" height="8" rx="4" fill="currentColor" />
    
    <rect x="45" y="44" width="8" height="46" rx="4" fill="currentColor" />
    <circle cx="64" cy="50" r="4" fill="currentColor" />
    <circle cx="64" cy="80" r="4" fill="currentColor" />
    <circle cx="81" cy="80" r="4" fill="currentColor" />
  </svg>
);

export default Logo;

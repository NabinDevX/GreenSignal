import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="8" fill="#19381F" />
      <path
        d="M27 13C29.5 15.5 31 18.5 31 22"
        stroke="#7D9D85"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 3"
      />
      <path
        d="M24 16C25.5 17.5 26.5 19.5 26.5 22"
        stroke="#A3C2AA"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M13 28C13 28 14 20 22 14C22 14 24 22 17 26C14 27.5 13 28 13 28Z"
        fill="#FBFBF9"
      />
      <path
        d="M14 27C17 23 20 18 22 14"
        stroke="#19381F"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

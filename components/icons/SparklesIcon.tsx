
import React from 'react';

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 3L9.25 8.75L3.5 11.5L9.25 14.25L12 20L14.75 14.25L20.5 11.5L14.75 8.75L12 3Z" />
    <path d="M5 3L6.05 5.95L9 7L6.05 8.05L5 11L3.95 8.05L1 7L3.95 5.95L5 3Z" />
    <path d="M19 13L17.95 15.95L15 17L17.95 18.05L19 21L20.05 18.05L23 17L20.05 15.95L19 13Z" />
  </svg>
);

export default SparklesIcon;

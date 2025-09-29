
import React from 'react';
import SparklesIcon from './icons/SparklesIcon';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-7 w-7 text-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-800" style={{fontFamily: "'Poppins', sans-serif"}}>
              AI Social Ads Composer
            </h1>
          </div>
          <p className="hidden md:block text-sm text-slate-500">Auto & Home Insurance Edition</p>
        </div>
      </div>
    </header>
  );
};

export default Header;

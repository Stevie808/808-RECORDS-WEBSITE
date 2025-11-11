import React from 'react';

const PerformanceMonitor = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        <div className="text-white/60 text-sm font-medium animate-pulse">Loading...</div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;

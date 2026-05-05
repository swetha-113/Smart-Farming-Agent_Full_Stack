import React from 'react';

export default function LoadingSpinner({ size = 'md', text = 'Analyzing...' }) {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className={`${sizes[size]} border-3 border-purple-500/20 border-t-purple-500 rounded-full animate-spin`}
           style={{ borderWidth: '3px' }} />
      {text && <p className="text-gray-400 text-sm animate-pulse">{text}</p>}
    </div>
  );
}

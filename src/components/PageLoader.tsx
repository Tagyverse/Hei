'use client';

import { useEffect, useState } from 'react';

interface PageLoaderProps {
  isVisible: boolean;
  progress?: number;
  message?: string;
}

export default function PageLoader({ isVisible, progress = 0, message = 'Loading...' }: PageLoaderProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  // Smooth progress animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayProgress(prev => {
        const target = Math.min(progress, 99);
        if (prev < target) {
          return Math.min(prev + (target - prev) * 0.1, target);
        }
        return prev;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [progress]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <div className="space-y-8 w-full max-w-md px-8">
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src="/logo.png"
            alt="Pixie Blooms"
            className="w-20 h-20 object-contain"
          />
        </div>

        {/* Message */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600 font-medium">{message}</p>
        </div>

        {/* Google-style animated dots loader */}
        <div className="flex justify-center gap-2">
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '1.4s' }}></div>
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1.4s' }}></div>
          <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1.4s' }}></div>
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.6s', animationDuration: '1.4s' }}></div>
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '1.4s' }}></div>
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '1.4s' }}></div>
        </div>

        {/* Progress bar */}
        <div className="w-full space-y-3">
          <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${Math.round(displayProgress)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 text-center">{Math.round(displayProgress)}%</p>
        </div>
      </div>
    </div>
  );
}

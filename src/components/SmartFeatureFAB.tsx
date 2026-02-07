import React, { useState, useEffect } from 'react';
import { Shirt, Palette } from 'lucide-react';

interface SmartFeatureFABProps {
  onTryOnClick: () => void;
  onColorMatchClick: () => void;
}

export default function SmartFeatureFAB({ onTryOnClick, onColorMatchClick }: SmartFeatureFABProps) {
  const [showFeatures, setShowFeatures] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipText, setTooltipText] = useState('');

  useEffect(() => {
    const tooltips = ['Try On!', 'Match with Dress'];
    let currentIndex = 0;

    const autoShowInterval = setInterval(() => {
      setTooltipText(tooltips[currentIndex]);
      setShowTooltip(true);

      setTimeout(() => {
        setShowTooltip(false);
      }, 3000);

      currentIndex = (currentIndex + 1) % tooltips.length;
    }, 8000);

    return () => clearInterval(autoShowInterval);
  }, []);

  return (
    <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-3">
      {showFeatures && (
        <>
          <div className="flex items-center gap-3">
            <div className="bg-pink-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold whitespace-nowrap">
              Match with Dress
            </div>
            <button
              onClick={() => {
                onColorMatchClick();
                setShowFeatures(false);
              }}
              className="w-12 h-12 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center active:scale-95"
              aria-label="Color Match"
              title="Match with Dress"
            >
              <Palette className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold whitespace-nowrap">
              Virtual Try On
            </div>
            <button
              onClick={() => {
                onTryOnClick();
                setShowFeatures(false);
              }}
              className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center active:scale-95"
              aria-label="Virtual Try On"
              title="Virtual Try On"
            >
              <Shirt className="w-5 h-5" />
            </button>
          </div>
        </>
      )}

      <div className="flex items-center gap-3">
        {showTooltip && !showFeatures && (
          <div className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-300">
            {tooltipText}
          </div>
        )}

        <button
          onClick={() => setShowFeatures(!showFeatures)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="w-14 h-14 bg-white hover:bg-gray-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center active:scale-95 border-2 border-gray-200"
          aria-label="Smart Features"
        >
          <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
        </button>
      </div>
    </div>
  );
}

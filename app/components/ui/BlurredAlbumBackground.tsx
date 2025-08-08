'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface BlurredAlbumBackgroundProps {
  className?: string;
  albumCoverUrl?: string;
  blurAmount?: number;
  transitionDuration?: number;
  animate?: boolean;
}

const BlurredAlbumBackground = ({ 
  className, 
  albumCoverUrl,
  blurAmount = 24,
  transitionDuration = 0.8,
  animate = true
}: BlurredAlbumBackgroundProps) => {
  const [currentUrl, setCurrentUrl] = useState(albumCoverUrl);

  // Handle URL changes with smooth transition
  useEffect(() => {
    if (albumCoverUrl !== currentUrl) {
      setCurrentUrl(albumCoverUrl);
    }
  }, [albumCoverUrl, currentUrl]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className || ''}`}>
      {/* SVG Filter Definition for Noise */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="album-noise-filter">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.9" 
              numOctaves="4" 
              seed="15"
            />
            <feColorMatrix type="saturate" values="0"/>
            <feComponentTransfer>
              <feFuncA type="discrete" tableValues="0 .5 .5 .5 .5 .5 .5 .5 .5 .5 .5 .5 .5 .5 .5 .5 1"/>
            </feComponentTransfer>
            <feGaussianBlur stdDeviation="0.5"/>
            <feComposite operator="over"/>
          </filter>
        </defs>
      </svg>

      {/* Fallback dark background */}
      <div className="absolute inset-0 bg-black" />
      
      {/* Album cover as background with blur - simplified animation */}
      <AnimatePresence mode="wait">
        {currentUrl && (
          <motion.div
            key={currentUrl}
            className="absolute inset-0 w-full h-full"
            style={{
              filter: `blur(${blurAmount}px)`,
              willChange: 'opacity',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: transitionDuration,
              ease: "easeInOut"
            }}
          >
            <img
              src={currentUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                transform: 'scale(1.2)',
                willChange: 'transform',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Noise overlay to prevent banding */}
      <div 
        className="absolute inset-0 opacity-[0.025] mix-blend-screen pointer-events-none"
        style={{
          filter: 'url(#album-noise-filter)',
          transform: 'scale(1.5)',
          willChange: 'auto',
        }}
      />
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
    </div>
  );
};

export default BlurredAlbumBackground;
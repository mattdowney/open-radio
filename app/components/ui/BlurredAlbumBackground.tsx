'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface BlurredAlbumBackgroundProps {
  className?: string;
  albumCoverUrl?: string;
  blurAmount?: number;
  transitionDuration?: number;
  animate?: boolean;
  isTrackReady?: boolean;
  shouldFadeToBlack?: boolean;
}

const BlurredAlbumBackground = ({ 
  className, 
  albumCoverUrl,
  blurAmount = 24,
  transitionDuration = 0.8,
  animate = true,
  isTrackReady = true,
  shouldFadeToBlack = false
}: BlurredAlbumBackgroundProps) => {
  const [displayUrl, setDisplayUrl] = useState(albumCoverUrl);
  const [showBlack, setShowBlack] = useState(false);

  // Immediately fade to black when shouldFadeToBlack is true
  useEffect(() => {
    if (shouldFadeToBlack) {
      setShowBlack(true);
      setDisplayUrl(undefined);
    }
  }, [shouldFadeToBlack]);

  // Show new artwork when track is ready and we're not in fade-to-black mode
  useEffect(() => {
    if (!shouldFadeToBlack && isTrackReady && albumCoverUrl) {
      setShowBlack(false);
      setDisplayUrl(albumCoverUrl);
    }
  }, [shouldFadeToBlack, isTrackReady, albumCoverUrl]);

  // Initialize display URL when first mounting
  useEffect(() => {
    if (!displayUrl && !showBlack && albumCoverUrl && isTrackReady) {
      setDisplayUrl(albumCoverUrl);
    }
  }, [albumCoverUrl, displayUrl, showBlack, isTrackReady]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className || ''}`}>
      {/* Custom keyframe animation for scale + rotate */}
      <style jsx>{`
        @keyframes scaleAndSpin {
          from {
            transform: scale(2) rotate(0deg);
          }
          to {
            transform: scale(2) rotate(360deg);
          }
        }
      `}</style>
      
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
        {showBlack ? (
          <motion.div
            key="black"
            className="absolute inset-0 w-full h-full bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.3,
              ease: "easeInOut"
            }}
          />
        ) : displayUrl ? (
          <motion.div
            key={displayUrl}
            className="absolute inset-0 w-full h-full"
            style={{
              filter: `blur(${blurAmount}px) brightness(1.4) saturate(1.3)`,
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
              src={displayUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                animation: 'scaleAndSpin 60s linear infinite',
                willChange: 'transform',
              }}
            />
          </motion.div>
        ) : null}
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
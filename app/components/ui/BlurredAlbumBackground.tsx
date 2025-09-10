'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { usePageVisibility } from '../../hooks/usePageVisibility';

interface BlurredAlbumBackgroundProps {
  className?: string;
  albumCoverUrl?: string;
  blurAmount?: number;
  transitionDuration?: number;
  isTrackReady?: boolean;
  shouldFadeToBlack?: boolean;
}

const BlurredAlbumBackground = ({
  className,
  albumCoverUrl,
  blurAmount = 24,
  transitionDuration = 0.8,
  isTrackReady = true,
  shouldFadeToBlack = false,
}: BlurredAlbumBackgroundProps) => {
  const [displayUrl, setDisplayUrl] = useState(albumCoverUrl);
  const [showBlack, setShowBlack] = useState(false);
  const _isPageVisible = usePageVisibility();

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
              ease: 'easeInOut',
            }}
          />
        ) : displayUrl ? (
          <motion.div
            key={displayUrl}
            className="absolute inset-0 w-full h-full"
            style={{
              filter: `blur(${blurAmount}px) brightness(1.1) saturate(1.5)`,
              willChange: 'opacity',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: transitionDuration,
              ease: 'easeInOut',
            }}
          >
            <img
              src={displayUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                transform: 'scale(3) translate3d(0,0,0)',
                willChange: 'auto',
              }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
    </div>
  );
};

export default BlurredAlbumBackground;

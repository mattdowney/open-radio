'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { state } = useTheme();

  // Generate theme-specific filter based on current or preview theme
  const getThemeFilter = (themeId: string, baseBlur: number) => {
    const filters = {
      dark: `blur(${baseBlur}px) brightness(0.8) contrast(1.2) saturate(1.1)`,
      light: `blur(${baseBlur}px) brightness(1.2) contrast(0.9) saturate(0.9) sepia(0.1)`,
      sunset: `blur(${baseBlur}px) brightness(1.0) contrast(1.2) saturate(0) grayscale(1)`, // Desaturate for sunset
      ocean: `blur(${baseBlur}px) brightness(0.85) contrast(1.2) saturate(1.4) hue-rotate(-25deg) sepia(0.2)`,
      vaporwave: `blur(${baseBlur}px) brightness(1.1) contrast(1.4) saturate(1.8) hue-rotate(280deg) sepia(0.3)`,
    };
    return (
      filters[themeId as keyof typeof filters] ||
      `blur(${baseBlur}px) brightness(1.1) saturate(1.5)`
    );
  };

  // Only apply sunset's grayscale when sunset is actually being viewed (selected or previewed)
  const getFilterForCurrentTheme = (currentThemeId: string, baseBlur: number) => {
    // If we're previewing sunset or sunset is selected, use sunset filter
    if (currentThemeId === 'sunset') {
      return getThemeFilter('sunset', baseBlur);
    }
    // Otherwise, use the theme filter but never the sunset grayscale
    return getThemeFilter(currentThemeId, baseBlur);
  };

  // Use preview theme if available, otherwise current theme
  const currentTheme = state.previewTheme || state.currentTheme;
  const themeFilter = getFilterForCurrentTheme(currentTheme.id, blurAmount);

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
              filter: themeFilter,
              willChange: 'opacity',
              transition: 'filter 300ms ease-in-out',
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
              className="absolute w-full h-full object-cover"
              style={{
                transform: 'scale(1.2) translate3d(0,0,0)',
                willChange: 'auto',
                top: '-10%',
                left: '-10%',
                width: '120%',
                height: '120%',
              }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />

      {/* Sunset theme warm gradient overlay */}
      {currentTheme.id === 'sunset' && displayUrl && !showBlack && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(
              135deg,
              rgba(244, 196, 48, 0.9) 0%,
              rgba(236, 95, 103, 0.8) 50%,
              rgba(171, 71, 166, 0.7) 100%
            )`,
            mixBlendMode: 'screen',
          }}
        />
      )}
    </div>
  );
};

export default BlurredAlbumBackground;

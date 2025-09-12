'use client';

import React, { useState, useEffect } from 'react';
import { Track } from '../../types/track';
import { useTheme } from '../../contexts/ThemeContext';
import BlurredAlbumBackground from '../ui/BlurredAlbumBackground';
import { MeshGradient } from '@paper-design/shaders-react';
import { extractColorsFromImage, generateShaderColors } from '../../utils/colorExtraction';

interface BackgroundLayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  isTransitioning: boolean;
}

/**
 * BackgroundLayer - Layer 1 of 3
 *
 * Handles all background visual elements at z-layer-background (0):
 * - Album artwork blur
 * - Dynamic color shader gradients
 * - Base visual foundation
 */
export function BackgroundLayer({
  currentTrack,
  isPlaying,
  isTransitioning,
}: BackgroundLayerProps) {
  const { state } = useTheme();
  const currentTheme = state.previewTheme || state.currentTheme;

  const [shaderColors, setShaderColors] = useState<string[]>([
    '#000000',
    '#1a1a1a',
    '#333333',
    '#ffffff',
  ]);
  const [pendingColorExtraction, setPendingColorExtraction] = useState<string | null>(null);

  // Ocean-specific shader colors - lighter and more oceanic
  const oceanShaderColors = [
    '#001122', // Deep ocean blue
    '#003344', // Mid ocean
    '#0088bb', // Bright ocean cyan
    '#66ccee', // Light aqua
  ];

  // Sunset-specific shader colors - warm golden hour tones
  const sunsetShaderColors = [
    '#2a1810', // Deep sunset brown
    '#4a2c15', // Rich amber
    '#ff8c42', // Golden orange
    '#ffb366', // Light golden yellow
  ];

  // Delayed color extraction - only for non-vaporwave themes
  useEffect(() => {
    if (currentTheme.id === 'vaporwave') return; // Skip color extraction for vaporwave

    if (currentTrack?.albumCoverUrl && isPlaying && !isTransitioning) {
      // Mark this URL as pending extraction
      if (pendingColorExtraction !== currentTrack.albumCoverUrl) {
        setPendingColorExtraction(currentTrack.albumCoverUrl);

        // Add delay to ensure smooth initial transition
        const timeoutId = setTimeout(() => {
          extractColorsFromImage(currentTrack.albumCoverUrl!)
            .then((extractedColors) => {
              const dynamicColors = generateShaderColors(extractedColors);
              setShaderColors(dynamicColors);
              setPendingColorExtraction(null);
            })
            .catch((error) => {
              console.warn('Color extraction failed:', error);
              // Keep current colors instead of resetting to defaults
              setPendingColorExtraction(null);
            });
        }, 2000); // 2s delay to allow initial play transition to fully settle

        return () => {
          clearTimeout(timeoutId);
        };
      }
    }
  }, [
    currentTrack?.albumCoverUrl,
    isPlaying,
    isTransitioning,
    pendingColorExtraction,
    currentTheme.id,
  ]);

  return (
    <div className="absolute inset-0 z-layer-background overflow-hidden bg-black">
      {/* Album artwork background - excluded from vaporwave theme */}
      {currentTheme.id !== 'vaporwave' && (
        <BlurredAlbumBackground
          className="absolute inset-0"
          albumCoverUrl={currentTrack?.albumCoverUrl}
          blurAmount={60}
          isTrackReady={isPlaying && !isTransitioning}
          shouldFadeToBlack={isTransitioning}
        />
      )}

      {/* Dynamic color shader overlay - excluded from vaporwave theme */}
      {currentTheme.id !== 'vaporwave' && (
        <div className="absolute inset-0 mix-blend-overlay">
          <MeshGradient
            className="w-full h-full"
            colors={
              currentTheme.id === 'ocean'
                ? oceanShaderColors
                : currentTheme.id === 'sunset'
                  ? sunsetShaderColors
                  : shaderColors
            }
            speed={currentTheme.id === 'ocean' ? 0 : 0.1}
            style={{ willChange: 'auto' }}
          />
        </div>
      )}

      {/* Vaporwave-specific background */}
      {currentTheme.id === 'vaporwave' && (
        <>
          {/* Vaporwave theme color gradient - base layer */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(
                to bottom,
                #39DF94 0%,
                #FD6BC5 50%,
                #341E9B 100%
              )`,
            }}
          />
        </>
      )}
    </div>
  );
}

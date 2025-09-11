'use client';

import React, { useEffect, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Particles from '@tsparticles/react';
import { initParticlesEngine } from '@tsparticles/react';
import { loadBasic } from '@tsparticles/basic';
import { LightRaysBackground } from '../ui/LightRaysBackground';

/**
 * EffectsLayer - Layer 2 of 3
 *
 * Handles all theme-specific visual effects at z-layer-effects (100):
 * - Particles for sunset theme
 * - Scan lines for vaporwave theme
 * - Atmospheric effects for ocean theme
 * - Any other animated theme elements
 *
 * This layer sits between the background and UI elements.
 * Effects run continuously regardless of play state.
 *
 * Memoized to prevent unnecessary re-renders that would reset particles.
 */
function EffectsLayerComponent() {
  const { state } = useTheme();

  // Use preview theme for visual effects, but current theme for font changes
  const currentTheme = state.previewTheme || state.currentTheme;
  const selectedTheme = state.currentTheme; // Only use actual selected theme for font

  // Initialize particles engine once
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadBasic(engine);
    });
  }, []);

  // Apply Silkscreen font for vaporwave theme - only when actually selected, not on preview
  useEffect(() => {
    if (selectedTheme.id === 'vaporwave') {
      document.body.style.fontFamily = "'Silkscreen', 'Geist', monospace";
      document.body.classList.add('vaporwave-font');
    } else {
      document.body.style.fontFamily =
        "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
      document.body.classList.remove('vaporwave-font');
    }
  }, [selectedTheme.id]); // Only depend on actually selected theme, not preview

  // Memoize sunset particles configuration to prevent unnecessary re-renders
  const sunsetParticlesConfig = useMemo(
    () => ({
      fpsLimit: 30,
      particles: {
        number: {
          value: 50,
          density: {
            enable: true,
            area: 800,
          },
        },
        color: {
          value: ['#FFFFFF', '#FFD700', '#FFF8DC'],
        },
        shape: {
          type: 'circle',
        },
        opacity: {
          value: { min: 0.3, max: 0.5 },
        },
        size: {
          value: { min: 0.5, max: 1.5 },
        },
        move: {
          enable: true,
          speed: 0.5,
          direction: 'topRight' as const,
          random: true,
          straight: false,
          outModes: {
            default: 'out' as const,
          },
        },
      },
      detectRetina: true,
    }),
    []
  ); // Empty dependency array - config never changes

  // Memoize ocean particles configuration - sediment rising from ocean floor
  const oceanParticlesConfig = useMemo(
    () => ({
      fpsLimit: 30,
      particles: {
        number: {
          value: 150,
          density: {
            enable: true,
            area: 800,
          },
        },
        color: {
          value: '#000000',
        },
        shape: {
          type: 'circle',
        },
        opacity: {
          value: { min: 0.1, max: 0.4 },
        },
        size: {
          value: { min: 0.5, max: 1 },
        },
        move: {
          enable: true,
          speed: 1.2,
          direction: 'top' as const,
          random: true,
          straight: false,
          outModes: {
            default: 'out' as const,
          },
        },
      },
      detectRetina: true,
    }),
    []
  ); // Empty dependency array - config never changes

  return (
    <div className="absolute inset-0 z-layer-effects pointer-events-none">
      {/* Vaporwave theme effects */}
      {currentTheme.id === 'vaporwave' && (
        <>
          {/* Tron grid container - isolated stacking context */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: 'translateZ(-2px)', // Push entire grid container back
            }}
          >
            {/* Animated Tron grid floor with forward motion - optimized */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                contain: 'layout style paint', // CSS containment
                width: '200%',
                height: '150%', // Reduced height so it doesn't go so high up
                left: '-50%',
                top: '8%', // Start lower on screen, not extending up so much
                transform: 'perspective(600px) rotateX(60deg) translateY(10vh)', // Removed translateZ
                transformOrigin: 'center center',
                background: `
                repeating-linear-gradient(
                  0deg,
                  transparent 0px,
                  rgba(57, 223, 148, 0.6) 1px,
                  transparent 1px,
                  transparent 50px
                ),
                repeating-linear-gradient(
                  90deg,
                  transparent 0px,
                  rgba(57, 223, 148, 0.6) 1px,
                  transparent 1px,
                  transparent 50px
                )
              `,
                backgroundSize: '50px 50px',
                filter: 'drop-shadow(0 0 5px #39DF94)', // Reduced shadow
                animation: 'tron-grid-subtle-flow 0.5s linear infinite', // Slower animation
                willChange: 'background-position',
              }}
            />

            {/* Gradient overlay to fade out grid at top and bottom */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(
                to bottom,
                #39DF94 0%,
                #39DF94 0%,
                transparent 0%,
                transparent 70%,
                #341E9B 95%,
                #341E9B 100%
              )`,
              }}
            />
          </div>

          {/* Vaporwave background image - final layer */}
          <div
            className="absolute inset-0 pointer-events-none opacity-50 blur-[4px]"
            style={{
              backgroundImage: 'url(/assets/vapor-bg.webp)',
              backgroundSize: '100% auto',
              backgroundPosition: 'center top',
              backgroundRepeat: 'no-repeat',
              marginTop: '-11%',
            }}
          />
        </>
      )}

      {/* Sunset theme effects */}
      {currentTheme.id === 'sunset' && (
        <>
          {/* Subtle lens flare */}
          <div
            className="absolute"
            style={{
              top: '5%',
              right: '10%',
              width: '400px',
              height: '400px',
              background: `radial-gradient(
                circle,
                rgba(244, 196, 48, 0.08) 0%,
                rgba(236, 95, 103, 0.04) 40%,
                rgba(255, 255, 255, 0.02) 60%,
                transparent 80%
              )`,
              borderRadius: '50%',
              filter: 'blur(20px)',
              animation: 'pulse 6s ease-in-out infinite',
            }}
          />

          {/* Golden hour dust particles */}
          <div className="absolute inset-0">
            <Particles
              key="sunset-particles-stable"
              id="sunset-dust"
              options={sunsetParticlesConfig}
            />
          </div>

          {/* Original sunset warm glow */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(
                circle at center,
                rgba(244, 196, 48, 0.05) 0%,
                rgba(236, 95, 103, 0.03) 50%,
                transparent 100%
              )`,
              mixBlendMode: 'overlay',
            }}
          />
        </>
      )}

      {/* Ocean theme effects */}
      {currentTheme.id === 'ocean' && (
        <>
          {/* WebGL God Rays - CRANKED UP for visibility */}
          <div className="absolute inset-0 w-full h-full">
            <LightRaysBackground
              raysOrigin="top-center"
              raysColor="#00BCD4"
              raysSpeed={0.8}
              lightSpread={0.25}
              rayLength={5.0}
              pulsating={false}
              fadeDistance={0.3}
              saturation={2}
              followMouse={false}
              mouseInfluence={0}
              noiseAmount={0.5}
              distortion={1}
              className="mix-blend-screen opacity-90"
            />
          </div>

          {/* Deep ocean base layer */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(
                ellipse at center,
                rgba(0, 150, 180, 0.08) 0%,
                rgba(0, 120, 150, 0.04) 50%,
                transparent 100%
              )`,
              mixBlendMode: 'overlay',
            }}
          />

          {/* Mid-ocean cyan layer */}
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background: `radial-gradient(
                ellipse at 30% 40%,
                rgba(0, 188, 212, 0.06) 0%,
                rgba(34, 211, 238, 0.03) 40%,
                transparent 80%
              )`,
              mixBlendMode: 'overlay',
              animationDuration: '6s',
            }}
          />

          {/* Surface water cyan ripples */}
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background: `radial-gradient(
                ellipse at 70% 60%,
                rgba(56, 189, 248, 0.04) 0%,
                rgba(14, 165, 233, 0.02) 50%,
                transparent 100%
              )`,
              mixBlendMode: 'overlay',
              animationDuration: '4s',
              animationDelay: '-2s',
            }}
          />

          {/* Deep blue undertones */}
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background: `radial-gradient(
                ellipse at center,
                rgba(41, 98, 255, 0.03) 0%,
                rgba(59, 130, 246, 0.015) 70%,
                transparent 100%
              )`,
              mixBlendMode: 'overlay',
              animationDuration: '8s',
            }}
          />

          {/* Deep ocean floor gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(
                to bottom,
                transparent 0%,
                transparent 60%,
                rgba(5, 10, 25, 0.2) 70%,
                rgba(3, 6, 18, 0.5) 85%,
                rgba(1, 3, 12, 0.8) 100%
              )`,
              mixBlendMode: 'multiply',
            }}
          />

          {/* Ocean particle effects - floating debris and light refraction (on top) */}
          <div className="absolute inset-0 mix-blend-multiply">
            <Particles
              key="ocean-particles-stable"
              id="ocean-bubbles"
              options={oceanParticlesConfig}
            />
          </div>
        </>
      )}
    </div>
  );
}

// Memoize the component to prevent re-renders when parent props don't affect particles
export const EffectsLayer = React.memo(EffectsLayerComponent);

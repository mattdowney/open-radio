'use client';

import { cn } from '@/app/lib/utils';
import Image from 'next/image';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { useState } from 'react';
import { VisualizerProps } from '../../types/visualizer';

export function CDVisualizer({
  src,
  alt,
  isPlaying,
  isLoading = false,
  className = '',
}: VisualizerProps) {
  const [, setImageLoading] = useState(true);

  // If loading or no src, show skeleton
  if (isLoading || !src) {
    return (
      <div className={cn('relative aspect-square w-full', className)}>
        <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-slate-200 to-slate-400">
          <Skeleton className="absolute inset-0 rounded-full" />
          <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative aspect-square w-full drop-shadow-2xl', className)}>
      {/* Main CD container */}
      <div 
        className="relative w-full h-full rounded-full overflow-hidden"
        style={{
          maskImage: 'radial-gradient(circle, transparent 10%, black 10.5%)',
          WebkitMaskImage: 'radial-gradient(circle, transparent 10%, black 10.5%)'
        }}
      >
        {/* CD Base - Polycarbonate disc */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 25%, #d0d0d0 50%, #c0c0c0 75%, #b0b0b0 100%)',
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.1), 0 8px 32px rgba(0,0,0,0.3)'
          }}
        />

        {/* Spinning album artwork layer */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            willChange: 'transform',
            animation: isPlaying ? 'spin 0.5s linear infinite' : 'none',
          }}
        >
          {/* Album artwork printed on CD surface */}
          <div className="relative w-full h-full">
            <Image
              src={src}
              alt={alt}
              fill
              className={cn(
                'object-cover rounded-full opacity-85',
                'transition-opacity duration-300'
              )}
              onLoad={() => setImageLoading(false)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
              quality={90}
            />
            
            {/* CD data track pattern - very fine concentric circles */}
            <div 
              className="absolute inset-0 rounded-full opacity-8"
              style={{
                background: `
                  repeating-radial-gradient(
                    circle at center,
                    transparent 0px,
                    transparent 0.8px,
                    rgba(0,0,0,0.6) 0.9px,
                    rgba(0,0,0,0.6) 1px,
                    transparent 1.1px,
                    transparent 1.9px
                  )
                `,
                maskImage: 'radial-gradient(circle, transparent 22%, black 25%, black 85%, transparent 88%)',
                WebkitMaskImage: 'radial-gradient(circle, transparent 22%, black 25%, black 85%, transparent 88%)'
              }}
            />
          </div>

          {/* Outermost black ring */}
          <div 
            className="absolute top-1/2 left-1/2 w-40 h-40 -translate-x-1/2 -translate-y-1/2 rounded-full z-30"
            style={{
              background: 'radial-gradient(circle at center, rgba(20,20,20,0.9) 0%, rgba(0,0,0,0.95) 100%)',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6), 0 0 15px rgba(0,0,0,0.3)'
            }}
          >
            {/* Middle metallic ring with prismatic reflections */}
            <div 
              className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background: `
                  conic-gradient(from 0deg at center,
                    rgba(240, 240, 255, 0.9) 0deg,
                    rgba(255, 240, 240, 0.85) 30deg,
                    rgba(240, 255, 240, 0.9) 60deg,
                    rgba(240, 240, 255, 0.85) 90deg,
                    rgba(255, 255, 240, 0.9) 120deg,
                    rgba(255, 240, 255, 0.85) 150deg,
                    rgba(240, 255, 255, 0.9) 180deg,
                    rgba(255, 240, 240, 0.85) 210deg,
                    rgba(240, 255, 240, 0.9) 240deg,
                    rgba(240, 240, 255, 0.85) 270deg,
                    rgba(255, 255, 240, 0.9) 300deg,
                    rgba(255, 240, 255, 0.85) 330deg,
                    rgba(240, 240, 255, 0.9) 360deg
                  ),
                  radial-gradient(circle at center,
                    rgba(220, 220, 230, 0.8) 0%,
                    rgba(200, 200, 210, 0.7) 50%,
                    rgba(180, 180, 190, 0.6) 100%
                  )
                `,
                boxShadow: 'inset 0 0 16px rgba(0,0,0,0.4)'
              }}
            >
              {/* Inner transparent/clear ring - where CD meets player */}
              <div 
                className="absolute top-1/2 left-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.15)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Metallic CD base layer */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none z-10"
          style={{
            background: `
              radial-gradient(circle at center,
                #f8f9fa 0%,
                #e9ecef 25%,
                #dee2e6 50%,
                #ced4da 75%,
                #adb5bd 100%
              )
            `,
            mixBlendMode: 'multiply',
            opacity: 0.6
          }}
        />

        {/* Radial light streaks - like reference image */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none opacity-60 z-20"
          style={{
            background: `
              conic-gradient(from 0deg at center,
                transparent 0deg,
                rgba(255,100,255,0.8) 15deg,
                transparent 30deg,
                rgba(100,255,100,0.8) 45deg,
                transparent 60deg,
                rgba(100,200,255,0.8) 75deg,
                transparent 90deg,
                rgba(255,255,100,0.8) 105deg,
                transparent 120deg,
                rgba(255,150,100,0.8) 135deg,
                transparent 150deg,
                rgba(200,100,255,0.8) 165deg,
                transparent 180deg,
                rgba(100,255,200,0.8) 195deg,
                transparent 210deg,
                rgba(255,200,100,0.8) 225deg,
                transparent 240deg,
                rgba(150,255,100,0.8) 255deg,
                transparent 270deg,
                rgba(100,150,255,0.8) 285deg,
                transparent 300deg,
                rgba(255,100,150,0.8) 315deg,
                transparent 330deg,
                rgba(200,255,100,0.8) 345deg,
                transparent 360deg
              )
            `,
            mixBlendMode: 'overlay',
            maskImage: 'radial-gradient(circle, transparent 12%, black 15%, black 82%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 12%, black 15%, black 82%, transparent 85%)'
          }}
        />
        
        {/* Multi-colored transparent refractions overlay */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none opacity-40 z-35"
          style={{
            background: `
              radial-gradient(
                ellipse 80% 60% at 30% 40%,
                rgba(255,100,255,0.3) 0%,
                rgba(100,255,200,0.2) 25%,
                transparent 50%
              ),
              radial-gradient(
                ellipse 60% 80% at 70% 30%,
                rgba(100,200,255,0.3) 0%,
                rgba(255,255,100,0.2) 25%,
                transparent 50%
              ),
              radial-gradient(
                ellipse 70% 50% at 50% 70%,
                rgba(255,150,100,0.3) 0%,
                rgba(150,255,100,0.2) 25%,
                transparent 50%
              )
            `,
            mixBlendMode: 'screen',
            maskImage: 'radial-gradient(circle, transparent 12%, black 15%, black 82%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 12%, black 15%, black 82%, transparent 85%)'
          }}
        />

        {/* Bright radial highlight from center */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none z-40"
          style={{
            background: `
              radial-gradient(
                circle at center,
                rgba(255,255,255,0.8) 0%,
                rgba(255,255,255,0.4) 20%,
                rgba(255,255,255,0.1) 40%,
                transparent 60%
              )
            `,
            mixBlendMode: 'overlay'
          }}
        />

        {/* Metallic overlay for entire CD */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none z-45"
          style={{
            background: `
              radial-gradient(
                circle at center,
                rgba(240,240,255,0.3) 0%,
                rgba(220,220,240,0.25) 30%,
                rgba(200,200,220,0.2) 60%,
                rgba(180,180,200,0.15) 100%
              )
            `,
            mixBlendMode: 'multiply'
          }}
        />

        {/* Additional metallic sheen */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none z-46"
          style={{
            background: `
              linear-gradient(
                135deg,
                rgba(255,255,255,0.4) 0%,
                rgba(255,255,255,0.1) 25%,
                transparent 50%,
                rgba(0,0,0,0.05) 75%,
                rgba(0,0,0,0.1) 100%
              )
            `,
            mixBlendMode: 'overlay'
          }}
        />

        {/* Radial light reflection */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none z-25"
          style={{
            background: `
              radial-gradient(
                ellipse 70% 40% at 35% 25%,
                rgba(255,255,255,0.9) 0%,
                rgba(255,255,255,0.5) 25%,
                rgba(255,255,255,0.2) 50%,
                transparent 75%
              )
            `,
            mixBlendMode: 'overlay'
          }}
        />

        {/* Directional highlight */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none z-30"
          style={{
            background: `
              linear-gradient(
                110deg,
                rgba(255,255,255,0.7) 0%,
                rgba(255,255,255,0.3) 15%,
                transparent 35%,
                rgba(0,0,0,0.05) 65%,
                rgba(0,0,0,0.2) 100%
              )
            `,
            mixBlendMode: 'soft-light'
          }}
        />

        {/* Edge beveling and depth */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none z-50"
          style={{
            boxShadow: `
              inset 0 0 0 1px rgba(255,255,255,0.6),
              inset 0 3px 6px rgba(255,255,255,0.4),
              inset 0 -3px 12px rgba(0,0,0,0.15)
            `
          }}
        />

        {/* Outer rim shadow */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none z-60"
          style={{
            boxShadow: '0 0 0 1px rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.25)'
          }}
        />
      </div>
    </div>
  );
}

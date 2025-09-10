'use client';

import { cn } from '@/app/lib/utils';
import Image from 'next/image';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { useState } from 'react';

interface VinylRecordProps {
  src?: string;
  alt: string;
  isPlaying: boolean;
  isLoading?: boolean;
  className?: string;
}

export function VinylRecord({
  src,
  alt,
  isPlaying,
  isLoading = false,
  className = '',
}: VinylRecordProps) {
  const [imageLoading, setImageLoading] = useState(true);

  // If loading or no src, show skeleton
  if (isLoading || !src) {
    return (
      <div className={cn('relative aspect-square w-full', className)}>
        <div className="relative w-full h-full rounded-full overflow-hidden bg-black">
          <Skeleton className="absolute inset-0 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative aspect-square w-full', className)}>
      {/* Main vinyl record container */}
      <div
        className="relative w-full h-full rounded-full overflow-hidden bg-black shadow-2xl"
        style={{ isolation: 'isolate' }}
      >
        {/* Spinning content */}
        <div
          className="absolute inset-0 animate-spin-slow"
          style={{
            willChange: 'transform',
            animationPlayState: isPlaying && !isLoading ? 'running' : 'paused',
          }}
        >
          {/* Subtle vinyl surface shading */}
          {/* Grooves (rotate with record) */}
          <div
            className="absolute inset-0 rounded-full opacity-[0.3]"
            style={{
              background: `
              /* Fine groove lines */
              repeating-radial-gradient(
                circle at center,
                rgba(255,255,255,0.10) 0px,
                rgba(255,255,255,0.10) 0.6px,
                rgba(0,0,0,0.10) 0.6px,
                rgba(0,0,0,0.10) 1.2px
              ),
              /* Broader banding to mimic pressed tracks */
              repeating-radial-gradient(
                circle at center,
                rgba(255,255,255,0.05) 0px,
                rgba(255,255,255,0.05) 2px,
                rgba(0,0,0,0.06) 2px,
                rgba(0,0,0,0.06) 3px
              )
            `,
              mixBlendMode: 'overlay',
              maskImage:
                'radial-gradient(circle at center, transparent 0%, transparent 22%, black 26%, black 85%)',
              WebkitMaskImage:
                'radial-gradient(circle at center, transparent 0%, transparent 22%, black 26%, black 85%)',
            }}
          />

          {/* Runout ring near the label (rotates) */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, transparent 0 24%, rgba(255,255,255,0.12) 26%, transparent 28%)`,
              mixBlendMode: 'overlay',
            }}
          />

          {/* Outer rim subtle highlight (rotates) */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow:
                'inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 0 10px rgba(255,255,255,0.06), inset 0 0 60px rgba(0,0,0,0.6)',
            }}
          />

          {/* Subtle radial vignette to add depth */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, rgba(0,0,0,0) 50%, rgba(0,0,0,0.14) 100%)`,
            }}
          />

          {/* Center label with album artwork */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[41%] h-[41%] rounded-full overflow-hidden bg-black shadow-inner">
            {/* Album cover as the label */}
            <div className="relative w-full h-full">
              <Image
                src={src}
                alt={alt}
                fill
                className={cn(
                  'object-cover',
                  'transition-opacity duration-300',
                  imageLoading ? 'opacity-100' : 'opacity-100'
                )}
                onLoad={() => setImageLoading(false)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
                quality={90}
              />
            </div>

            {/* Center spindle hole */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[12%] h-[12%] rounded-full bg-black shadow-inner">
              <div className="absolute inset-[25%] rounded-full bg-black" />
            </div>
          </div>
        </div>

        {/* Directional lighting from above (subtle) */}
        <div
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            background: `
            radial-gradient(
              circle at 50% 4%,
              rgba(255,255,255,0.14) 0%,
              rgba(255,255,255,0.08) 12%,
              rgba(255,255,255,0.04) 20%,
              transparent 38%
            ),
            linear-gradient(
              to bottom,
              rgba(255,255,255,0.12) 0%,
              rgba(255,255,255,0.04) 12%,
              rgba(0,0,0,0.08) 55%,
              rgba(0,0,0,0.18) 100%
            )
          `,
            mixBlendMode: 'soft-light',
          }}
        />

        {/* Specular highlight arcs (stationary lighting) */}
        <div
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            background: `
            conic-gradient(from -30deg at 38% 22%, rgba(255,255,255,0.24) 0deg, rgba(255,255,255,0.10) 14deg, rgba(255,255,255,0.0) 36deg, transparent 324deg, rgba(255,255,255,0.08) 346deg, rgba(255,255,255,0.18) 360deg)
          `,
            filter: 'blur(10px)',
            mixBlendMode: 'screen',
            opacity: 0.35,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            background: `
            conic-gradient(from 150deg at 72% 78%, rgba(255,255,255,0.12) 0deg, rgba(255,255,255,0.0) 22deg, transparent 360deg)
          `,
            filter: 'blur(6px)',
            mixBlendMode: 'screen',
            opacity: 0.25,
          }}
        />

        {/* Edge highlight for depth */}
        <div
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            boxShadow:
              'inset 0 0 3px rgba(255, 255, 255, 0.10), inset 0 0 24px rgba(0, 0, 0, 0.50)',
          }}
        />
      </div>
    </div>
  );
}

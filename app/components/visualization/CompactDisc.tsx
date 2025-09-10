'use client';

import { cn } from '@/app/lib/utils';
import Image from 'next/image';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { useState } from 'react';

interface CompactDiscProps {
  src?: string;
  alt: string;
  isPlaying: boolean;
  isLoading?: boolean;
  className?: string;
}

export function CompactDisc({
  src,
  alt,
  isPlaying,
  isLoading = false,
  className = '',
}: CompactDiscProps) {
  const [imageLoading, setImageLoading] = useState(true);

  // If loading or no src, show skeleton
  if (isLoading || !src) {
    return (
      <div className={cn('relative aspect-square w-full', className)}>
        <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-100">
          <Skeleton className="absolute inset-0 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative aspect-square w-full', className)}>
      {/* Main CD container */}
      <div
        className="relative w-full h-full rounded-full overflow-hidden bg-gray-100 shadow-2xl"
        style={{ isolation: 'isolate' }}
      >
        {/* Spinning content */}
        <div className={cn('absolute inset-0', isPlaying && !isLoading && 'animate-spin-slow')}>
          {/* CD surface - iridescent rainbow effect */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `
                /* Base silver/chrome */
                radial-gradient(circle at center, rgba(220,220,220,1) 0%, rgba(200,200,200,1) 60%, rgba(180,180,180,1) 100%),
                /* Iridescent rainbow bands */
                conic-gradient(from 0deg at center,
                  #ff0080 0deg,
                  #8000ff 30deg,
                  #0080ff 60deg,
                  #00ff80 90deg,
                  #ffff00 120deg,
                  #ff8000 150deg,
                  #ff0080 180deg,
                  #8000ff 210deg,
                  #0080ff 240deg,
                  #00ff80 270deg,
                  #ffff00 300deg,
                  #ff8000 330deg,
                  #ff0080 360deg
                )
              `,
              mixBlendMode: 'screen',
              opacity: 0.6,
            }}
          />

          {/* Prismatic diffraction patterns (rotate with CD) */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `
                /* Radial diffraction rings */
                repeating-radial-gradient(
                  circle at center,
                  transparent 0px,
                  rgba(255,255,255,0.8) 2px,
                  transparent 4px,
                  rgba(0,150,255,0.3) 6px,
                  transparent 8px,
                  rgba(255,100,255,0.3) 10px,
                  transparent 12px
                ),
                /* Concentric data tracks */
                repeating-radial-gradient(
                  circle at center,
                  rgba(255,255,255,0.15) 0px,
                  rgba(255,255,255,0.15) 0.5px,
                  transparent 0.5px,
                  transparent 1px
                )
              `,
              maskImage:
                'radial-gradient(circle at center, transparent 0%, transparent 18%, black 22%, black 88%, transparent 92%)',
              WebkitMaskImage:
                'radial-gradient(circle at center, transparent 0%, transparent 18%, black 22%, black 88%, transparent 92%)',
              mixBlendMode: 'overlay',
            }}
          />

          {/* Spiral data track pattern */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `
                conic-gradient(from 0deg at center,
                  rgba(255,255,255,0.1) 0deg,
                  transparent 0.5deg,
                  rgba(255,255,255,0.05) 1deg,
                  transparent 1.5deg,
                  rgba(255,255,255,0.08) 2deg,
                  transparent 2.5deg
                )
              `,
              maskImage:
                'radial-gradient(circle at center, transparent 0%, transparent 18%, black 22%, black 88%, transparent 92%)',
              WebkitMaskImage:
                'radial-gradient(circle at center, transparent 0%, transparent 18%, black 22%, black 88%, transparent 92%)',
              opacity: 0.7,
            }}
          />

          {/* Outer rim highlight */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow:
                'inset 0 0 0 1px rgba(255,255,255,0.6), inset 0 0 20px rgba(255,255,255,0.3), inset 0 0 40px rgba(0,0,0,0.2)',
            }}
          />

          {/* Center label area with album artwork */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32%] h-[32%] rounded-full overflow-hidden bg-white shadow-inner">
            {/* Album cover as the center label */}
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

            {/* Center hole */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[18%] h-[18%] rounded-full bg-black shadow-inner">
              <div className="absolute inset-[20%] rounded-full bg-black" />
            </div>
          </div>
        </div>

        {/* Subtle surface texture overlay */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at 35% 25%, rgba(255,255,255,0.4) 0%, transparent 25%),
              radial-gradient(circle at 65% 75%, rgba(255,255,255,0.3) 0%, transparent 20%),
              radial-gradient(circle at 25% 65%, rgba(255,255,255,0.2) 0%, transparent 15%)
            `,
            filter: 'blur(8px)',
            mixBlendMode: 'soft-light',
            opacity: 0.6,
          }}
        />

        {/* Edge bevel effect */}
        <div
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.2)',
          }}
        />

        {/* Specular highlights (stationary lighting) */}
        <div
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            background: `
              conic-gradient(from -45deg at 30% 20%, rgba(255,255,255,0.8) 0deg, rgba(255,255,255,0.3) 20deg, transparent 45deg, transparent 315deg, rgba(255,255,255,0.4) 340deg, rgba(255,255,255,0.8) 360deg)
            `,
            filter: 'blur(15px)',
            mixBlendMode: 'screen',
            opacity: 0.7,
          }}
        />

        {/* Secondary highlight */}
        <div
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            background: `
              conic-gradient(from 135deg at 75% 75%, rgba(255,255,255,0.4) 0deg, transparent 30deg, transparent 360deg)
            `,
            filter: 'blur(8px)',
            mixBlendMode: 'screen',
            opacity: 0.5,
          }}
        />
      </div>
    </div>
  );
}

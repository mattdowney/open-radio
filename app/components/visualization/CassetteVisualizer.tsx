'use client';

import { cn } from '@/app/lib/utils';
import Image from 'next/image';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { useState } from 'react';
import { VisualizerProps } from '../../types/visualizer';

export function CassetteVisualizer({
  src,
  alt,
  isPlaying,
  isLoading = false,
  className = '',
}: VisualizerProps) {
  const [imageLoading, setImageLoading] = useState(true);

  // If loading or no src, show skeleton
  if (isLoading || !src) {
    return (
      <div className={cn('relative w-full aspect-[3/2]', className)}>
        <div className="relative w-full h-full rounded-lg overflow-hidden">
          <Skeleton className="absolute inset-0" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full aspect-[3/2] max-w-sm mx-auto', className)}>
      {/* Main cassette body */}
      <div
        className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl"
        style={{
          isolation: 'isolate',
          background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%)',
        }}
      >
        {/* Cassette shell */}
        <div
          className="absolute inset-2 rounded border"
          style={{
            backgroundColor: 'var(--theme-surface)',
            borderColor: 'var(--theme-textSecondary)',
          }}
        >
          {/* Top section with album art */}
          <div
            className="absolute top-2 left-2 right-2 h-[35%] rounded overflow-hidden"
            style={{ backgroundColor: 'var(--theme-background)' }}
          >
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
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
              priority
              quality={90}
            />
          </div>

          {/* Tape reels */}
          <div className="absolute bottom-4 left-4 flex gap-4">
            {/* Left reel */}
            <div
              className="w-12 h-12 rounded-full border-2"
              style={{
                borderColor: 'var(--theme-text)',
                backgroundColor: 'var(--theme-background)',
              }}
            >
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: `conic-gradient(from 0deg, var(--theme-text) 0deg, var(--theme-textSecondary) 45deg, var(--theme-text) 90deg, var(--theme-textSecondary) 135deg, var(--theme-text) 180deg, var(--theme-textSecondary) 225deg, var(--theme-text) 270deg, var(--theme-textSecondary) 315deg)`,
                  animation:
                    isPlaying && !isLoading
                      ? `spin var(--theme-vinylSpeed) linear infinite`
                      : 'none',
                }}
              >
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--theme-background)' }}
                />
              </div>
            </div>

            {/* Right reel */}
            <div
              className="w-12 h-12 rounded-full border-2"
              style={{
                borderColor: 'var(--theme-text)',
                backgroundColor: 'var(--theme-background)',
              }}
            >
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: `conic-gradient(from 180deg, var(--theme-text) 0deg, var(--theme-textSecondary) 45deg, var(--theme-text) 90deg, var(--theme-textSecondary) 135deg, var(--theme-text) 180deg, var(--theme-textSecondary) 225deg, var(--theme-text) 270deg, var(--theme-textSecondary) 315deg)`,
                  animation:
                    isPlaying && !isLoading
                      ? `spin var(--theme-vinylSpeed) linear infinite reverse`
                      : 'none',
                }}
              >
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--theme-background)' }}
                />
              </div>
            </div>
          </div>

          {/* Tape mechanism window */}
          <div
            className="absolute bottom-4 right-4 w-16 h-8 rounded border"
            style={{
              borderColor: 'var(--theme-textSecondary)',
              backgroundColor: 'var(--theme-background)',
            }}
          >
            {/* Tape head */}
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-4 rounded-sm"
              style={{ backgroundColor: 'var(--theme-accent)' }}
            />
          </div>

          {/* Side labels */}
          <div className="absolute top-1/2 right-1 transform -translate-y-1/2 flex flex-col gap-1">
            <div
              className="w-1 h-3 rounded-sm"
              style={{ backgroundColor: 'var(--theme-secondary)' }}
            />
            <div
              className="w-1 h-3 rounded-sm"
              style={{ backgroundColor: 'var(--theme-accent)' }}
            />
          </div>
        </div>

        {/* Cassette housing highlights */}
        <div
          className="absolute inset-0 pointer-events-none rounded-lg"
          style={{
            background: `
              linear-gradient(
                135deg,
                rgba(255,255,255,0.1) 0%,
                transparent 25%,
                transparent 75%,
                rgba(0,0,0,0.2) 100%
              )
            `,
            mixBlendMode: 'overlay',
          }}
        />

        {/* Edge definition */}
        <div
          className="absolute inset-0 pointer-events-none rounded-lg"
          style={{
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1), inset 0 2px 10px rgba(0,0,0,0.5)',
          }}
        />
      </div>
    </div>
  );
}

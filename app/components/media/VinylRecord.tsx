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
    <div
      className={cn(
        'relative aspect-square w-full',
        className
      )}
    >
      {/* Main vinyl record container */}
      <div className="relative w-full h-full rounded-full overflow-hidden bg-black shadow-2xl">
        {/* Spinning content */}
        <div className={cn(
          "absolute inset-0",
          isPlaying && !isLoading && 'animate-spin-slow'
        )}>
          
        
        {/* Subtle vinyl surface shading */}
        <div 
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            background: `
              radial-gradient(
                circle at center,
                transparent 35%,
                rgba(40, 40, 40, 0.3) 70%,
                rgba(30, 30, 30, 0.5) 100%
              )
            `,
          }}
        />
        
        {/* Center label with album artwork */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[35%] h-[35%] rounded-full overflow-hidden bg-black shadow-inner">
          {/* Album cover as the label */}
          <div className="relative w-full h-full">
            <Image
              src={src}
              alt={alt}
              fill
              className={cn(
                'object-cover',
                'transition-opacity duration-300',
                imageLoading ? 'opacity-0' : 'opacity-100'
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
      
      {/* Light reflection from bottom right */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-full"
        style={{
          background: 'radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
          mixBlendMode: 'overlay',
        }}
      />
      
      {/* Edge highlight for depth */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-full"
        style={{
          boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.1), inset 0 0 20px rgba(0, 0, 0, 0.4)',
        }}
      />
    </div>
    </div>
  );
}
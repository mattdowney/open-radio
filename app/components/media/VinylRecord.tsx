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
      <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-gray-900 to-black shadow-2xl">
        {/* Spinning content */}
        <div className={cn(
          "absolute inset-0",
          isPlaying && !isLoading && 'animate-spin-slow'
        )}>
          
          {/* Vinyl grooves - subtle concentric circles with slight variations */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 400 400"
          style={{ opacity: 0.8 }}
        >
          {/* Create subtle grooves with 1px lines and slight variations */}
          {Array.from({ length: 200 }, (_, i) => {
            // Start from label edge (35% = 70px on 200px viewbox) and go outward
            const baseRadius = 70 + (i * 0.65); // Tighter spacing for more grooves
            if (baseRadius > 196) return null; // Stop before edge
            
            // Very subtle variation in spacing
            const variation = Math.sin(i * 0.8) * 0.15 + Math.cos(i * 2.1) * 0.1;
            const radius = baseRadius + variation;
            
            // Occasional slightly darker or lighter grooves
            const isAccent = i % 13 === 0;
            const isLight = i % 19 === 7;
            
            const strokeOpacity = isAccent ? 0.4 : isLight ? 0.15 : 0.25;
            const strokeWidth = isAccent ? 1.2 : 1; // Most are 1px, accents slightly thicker
            
            return (
              <circle
                key={i}
                cx="200"
                cy="200"
                r={radius}
                fill="none"
                stroke="rgba(0,0,0,1)"
                strokeWidth={strokeWidth}
                opacity={strokeOpacity}
              />
            );
          })}
        </svg>
        
        {/* Very subtle radial texture */}
        <div 
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            background: `
              repeating-radial-gradient(
                circle at center,
                transparent 35%,
                rgba(0, 0, 0, 0.03) 35.05%,
                transparent 35.1%
              )
            `,
            mixBlendMode: 'multiply',
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
              onLoadingComplete={() => setImageLoading(false)}
              priority
              quality={90}
            />
          </div>
          
          {/* Center spindle hole */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[12%] h-[12%] rounded-full bg-gray-900 shadow-inner">
            <div className="absolute inset-[25%] rounded-full bg-black" />
          </div>
        </div>
        
      </div>
      
      {/* Static light reflection from bottom-right */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-full"
        style={{
          background: 'radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.15) 0%, transparent 40%)',
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
import { useState } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { cn } from '@/app/lib/utils';
import { useTheme } from '../../contexts/ThemeContext';

interface AlbumCoverProps {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

// Image preload cache
const preloadCache = new Set<string>();

// Preload function
const preloadImage = (src: string) => {
  if (!src || preloadCache.has(src)) return;
  const img = new window.Image();
  img.src = src;
  preloadCache.add(src);
};

export function AlbumCover({
  src,
  alt,
  className = '',
  priority = false,
  size = 'lg',
  isLoading = false,
}: AlbumCoverProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const { state } = useTheme();
  const currentTheme = state.previewTheme || state.currentTheme;

  // If in loading state or no src, show skeleton
  if (isLoading || !src) {
    return (
      <div
        className={cn(
          'relative aspect-square w-full',
          size === 'lg' ? 'rounded-lg' : 'rounded-md',
          className
        )}
      >
        <Skeleton className="absolute inset-0 rounded-[inherit]" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative aspect-square w-full bg-black overflow-hidden',
        size === 'lg' ? 'rounded-xl' : 'rounded-md',
        className
      )}
      style={{
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={cn(
          'object-cover rounded-[inherit]',
          'transition-all duration-300 ease-in-out',
          imageLoading ? 'scale-[105%] opacity-0' : 'scale-[102%] opacity-100'
        )}
        style={{
          willChange: 'transform, opacity, filter',
          backfaceVisibility: 'hidden',
          ...(currentTheme.id === 'vaporwave' && {
            imageRendering: 'pixelated' as React.CSSProperties['imageRendering'],
            filter: 'contrast(1.4) saturate(1.8) hue-rotate(300deg) blur(0.5px)',
            mixBlendMode: 'overlay',
          }),
        }}
        onLoad={() => {
          setImageLoading(false);
          // Preload next quality if available
          if (src.includes('high')) {
            const maxResSrc = src.replace('high', 'maxres');
            preloadImage(maxResSrc);
          }
        }}
        priority={priority}
        quality={currentTheme.id === 'vaporwave' ? 50 : size === 'lg' ? 90 : 75}
      />
      {imageLoading && (
        <Skeleton
          className={cn(
            'absolute inset-0 rounded-[inherit]',
            'transition-opacity duration-300 ease-in-out'
          )}
          animate={false}
        />
      )}
    </div>
  );
}

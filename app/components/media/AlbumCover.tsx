import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { cn } from '@/app/lib/utils';

interface AlbumCoverProps {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const sizes = {
  sm: 40,
  md: 200,
  lg: 400,
};

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
  const [blurDataURL, setBlurDataURL] = useState<string | null>(null);
  const imageSize = sizes[size];

  useEffect(() => {
    if (src) {
      // Generate blur placeholder
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 8;
        canvas.height = 8;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 8, 8);
        setBlurDataURL(canvas.toDataURL());
      }
    }
  }, [src]);

  // If in loading state or no src, show skeleton
  if (isLoading || !src) {
    return (
      <div
        className={cn(
          'relative aspect-square w-full',
          size === 'lg' ? 'rounded-lg' : 'rounded-md',
          className,
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
        size === 'lg' ? 'rounded-lg' : 'rounded-md',
        className,
      )}
      style={{
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
      }}
    >
      {blurDataURL && (
        <Image
          src={blurDataURL}
          alt=""
          fill
          className="absolute inset-0 scale-110 blur-xl rounded-[inherit]"
          aria-hidden="true"
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${imageSize}px`}
        className={cn(
          'object-cover rounded-[inherit]',
          'transition-all duration-300 ease-in-out',
          imageLoading
            ? 'scale-[105%] blur-sm opacity-0'
            : 'scale-[102%] blur-0 opacity-100',
        )}
        style={{
          willChange: 'transform, opacity, filter',
          backfaceVisibility: 'hidden',
        }}
        onLoadingComplete={() => {
          setImageLoading(false);
          // Preload next quality if available
          if (src.includes('high')) {
            const maxResSrc = src.replace('high', 'maxres');
            preloadImage(maxResSrc);
          }
        }}
        priority={priority}
        quality={size === 'lg' ? 90 : 75}
      />
      {imageLoading && (
        <Skeleton
          className={cn(
            'absolute inset-0 rounded-[inherit]',
            'transition-opacity duration-300 ease-in-out',
          )}
          animate={false}
        />
      )}
    </div>
  );
}

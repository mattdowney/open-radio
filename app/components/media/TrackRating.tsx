import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useTrackRating } from '../../hooks/useTrackRating';
import { cn } from '../../lib/utils';
import { memo, useState, useCallback } from 'react';
import { Skeleton } from '../ui/Skeleton';

interface TrackRatingProps {
  trackId: string;
  className?: string;
  isLoading?: boolean;
}

const Star = memo(
  ({
    value,
    isActive,
    isLoading,
    onHover,
    onRate,
  }: {
    value: number;
    isActive: boolean;
    isLoading: boolean;
    onHover: (value: number | null) => void;
    onRate: (value: number) => void;
  }) => (
    <button
      onClick={() => onRate(value)}
      onMouseEnter={() => onHover(value)}
      onMouseLeave={() => onHover(null)}
      className={cn('p-0', isLoading && 'opacity-50 pointer-events-none')}
      disabled={isLoading}
      aria-label={`Rate ${value} star${value !== 1 ? 's' : ''}`}
      style={{ transform: 'translateZ(0)' }}
    >
      <StarSolid
        className={cn(
          'w-3.5 h-3.5 transition-colors duration-duration-fast',
          isActive ? 'text-white' : 'text-white/20',
        )}
      />
    </button>
  ),
);

Star.displayName = 'Star';

export const TrackRating = memo(function TrackRating({
  trackId,
  className,
  isLoading = false,
}: TrackRatingProps) {
  const {
    localRating,
    isLoading: isRatingLoading,
    submitRating,
  } = useTrackRating(trackId);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleHover = useCallback((value: number | null) => {
    setHoverRating(value);
  }, []);

  const handleRate = useCallback(
    (value: number) => {
      submitRating(value);
    },
    [submitRating],
  );

  if (isLoading) {
    // Match the height of the track title skeleton (h-5) for consistency
    return <Skeleton className={cn('h-5 w-[78px]', className)} />;
  }

  return (
    <div
      className={cn('inline-flex items-center gap-0.5', className)}
      style={{
        transform: 'translateZ(0)',
        willChange: 'transform',
        isolation: 'isolate',
      }}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          value={star}
          isActive={star <= (hoverRating ?? localRating ?? 0)}
          isLoading={isRatingLoading}
          onHover={handleHover}
          onRate={handleRate}
        />
      ))}
    </div>
  );
});

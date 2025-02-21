import { cn } from '@/app/lib/utils';

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export function Skeleton({ className, animate = true }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-white/10 rounded-md',
        animate && 'animate-pulse',
        className,
      )}
    />
  );
}

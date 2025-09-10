'use client';

import { useVisualizer } from '../../contexts/VisualizerContext';
import { VisualizerProps } from '../../types/visualizer';
import { cn } from '@/app/lib/utils';

export function DynamicVisualizer({
  src,
  alt,
  isPlaying,
  isLoading = false,
  className = '',
}: VisualizerProps) {
  const { currentVisualizer, availableVisualizers, isTransitioning } = useVisualizer();

  const visualizerConfig = availableVisualizers.find((v) => v.type === currentVisualizer);

  if (!visualizerConfig) {
    // Fallback to vinyl if current visualizer not found
    const fallbackConfig = availableVisualizers.find((v) => v.type === 'vinyl');
    if (!fallbackConfig) return null;

    const FallbackComponent = fallbackConfig.component;
    return (
      <FallbackComponent
        src={src}
        alt={alt}
        isPlaying={isPlaying}
        isLoading={isLoading}
        className={className}
      />
    );
  }

  const VisualizerComponent = visualizerConfig.component;

  return (
    <div className={cn('relative', className)}>
      {/* Transition overlay */}
      {isTransitioning && (
        <div
          className="absolute inset-0 z-10 rounded-full transition-opacity duration-300"
          style={{
            backgroundColor: 'var(--theme-background)',
            opacity: 0.8,
          }}
        />
      )}

      {/* Main visualizer */}
      <div
        className={cn(
          'transition-all duration-300',
          isTransitioning ? 'scale-95 opacity-70' : 'scale-100 opacity-100'
        )}
      >
        <VisualizerComponent
          src={src}
          alt={alt}
          isPlaying={isPlaying}
          isLoading={isLoading}
          className=""
        />
      </div>
    </div>
  );
}

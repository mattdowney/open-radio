'use client';

import { useVisualizer } from '../../contexts/VisualizerContext';
import { Disc, Disc3, Radio } from 'lucide-react';

const VisualizerIcons = {
  vinyl: Disc,
  cd: Disc3,
  cassette: Radio,
};

export function VisualizerSelector() {
  const { currentVisualizer, switchVisualizer, availableVisualizers, isTransitioning } =
    useVisualizer();

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 hover:scale-105"
        style={{
          backgroundColor: 'var(--theme-surface)',
          color: 'var(--theme-text)',
        }}
        title="Switch Visualizer"
        disabled={isTransitioning}
      >
        {(() => {
          const IconComponent = VisualizerIcons[currentVisualizer] || Disc;
          return <IconComponent size={16} />;
        })()}
        <span className="hidden sm:inline text-sm font-medium">
          {availableVisualizers.find((v) => v.type === currentVisualizer)?.name || 'Visualizer'}
        </span>
      </button>

      <div
        className="absolute top-full right-0 mt-2 py-2 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
        style={{
          backgroundColor: 'var(--theme-surface)',
          border: '1px solid var(--theme-textSecondary)',
          minWidth: '200px',
        }}
      >
        {availableVisualizers.map((visualizer) => {
          const IconComponent = VisualizerIcons[visualizer.type] || Disc;
          return (
            <button
              key={visualizer.type}
              onClick={() => switchVisualizer(visualizer.type)}
              className={`block w-full text-left px-4 py-2 text-sm hover:scale-105 transition-all duration-200 ${
                currentVisualizer === visualizer.type ? 'font-medium' : 'font-normal'
              }`}
              style={{
                color:
                  currentVisualizer === visualizer.type
                    ? 'var(--theme-accent)'
                    : 'var(--theme-text)',
              }}
              disabled={isTransitioning}
            >
              <div className="flex items-center gap-3">
                <IconComponent size={16} />
                <div>
                  <div>{visualizer.name}</div>
                  <div
                    className="text-xs opacity-70"
                    style={{ color: 'var(--theme-textSecondary)' }}
                  >
                    {visualizer.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

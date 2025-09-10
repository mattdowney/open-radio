export type VisualizerType = 'vinyl' | 'cd' | 'abstract';

export interface VisualizerProps {
  src?: string;
  alt: string;
  isPlaying: boolean;
  isLoading?: boolean;
  className?: string;
}

export interface Visualizer {
  type: VisualizerType;
  name: string;
  description: string;
  component: React.ComponentType<VisualizerProps>;
}

export interface VisualizerContextType {
  currentVisualizer: VisualizerType;
  availableVisualizers: Visualizer[];
  switchVisualizer: (type: VisualizerType) => void;
  isTransitioning: boolean;
}

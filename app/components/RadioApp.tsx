'use client';

import { PlayerProvider } from '../contexts/PlayerContext';
import { QueueProvider } from '../contexts/QueueContext';
import { UIProvider } from '../contexts/UIContext';
import ErrorBoundary, {
  PlayerErrorBoundary,
  QueueErrorBoundary,
} from './ui/ErrorBoundary';
import { RadioPlayer } from './player/RadioPlayer';

export default function RadioApp() {
  return (
    <ErrorBoundary>
      <UIProvider>
        <PlayerProvider>
          <QueueProvider>
            <PlayerErrorBoundary>
              <QueueErrorBoundary>
                <RadioPlayer />
              </QueueErrorBoundary>
            </PlayerErrorBoundary>
          </QueueProvider>
        </PlayerProvider>
      </UIProvider>
    </ErrorBoundary>
  );
}

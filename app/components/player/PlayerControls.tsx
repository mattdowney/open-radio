interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkip: () => void;
  onPrevious: () => void;
  hasPreviousTrack: boolean;
  className?: string;
}

export function PlayerControls({
  isPlaying,
  onPlayPause,
  onSkip,
  onPrevious,
  hasPreviousTrack,
  className = '',
}: PlayerControlsProps) {
  return (
    <div className={`playback-controls ${className}`}>
      <button
        onClick={onPrevious}
        className={`control-button text-black/80 hover:text-black/100 ${
          !hasPreviousTrack && 'opacity-50 cursor-not-allowed'
        }`}
        disabled={!hasPreviousTrack}
        aria-label="Previous track (Left Arrow)"
        title="Previous track (Left Arrow)"
      >
        <svg
          className="previous fill-current"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="currentColor"
          viewBox="0 0 256 256"
        >
          <path d="M15.33,141.33a15.8,15.8,0,0,0,0-26.83l88.19-56a15.92,15.92,0,0,1,24.48,13.34v37.3l88.48-50.64A15.91,15.91,0,0,1,241,71.84V184.16a15.92,15.92,0,0,1-24.52,13.34L128,146.86v37.3a15.93,15.93,0,0,1-24.48,13.35Z" />
        </svg>
      </button>

      <button
        onClick={onPlayPause}
        className="control-button bg-white text-black hover:opacity-90"
        aria-label={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
      >
        {isPlaying ? (
          <svg
            className="pause fill-current"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path d="M216,48V208a16,16,0,0,1-16,16H160a16,16,0,0,1-16-16V48a16,16,0,0,1,16-16h40A16,16,0,0,1,216,48ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Z" />
          </svg>
        ) : (
          <svg
            className="play fill-current"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z" />
          </svg>
        )}
      </button>

      <button
        onClick={onSkip}
        className="control-button text-black/80 hover:text-black/100"
        aria-label="Skip to next track (Right Arrow)"
        title="Skip to next track (Right Arrow)"
      >
        <svg
          className="next fill-current"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="currentColor"
          viewBox="0 0 256 256"
        >
          <path d="M240.67,141.33l-88.19,56a15.93,15.93,0,0,1-24.48-13.35v-37.3L39.52,197.5A15.91,15.91,0,0,1,15,184.16V71.84A15.92,15.92,0,0,1,39.52,58.5L128,109.14V71.84a15.92,15.92,0,0,1,24.48-13.34l88.19,56a15.8,15.8,0,0,1,0,26.83Z" />
        </svg>
      </button>
    </div>
  );
}

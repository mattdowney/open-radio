interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  className?: string;
}

export function VolumeControl({
  volume,
  onVolumeChange,
  className = '',
}: VolumeControlProps) {
  return (
    <div className={`flex items-center space-x-3 px-1 ${className}`}>
      <button
        className="text-white/60 hover:text-white/80 transition-colors"
        onClick={() => onVolumeChange(volume === 0 ? 70 : 0)}
        aria-label={volume === 0 ? 'Unmute' : 'Mute'}
        title={volume === 0 ? 'Unmute' : 'Mute'}
      >
        {volume === 0 ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path d="M155.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V32A8,8,0,0,0,155.51,24.81ZM144,207.64,84.91,161.69A7.94,7.94,0,0,0,80,160H32V96H80a7.94,7.94,0,0,0,4.91-1.69L144,48.36ZM200,128a7.27,7.27,0,0,1-2.93,6.12A8,8,0,0,1,192,136a7.94,7.94,0,0,1-5.66-2.34l-32-32a8,8,0,0,1,11.32-11.32L197.07,121.8A7.27,7.27,0,0,1,200,128Zm-3.59,58.34a8,8,0,0,1-11.32,11.32l-96-96A8,8,0,0,1,100.41,90.34ZM248,128a7.27,7.27,0,0,1-2.93,6.12A8,8,0,0,1,240,136a7.94,7.94,0,0,1-5.66-2.34l-32-32a8,8,0,0,1,11.32-11.32L245.07,121.8A7.27,7.27,0,0,1,248,128Z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path d="M155.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V32A8,8,0,0,0,155.51,24.81ZM144,207.64,84.91,161.69A7.94,7.94,0,0,0,80,160H32V96H80a7.94,7.94,0,0,0,4.91-1.69L144,48.36ZM208,128a39.93,39.93,0,0,1-10,26.46,8,8,0,0,1-11.92-10.67,24,24,0,0,0,0-31.58A8,8,0,1,1,198,101.54,39.93,39.93,0,0,1,208,128Zm40,0a79.9,79.9,0,0,1-20.37,53.34,8,8,0,0,1-11.92-10.67,64,64,0,0,0,0-85.34A8,8,0,1,1,227.63,74.66,79.9,79.9,0,0,1,248,128Z" />
          </svg>
        )}
      </button>
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={(e) => onVolumeChange(Number(e.target.value))}
        className="volume-slider"
        aria-label="Volume (Up/Down Arrow)"
        title="Adjust volume (Up/Down Arrow)"
      />
    </div>
  );
}

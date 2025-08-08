import { useState, useCallback } from 'react';

interface BlurredAlbumBackgroundProps {
  className?: string;
  albumCoverUrl?: string;
}

const BlurredAlbumBackground = ({ className, albumCoverUrl }: BlurredAlbumBackgroundProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoaded(false);
    setImageError(true);
  }, []);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className || ''}`}>
      {/* Fallback gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-pink-900/50" />
      
      {/* Blurred album cover */}
      {albumCoverUrl && !imageError && (
        <div 
          className={`absolute inset-0 transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={albumCoverUrl}
            alt="Album cover background"
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-3xl brightness-50 saturate-150"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{
              filter: 'blur(60px) brightness(0.4) saturate(1.5)',
              transform: 'scale(1.1)',
            }}
          />
          
          {/* Additional blur overlay for extra effect */}
          <div 
            className="absolute inset-0 backdrop-blur-xl bg-black/30"
            style={{
              backdropFilter: 'blur(20px)',
            }}
          />
        </div>
      )}
      
      {/* Dark overlay to ensure readability */}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
};

export default BlurredAlbumBackground;
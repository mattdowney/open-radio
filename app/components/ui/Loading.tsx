import { useEffect, useState } from 'react';

const Loading = () => {
  const [progress, setProgress] = useState(5);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((currentProgress) => {
        // More aggressive initial progress, allow completion to 100%
        const increment = Math.max(1, (98 - currentProgress) * 0.12);
        return Math.min(98, currentProgress + increment);
      });
    }, 50); // Faster interval for more responsive loading

    // Safety timeout to detect stuck loading
    const stuckTimeout = setTimeout(() => {
      setIsStuck(true);
    }, 20000); // 20 seconds

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stuckTimeout);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-layer-modals flex flex-col items-center justify-center bg-black"
      data-testid="loading-container"
    >
      <div className="w-48 h-[2px] bg-white/10 overflow-hidden rounded-full mb-4">
        <div
          className="h-full bg-white transition-all duration-150 ease-out rounded-full"
          style={{ width: `${progress}%` }}
          data-testid="loading-progress-bar"
        />
      </div>

      {isStuck && (
        <div className="text-white/60 text-sm text-center max-w-sm px-4">
          <p className="mb-2">Taking longer than usual...</p>
          <p className="text-xs">
            If this continues, try refreshing the page or check your connection.
          </p>
        </div>
      )}
    </div>
  );
};

export default Loading;

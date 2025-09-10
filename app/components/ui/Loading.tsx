import { useEffect, useState } from 'react';

const Loading = () => {
  const [progress, setProgress] = useState(5);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((currentProgress) => {
        // More aggressive initial progress, smoother curve
        const increment = Math.max(1, (95 - currentProgress) * 0.15);
        return Math.min(95, currentProgress + increment);
      });
    }, 50); // Faster interval for more responsive loading

    return () => {
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
      data-testid="loading-container"
    >
      <div className="w-48 h-[2px] bg-white/10 overflow-hidden rounded-full">
        <div
          className="h-full bg-white transition-all duration-150 ease-out rounded-full"
          style={{ width: `${progress}%` }}
          data-testid="loading-progress-bar"
        />
      </div>
    </div>
  );
};

export default Loading;

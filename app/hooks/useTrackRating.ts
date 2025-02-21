import { useState, useEffect, useCallback, useRef } from 'react';

interface RatingState {
  localRating: number | null;
  globalRating: number;
  totalRatings: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: RatingState = {
  localRating: null,
  globalRating: 0,
  totalRatings: 0,
  isLoading: true,
  error: null,
};

export const useTrackRating = (trackId: string) => {
  const [state, setState] = useState<RatingState>(initialState);
  const prevTrackIdRef = useRef<string>(trackId);
  const pollTimeoutRef = useRef<NodeJS.Timeout>();

  // Reset state when trackId changes
  useEffect(() => {
    if (prevTrackIdRef.current !== trackId) {
      setState(initialState);
      const localRating = localStorage.getItem(`rating:${trackId}`);
      if (localRating) {
        setState((prev) => ({
          ...prev,
          localRating: Number(localRating),
        }));
      }
      prevTrackIdRef.current = trackId;
    }
  }, [trackId]);

  const fetchGlobalRating = useCallback(
    async (shouldSetLoading = true) => {
      try {
        if (shouldSetLoading) {
          setState((prev) => ({ ...prev, isLoading: true, error: null }));
        }

        const response = await fetch(`/api/ratings?trackId=${trackId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch rating');
        }

        const data = await response.json();
        setState((prev) => {
          // Only update if the data has actually changed
          if (
            prev.globalRating !== data.averageRating ||
            prev.totalRatings !== data.totalRatings
          ) {
            return {
              ...prev,
              globalRating: data.averageRating,
              totalRatings: data.totalRatings,
              isLoading: false,
            };
          }
          return { ...prev, isLoading: false };
        });
      } catch (error) {
        console.error('Error fetching rating:', error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load rating',
        }));
      }
    },
    [trackId],
  );

  // Load global rating and set up polling
  useEffect(() => {
    fetchGlobalRating();

    // Poll for updates every 30 seconds, but only if the rating has been submitted
    const setupPolling = () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
      pollTimeoutRef.current = setTimeout(() => {
        fetchGlobalRating(false).then(setupPolling);
      }, 30000);
    };

    setupPolling();

    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [fetchGlobalRating]);

  const submitRating = useCallback(
    async (rating: number) => {
      if (rating < 1 || rating > 5) {
        setState((prev) => ({
          ...prev,
          error: 'Invalid rating value',
        }));
        return;
      }

      // Save locally first
      localStorage.setItem(`rating:${trackId}`, String(rating));

      // Update UI optimistically
      setState((prev) => ({
        ...prev,
        localRating: rating,
        isLoading: true,
        error: null,
      }));

      try {
        const response = await fetch('/api/ratings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ trackId, rating }),
        });

        if (!response.ok) {
          throw new Error('Failed to submit rating');
        }

        const data = await response.json();
        setState((prev) => ({
          ...prev,
          globalRating: data.averageRating,
          totalRatings: data.totalRatings,
          isLoading: false,
        }));
      } catch (error) {
        console.error('Failed to submit rating:', error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Failed to submit rating',
        }));
      }
    },
    [trackId],
  );

  return {
    ...state,
    submitRating,
  };
};

import { useState, useEffect, useCallback } from 'react';
import { getSavedPlaces, savePlace, unsavePlace, SavedPlace } from './api';

interface UseSavedPlacesResult {
  savedPlaces: SavedPlace[];
  loading: boolean;
  error: string | null;
  save: (googlePlaceId: string) => Promise<boolean>;
  unsave: (saveId: string) => Promise<boolean>;
  refetch: () => void;
}

export function useSavedPlaces(): UseSavedPlacesResult {
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedPlaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSavedPlaces();
      setSavedPlaces(response.places);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load saved places');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedPlaces();
  }, [fetchSavedPlaces]);

  const save = useCallback(async (googlePlaceId: string): Promise<boolean> => {
    try {
      const saved = await savePlace(googlePlaceId);
      setSavedPlaces((prev) => [saved, ...prev]);
      return true;
    } catch (err) {
      // Silently handle "already saved" error
      if (err instanceof Error && err.message === 'Already saved') {
        return true;
      }
      console.error('Failed to save place:', err);
      return false;
    }
  }, []);

  const unsave = useCallback(async (saveId: string): Promise<boolean> => {
    try {
      await unsavePlace(saveId);
      setSavedPlaces((prev) => prev.filter((p) => p.id !== saveId));
      return true;
    } catch (err) {
      console.error('Failed to unsave place:', err);
      return false;
    }
  }, []);

  return {
    savedPlaces,
    loading,
    error,
    save,
    unsave,
    refetch: fetchSavedPlaces,
  };
}

// Re-export SavedPlace type for convenience
export type { SavedPlace } from './api';

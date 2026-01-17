import { useState, useEffect, useCallback } from 'react';
import { searchPlaces } from './api';
import { Place } from '../components/PlaceMarker';

interface UsePlacesOptions {
  radius?: number;
  query?: string;
}

interface UsePlacesResult {
  places: Place[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePlaces(
  location: { latitude: number; longitude: number } | null,
  options?: UsePlacesOptions
): UsePlacesResult {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaces = useCallback(async () => {
    if (!location) return;

    setLoading(true);
    setError(null);

    try {
      const response = await searchPlaces({
        lat: location.latitude,
        lng: location.longitude,
        radius: options?.radius || 1000,
        query: options?.query || 'restaurant',
      });

      // Map API response to Place interface
      setPlaces(
        response.places.map((p) => ({
          google_place_id: p.google_place_id,
          name: p.name,
          address: p.address,
          location: p.location,
          rating: p.rating,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch places');
    } finally {
      setLoading(false);
    }
  }, [location?.latitude, location?.longitude, options?.radius, options?.query]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  return { places, loading, error, refetch: fetchPlaces };
}

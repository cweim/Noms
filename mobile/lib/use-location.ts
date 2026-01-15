import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

export interface LocationState {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface UseLocationResult {
  location: LocationState | null;
  loading: boolean;
  error: string | null;
  permissionStatus: Location.PermissionStatus | null;
  requestPermission: () => Promise<void>;
}

// Default delta for city-level view (roughly 1km radius)
const DEFAULT_DELTA = { latitudeDelta: 0.01, longitudeDelta: 0.01 };

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);

  const getLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Request foreground permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== 'granted') {
        setError('Location permission is required to find nearby restaurants.');
        setLoading(false);
        return;
      }

      // Try high accuracy first
      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          ...DEFAULT_DELTA,
        });
      } catch {
        // Fall back to balanced accuracy if high accuracy fails (timeout, etc.)
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          ...DEFAULT_DELTA,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to get your location';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Request permission and get location on mount
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  const requestPermission = useCallback(async () => {
    await getLocation();
  }, [getLocation]);

  return {
    location,
    loading,
    error,
    permissionStatus,
    requestPermission,
  };
}

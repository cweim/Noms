import { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import { useLocation } from '../../lib/use-location';
import { PlaceMarker, Place } from '../../components/PlaceMarker';

// Mock data for development - will be replaced with API calls in Phase 9
const MOCK_PLACES: Place[] = [
  {
    google_place_id: 'mock_1',
    name: 'The Cozy Cafe',
    address: '123 Main St',
    location: { lat: 0, lng: 0 },
    rating: 4.5,
  },
  {
    google_place_id: 'mock_2',
    name: 'Pasta Paradise',
    address: '456 Oak Ave',
    location: { lat: 0, lng: 0 },
    rating: 4.2,
  },
  {
    google_place_id: 'mock_3',
    name: 'Sushi Central',
    address: '789 Pine Blvd',
    location: { lat: 0, lng: 0 },
    rating: 4.8,
  },
];

export default function NowScreen() {
  const { location, loading, error, requestPermission } = useLocation();

  // Generate mock locations relative to user's position
  const placesWithLocation = useMemo(() => {
    if (!location) return [];
    return MOCK_PLACES.map((place, index) => ({
      ...place,
      location: {
        lat: location.latitude + (Math.random() - 0.5) * 0.01,
        lng: location.longitude + (Math.random() - 0.5) * 0.01,
      },
    }));
  }, [location]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1F2937" />
        <Text style={styles.loadingText}>Finding your location...</Text>
      </View>
    );
  }

  if (error || !location) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Unable to get location'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={requestPermission}>
          <Text style={styles.retryText}>Enable Location</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={location}
        showsUserLocation
        showsMyLocationButton
      >
        {placesWithLocation.map((place) => (
          <PlaceMarker
            key={place.google_place_id}
            place={place}
            onPress={(p) => console.log('Tapped:', p.name)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

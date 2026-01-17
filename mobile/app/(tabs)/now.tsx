import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import { useLocation } from '../../lib/use-location';
import { usePlaces } from '../../lib/use-places';
import { rankPlaces } from '../../lib/rank-places';
import { PlaceMarker, Place } from '../../components/PlaceMarker';
import { RestaurantPicker } from '../../components/RestaurantPicker';

export default function NowScreen() {
  const { location, loading: locationLoading, error: locationError, requestPermission } = useLocation();
  const { places, loading: placesLoading, error: placesError } = usePlaces(
    location ? { latitude: location.latitude, longitude: location.longitude } : null
  );

  // Rank places for picker
  const rankedPlaces = rankPlaces(places);

  const handleLike = (place: Place) => {
    console.log('Liked:', place.name);
    // TODO: Phase 10 will add saving functionality
  };

  if (locationLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1F2937" />
        <Text style={styles.loadingText}>Finding your location...</Text>
      </View>
    );
  }

  if (locationError || !location) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{locationError || 'Unable to get location'}</Text>
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
        {places.map((place) => (
          <PlaceMarker
            key={place.google_place_id}
            place={place}
            onPress={(p) => console.log('Tapped:', p.name)}
          />
        ))}
      </MapView>
      <View style={styles.pickerContainer}>
        <RestaurantPicker
          places={rankedPlaces}
          loading={placesLoading}
          error={placesError}
          onLike={handleLike}
        />
      </View>
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
  pickerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'box-none',
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

import { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocation } from '../../lib/use-location';
import { usePlaces } from '../../lib/use-places';
import { useSavedPlaces } from '../../lib/use-saved-places';
import { rankPlaces } from '../../lib/rank-places';
import { getAuthToken, getPhotoUrl } from '../../lib/api';
import { PlaceMarker, Place } from '../../components/PlaceMarker';
import { SwipeableBottomCard } from '../../components/SwipeableBottomCard';

export default function NowScreen() {
  const insets = useSafeAreaInsets();
  const { location, loading: locationLoading, error: locationError, requestPermission } = useLocation();
  const { places, loading: placesLoading, error: placesError } = usePlaces(
    location ? { latitude: location.latitude, longitude: location.longitude } : null
  );
  const { save } = useSavedPlaces();

  // Auth token for photo URLs
  const [token, setToken] = useState<string | null>(null);

  // Track skipped places
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());

  // "Consider now" temp list (session-only)
  const [nowList, setNowList] = useState<Place[]>([]);

  // Map ref for programmatic control
  const mapRef = useRef<MapView>(null);

  // Fetch auth token on mount
  useEffect(() => {
    getAuthToken().then(setToken);
  }, []);

  // Rank and filter places
  const rankedPlaces = useMemo(() => {
    const ranked = rankPlaces(places);
    return ranked.filter(p => !skippedIds.has(p.google_place_id));
  }, [places, skippedIds]);

  // Current place is the first in the filtered list
  const currentPlace = rankedPlaces[0] || null;

  // Selected place ID for marker highlighting
  const selectedPlaceId = currentPlace?.google_place_id || null;

  // Animate map to current place when it changes
  useEffect(() => {
    if (currentPlace && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: currentPlace.location.lat,
          longitude: currentPlace.location.lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        500 // animation duration in ms
      );
    }
  }, [currentPlace?.google_place_id]);

  const handleSkip = (place: Place) => {
    setSkippedIds(prev => new Set([...prev, place.google_place_id]));
  };

  const handleSave = async (place: Place) => {
    const success = await save(place.google_place_id);
    if (success) {
      console.log('Saved:', place.name);
    }
    // Move to next place regardless of save success
    setSkippedIds(prev => new Set([...prev, place.google_place_id]));
  };

  const handleConsider = (place: Place) => {
    // Add to "consider now" temp list
    setNowList(prev => [...prev, place]);
    // Also add to skippedIds so we advance to next card
    setSkippedIds(prev => new Set([...prev, place.google_place_id]));
    console.log('Considering:', place.name);
  };

  // Generate photo URL for current place
  const photoUrl = currentPlace?.google_place_id && token
    ? getPhotoUrl(currentPlace.google_place_id, token)
    : undefined;

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
        ref={mapRef}
        style={styles.map}
        initialRegion={location}
        showsUserLocation
        showsMyLocationButton
      >
        {places.map((place) => (
          <PlaceMarker
            key={place.google_place_id}
            place={place}
            isSelected={place.google_place_id === selectedPlaceId}
            onPress={(p) => console.log('Tapped:', p.name)}
          />
        ))}
      </MapView>

      {/* "Consider now" count badge */}
      {nowList.length > 0 && (
        <View style={[styles.countBadge, { top: insets.top + 16 }]}>
          <Text style={styles.countBadgeText}>
            {nowList.length} considering
          </Text>
        </View>
      )}

      {/* Bottom card container */}
      <View style={styles.bottomContainer}>
        {placesLoading && !currentPlace && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color="#1F2937" />
            <Text style={styles.loadingCardText}>Finding restaurants...</Text>
          </View>
        )}

        {placesError && !currentPlace && (
          <View style={styles.errorCard}>
            <Text style={styles.errorCardText}>{placesError}</Text>
          </View>
        )}

        {currentPlace && (
          <SwipeableBottomCard
            place={currentPlace}
            photoUrl={photoUrl}
            onSkip={handleSkip}
            onSave={handleSave}
            onConsider={handleConsider}
          />
        )}

        {!placesLoading && !placesError && !currentPlace && places.length > 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>No more restaurants nearby</Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setSkippedIds(new Set());
                setNowList([]);
              }}
            >
              <Text style={styles.resetButtonText}>Start Over</Text>
            </TouchableOpacity>
          </View>
        )}
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
  countBadge: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#F97316',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 100, // Above tab bar
    left: 16,
    right: 16,
    alignItems: 'center',
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
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingCardText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  errorCardText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyCardText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  resetButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SwipeableCard } from './SwipeableCard';
import { Place } from './PlaceMarker';

interface RestaurantPickerProps {
  places: Place[];
  loading: boolean;
  error: string | null;
  onLike: (place: Place) => void;
}

export function RestaurantPicker({ places, loading, error, onLike }: RestaurantPickerProps) {
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());

  // Filter out skipped places
  const availablePlaces = places.filter((p) => !skippedIds.has(p.google_place_id));
  const currentPlace = availablePlaces[0];

  const handleSkip = useCallback((place: Place) => {
    setSkippedIds((prev) => new Set(prev).add(place.google_place_id));
  }, []);

  const handleLike = useCallback(
    (place: Place) => {
      // Remove from stack and notify parent
      setSkippedIds((prev) => new Set(prev).add(place.google_place_id));
      onLike(place);
    },
    [onLike]
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Finding restaurants...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!currentPlace) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No more restaurants nearby</Text>
        <Text style={styles.hintText}>Try expanding your search area</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SwipeableCard
        key={currentPlace.google_place_id}
        place={currentPlace}
        onSkip={handleSkip}
        onLike={handleLike}
      />
      <Text style={styles.countText}>{availablePlaces.length} restaurants nearby</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
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
    color: '#EF4444',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  hintText: {
    fontSize: 14,
    color: '#6B7280',
  },
  countText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
});

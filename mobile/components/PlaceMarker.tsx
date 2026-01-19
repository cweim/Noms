import { Marker, Callout } from 'react-native-maps';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface Place {
  google_place_id: string;
  name: string;
  address?: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
}

interface PlaceMarkerProps {
  place: Place;
  onPress?: (place: Place) => void;
  isSelected?: boolean;
}

export function PlaceMarker({ place, onPress, isSelected = false }: PlaceMarkerProps) {
  return (
    <Marker
      coordinate={{
        latitude: place.location.lat,
        longitude: place.location.lng,
      }}
      onPress={() => onPress?.(place)}
      zIndex={isSelected ? 1000 : 1}
    >
      {/* Custom marker view - warm orange color to match brand */}
      <View style={[
        styles.markerContainer,
        isSelected && styles.markerSelected
      ]}>
        <Ionicons
          name="restaurant"
          size={isSelected ? 28 : 20}
          color="#FFFFFF"
        />
      </View>

      {/* Callout shown when marker is tapped */}
      <Callout>
        <View style={styles.callout}>
          <Text style={styles.calloutTitle}>{place.name}</Text>
          {place.rating && (
            <Text style={styles.calloutRating}>{place.rating.toFixed(1)}</Text>
          )}
          {place.address && (
            <Text style={styles.calloutAddress} numberOfLines={1}>
              {place.address}
            </Text>
          )}
        </View>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    backgroundColor: '#F97316',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  markerSelected: {
    backgroundColor: '#EA580C',
    borderRadius: 28,
    padding: 14,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  callout: {
    width: 200,
    padding: 8,
    backgroundColor: '#FFFFFF',
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  calloutRating: {
    fontSize: 12,
    color: '#F97316',
    marginBottom: 4,
  },
  calloutAddress: {
    fontSize: 12,
    color: '#6B7280',
  },
});

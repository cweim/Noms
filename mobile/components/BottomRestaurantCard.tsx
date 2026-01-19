import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Place } from './PlaceMarker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32; // 16px padding on each side
const CARD_HEIGHT = 120;
const PHOTO_SIZE = 100;

interface BottomRestaurantCardProps {
  place: Place;
  photoUrl?: string;
  onSkip: (place: Place) => void;
  onSave: (place: Place) => void;
}

export function BottomRestaurantCard({ place, photoUrl, onSkip, onSave }: BottomRestaurantCardProps) {
  return (
    <View style={styles.card}>
      {/* Photo thumbnail */}
      <View style={styles.photoContainer}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="restaurant" size={32} color="#9CA3AF" />
          </View>
        )}
      </View>

      {/* Info section */}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>{place.name}</Text>

        {place.rating && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#F97316" />
            <Text style={styles.rating}>{place.rating.toFixed(1)}</Text>
          </View>
        )}

        {place.address && (
          <Text style={styles.address} numberOfLines={1}>{place.address}</Text>
        )}
      </View>

      {/* Action buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.skipButton]}
          onPress={() => onSkip(place)}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color="#EF4444" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={() => onSave(place)}
          activeOpacity={0.7}
        >
          <Ionicons name="heart" size={24} color="#22C55E" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  photoContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 13,
    fontWeight: '500',
    color: '#F97316',
    marginLeft: 4,
  },
  address: {
    fontSize: 13,
    color: '#6B7280',
  },
  buttonsContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  skipButton: {
    backgroundColor: '#FEE2E2',
  },
  saveButton: {
    backgroundColor: '#DCFCE7',
  },
});

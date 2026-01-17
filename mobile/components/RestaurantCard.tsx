import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Place } from './PlaceMarker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40; // 20px margin on each side
const CARD_HEIGHT = CARD_WIDTH * 1.33; // 3:4 aspect ratio

interface RestaurantCardProps {
  place: Place;
  photoUrl?: string;
}

export function RestaurantCard({ place, photoUrl }: RestaurantCardProps) {
  return (
    <View style={styles.card}>
      {/* Photo placeholder or actual image */}
      <View style={styles.imageContainer}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="restaurant" size={48} color="#9CA3AF" />
          </View>
        )}
      </View>

      {/* Restaurant info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{place.name}</Text>

        <View style={styles.ratingRow}>
          {place.rating && (
            <>
              <Ionicons name="star" size={16} color="#F97316" />
              <Text style={styles.rating}>{place.rating.toFixed(1)}</Text>
            </>
          )}
        </View>

        {place.address && (
          <Text style={styles.address} numberOfLines={2}>{place.address}</Text>
        )}
      </View>

      {/* Swipe hint icons */}
      <View style={styles.hintContainer}>
        <View style={styles.hintLeft}>
          <Ionicons name="close" size={24} color="#EF4444" />
        </View>
        <View style={styles.hintRight}>
          <Ionicons name="heart" size={24} color="#22C55E" />
        </View>
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
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  imageContainer: {
    height: '60%',
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  info: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F97316',
    marginLeft: 4,
  },
  address: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  hintContainer: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  hintLeft: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  hintRight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

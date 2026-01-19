import { useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Place } from './PlaceMarker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = 120;
const PHOTO_SIZE = 100;
const SWIPE_UP_THRESHOLD = 50;

interface SwipeableBottomCardProps {
  place: Place;
  photoUrl?: string;
  onSkip: (place: Place) => void;
  onSave: (place: Place) => void;
  onConsider: (place: Place) => void;
  onPress?: (place: Place) => void;
}

export function SwipeableBottomCard({
  place,
  photoUrl,
  onSkip,
  onSave,
  onConsider,
  onPress,
}: SwipeableBottomCardProps) {
  const pan = useRef(new Animated.ValueXY()).current;

  // Keep a ref to current place to avoid stale closure in panResponder
  const placeRef = useRef(place);
  placeRef.current = place;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        // Only respond to primarily vertical movements (swipe up)
        return Math.abs(gesture.dy) > 5 && Math.abs(gesture.dy) > Math.abs(gesture.dx);
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < -SWIPE_UP_THRESHOLD) {
          // Swiped up - Consider
          Animated.timing(pan, {
            toValue: { x: 0, y: -500 },
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            onConsider(placeRef.current);
            pan.setValue({ x: 0, y: 0 });
          });
        } else {
          // Return to original position
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // Scale up slightly as card lifts
  const scale = pan.y.interpolate({
    inputRange: [-SWIPE_UP_THRESHOLD, 0],
    outputRange: [1.02, 1],
    extrapolate: 'clamp',
  });

  // Consider overlay opacity (orange tint)
  const considerOpacity = pan.y.interpolate({
    inputRange: [-SWIPE_UP_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const animatedStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { scale },
    ],
  };

  return (
    <Animated.View
      style={[styles.cardWrapper, animatedStyle]}
      {...panResponder.panHandlers}
    >
      {/* Swipe up hint - above card */}
      <View style={styles.swipeHint}>
        <Ionicons name="chevron-up" size={16} color="#6B7280" />
        <Text style={styles.swipeHintText}>Swipe up to consider</Text>
      </View>

      <View style={styles.card}>
        {/* Tappable area: photo + info */}
        <TouchableOpacity
          style={styles.tappableArea}
          onPress={() => onPress?.(place)}
          activeOpacity={0.7}
          disabled={!onPress}
        >
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
        </TouchableOpacity>

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

        {/* Consider overlay (orange tint when swiping up) */}
        <Animated.View style={[styles.considerOverlay, { opacity: considerOpacity }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    alignItems: 'center',
  },
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
    overflow: 'hidden',
  },
  tappableArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  considerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#F97316',
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  swipeHintText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500',
  },
});

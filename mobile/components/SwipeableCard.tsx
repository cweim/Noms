import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Place } from './PlaceMarker';
import { RestaurantCard } from './RestaurantCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3; // 30% of screen width to trigger action

interface SwipeableCardProps {
  place: Place;
  photoUrl?: string;
  onSkip: (place: Place) => void;
  onLike: (place: Place) => void;
}

export function SwipeableCard({ place, photoUrl, onSkip, onLike }: SwipeableCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const handleSkip = () => {
    onSkip(place);
  };

  const handleLike = () => {
    onLike(place);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      // Slight vertical movement for natural feel
      translateY.value = event.translationY * 0.3;
    })
    .onEnd(() => {
      if (translateX.value > SWIPE_THRESHOLD) {
        // Swiped right - Like
        translateX.value = withSpring(SCREEN_WIDTH * 1.5);
        runOnJS(handleLike)();
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        // Swiped left - Skip
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5);
        runOnJS(handleSkip)();
      } else {
        // Return to center
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-15, 0, 15],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  // Opacity for swipe indicators based on swipe direction
  const likeOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const skipOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <RestaurantCard place={place} photoUrl={photoUrl} />
        {/* Overlay indicators that appear during swipe */}
        <Animated.View style={[styles.likeOverlay, likeOpacityStyle]} />
        <Animated.View style={[styles.skipOverlay, skipOpacityStyle]} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#22C55E',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  skipOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
});

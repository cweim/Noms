import { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Place } from './PlaceMarker';
import { getPhotoUrl } from '../lib/api';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_HEIGHT = SCREEN_HEIGHT * 0.6;
const ITEM_HEIGHT = 70;
const PHOTO_SIZE = 50;

interface TempListOverlayProps {
  places: Place[];
  token: string | null;
  onRemove: (place: Place) => void;
  onLocate: (place: Place) => void;
  onClose: () => void;
  onDone: () => void;
}

export function TempListOverlay({
  places,
  token,
  onRemove,
  onLocate,
  onClose,
  onDone,
}: TempListOverlayProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(MAX_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    // Animate out then call onClose
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: MAX_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const handleDonePress = () => {
    // Show confirmation modal
    setShowConfirm(true);
  };

  const confirmDone = () => {
    setShowConfirm(false);
    // Animate out then call onDone (clears list and restarts)
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: MAX_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDone());
  };

  const handleLocate = (place: Place) => {
    // Close overlay and center map on selected place
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: MAX_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onLocate(place));
  };

  // Calculate content height (header + items + padding)
  const contentHeight = Math.min(
    60 + places.length * ITEM_HEIGHT + 16 + insets.bottom,
    MAX_HEIGHT
  );

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View
          style={[
            styles.backdrop,
            { opacity: backdropAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.5],
            }) },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Overlay card */}
      <Animated.View
        style={[
          styles.overlay,
          {
            height: contentHeight,
            paddingBottom: insets.bottom + 16,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Considering ({places.length})
          </Text>
          <TouchableOpacity onPress={handleDonePress} style={styles.doneButton}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Place list */}
        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
        >
          {places.map((place) => (
            <TouchableOpacity
              key={place.google_place_id}
              style={styles.placeItem}
              onPress={() => handleLocate(place)}
              activeOpacity={0.7}
            >
              {/* Photo */}
              <View style={styles.photoContainer}>
                {token ? (
                  <Image
                    source={{ uri: getPhotoUrl(place.google_place_id, token, 120) }}
                    style={styles.photo}
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="restaurant" size={24} color="#9CA3AF" />
                  </View>
                )}
              </View>

              {/* Info */}
              <View style={styles.infoContainer}>
                <Text style={styles.placeName} numberOfLines={1}>
                  {place.name}
                </Text>
                {place.rating && (
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#F97316" />
                    <Text style={styles.rating}>{place.rating.toFixed(1)}</Text>
                  </View>
                )}
              </View>

              {/* Info button - navigate to details */}
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => router.push({
                  pathname: '/place/[id]',
                  params: { id: place.google_place_id },
                })}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="information-circle-outline" size={22} color="#6B7280" />
              </TouchableOpacity>

              {/* Remove button */}
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemove(place)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>🍽️</Text>
            <Text style={styles.modalTitle}>Time to eat!</Text>
            <Text style={styles.modalMessage}>
              Ready to head out? This will clear your list so you can start fresh next time.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={styles.modalCancelText}>Keep Looking</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmDone}
              >
                <Text style={styles.modalConfirmText}>Let's Go!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  doneButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ITEM_HEIGHT,
    paddingVertical: 10,
  },
  photoContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 8,
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
  placeName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 13,
    fontWeight: '500',
    color: '#F97316',
    marginLeft: 4,
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  modalEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F97316',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

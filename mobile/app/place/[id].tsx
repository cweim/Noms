import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getPlaceDetails, getPhotoUrlFromReference, getAuthToken, PlaceDetails } from '../../lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_WIDTH = SCREEN_WIDTH - 40;
const PHOTO_HEIGHT = 200;

export default function PlaceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [details, setDetails] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showAllHours, setShowAllHours] = useState(false);

  useEffect(() => {
    getAuthToken().then(setToken);
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPlaceDetails(id);
        setDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const handleCall = () => {
    if (details?.phone) {
      Linking.openURL(`tel:${details.phone}`);
    }
  };

  const handleWebsite = () => {
    if (details?.website) {
      Linking.openURL(details.website);
    }
  };

  const handleAddress = () => {
    if (details?.address) {
      const query = encodeURIComponent(details.address);
      const url = Platform.select({
        ios: `maps://?q=${query}`,
        android: `geo:0,0?q=${query}`,
        default: `https://www.google.com/maps/search/?api=1&query=${query}`,
      });
      Linking.openURL(url);
    }
  };

  const formatPriceLevel = (level: number | null) => {
    if (!level) return null;
    return '$'.repeat(level);
  };

  const formatTypes = (types: string[]) => {
    if (!types || types.length === 0) return null;
    return types
      .slice(0, 2)
      .map(t => t.replace(/_/g, ' '))
      .map(t => t.charAt(0).toUpperCase() + t.slice(1))
      .join(' • ');
  };

  const renderPhoto = ({ item }: { item: { photo_reference: string } }) => {
    if (!token) return null;
    return (
      <Image
        source={{ uri: getPhotoUrlFromReference(item.photo_reference, token, 800) }}
        style={styles.photo}
        resizeMode="cover"
      />
    );
  };

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#1F2937" />
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  if (error || !details) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>{error || 'Failed to load details'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const priceLevel = formatPriceLevel(details.price_level);
  const types = formatTypes(details.types);
  const isOpen = details.opening_hours?.open_now;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Photo Gallery */}
        {details.photos && details.photos.length > 0 && token && (
          <FlatList
            data={details.photos}
            renderItem={renderPhoto}
            keyExtractor={(item, index) => `${item.photo_reference}-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.photoGallery}
            snapToInterval={PHOTO_WIDTH + 16}
            decelerationRate="fast"
            contentContainerStyle={styles.photoGalleryContent}
          />
        )}

        {/* Name and Rating */}
        <View style={styles.section}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{details.name}</Text>
            {details.rating && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#F97316" />
                <Text style={styles.rating}>{details.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>

          {/* Meta row: price, type, open status */}
          <View style={styles.metaRow}>
            {priceLevel && <Text style={styles.metaText}>{priceLevel}</Text>}
            {priceLevel && types && <Text style={styles.metaDot}>•</Text>}
            {types && <Text style={styles.metaText}>{types}</Text>}
            {(priceLevel || types) && isOpen !== null && isOpen !== undefined && (
              <Text style={styles.metaDot}>•</Text>
            )}
            {isOpen !== null && isOpen !== undefined && (
              <Text style={[styles.metaText, isOpen ? styles.openText : styles.closedText]}>
                {isOpen ? 'Open now' : 'Closed'}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Contact Info */}
        <View style={styles.section}>
          {details.address && (
            <TouchableOpacity style={styles.contactRow} onPress={handleAddress}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <Text style={styles.contactText}>{details.address}</Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}

          {details.phone && (
            <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
              <Ionicons name="call-outline" size={20} color="#6B7280" />
              <Text style={styles.contactText}>{details.phone}</Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}

          {details.website && (
            <TouchableOpacity style={styles.contactRow} onPress={handleWebsite}>
              <Ionicons name="globe-outline" size={20} color="#6B7280" />
              <Text style={[styles.contactText, styles.websiteText]} numberOfLines={1}>
                {details.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Hours */}
        {details.opening_hours?.weekday_text && details.opening_hours.weekday_text.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.hoursHeader}
                onPress={() => setShowAllHours(!showAllHours)}
              >
                <Ionicons name="time-outline" size={20} color="#6B7280" />
                <Text style={styles.hoursTitle}>Hours</Text>
                <Ionicons
                  name={showAllHours ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#9CA3AF"
                />
              </TouchableOpacity>

              {showAllHours && (
                <View style={styles.hoursList}>
                  {details.opening_hours.weekday_text.map((text, index) => (
                    <Text key={index} style={styles.hoursText}>
                      {text}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        {/* Bottom padding */}
        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    marginTop: 12,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  photoGallery: {
    height: PHOTO_HEIGHT,
  },
  photoGalleryContent: {
    paddingHorizontal: 20,
  },
  photo: {
    width: PHOTO_WIDTH,
    height: PHOTO_HEIGHT,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#F3F4F6',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F97316',
    marginLeft: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  metaDot: {
    fontSize: 14,
    color: '#9CA3AF',
    marginHorizontal: 8,
  },
  openText: {
    color: '#22C55E',
    fontWeight: '500',
  },
  closedText: {
    color: '#EF4444',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  contactText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    marginLeft: 12,
  },
  websiteText: {
    color: '#3B82F6',
  },
  hoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hoursTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 12,
  },
  hoursList: {
    marginTop: 12,
    paddingLeft: 32,
  },
  hoursText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 24,
  },
});

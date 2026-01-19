import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useSavedPlaces, SavedPlace } from '../../lib/use-saved-places';
import { getAuthToken, getPhotoUrl } from '../../lib/api';

function SavedPlaceCard({ place, onUnsave, onPress, token }: { place: SavedPlace; onUnsave: (id: string) => void; onPress: () => void; token: string | null }) {
  const photoUrl = place.photo_reference && token
    ? getPhotoUrl(place.google_place_id, token)
    : null;

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {photoUrl && (
          <Image source={{ uri: photoUrl }} style={styles.cardImage} />
        )}
        <View style={styles.cardContent}>
          <Text style={styles.cardName} numberOfLines={1}>{place.name}</Text>
          {place.address && (
            <Text style={styles.cardAddress} numberOfLines={1}>{place.address}</Text>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.unsaveButton} onPress={() => onUnsave(place.id)}>
        <Text style={styles.unsaveText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function SavedScreen() {
  const { savedPlaces, loading, error, unsave, refetch } = useSavedPlaces();
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    getAuthToken().then(setToken);
  }, []);

  const onRefresh = async () => {
    // Refresh token too in case it changed
    getAuthToken().then(setToken);
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1F2937" />
        <Text style={styles.loadingText}>Loading saved places...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (savedPlaces.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>No saved places yet</Text>
        <Text style={styles.emptySubtitle}>Swipe right on restaurants you like to save them here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={savedPlaces}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SavedPlaceCard
            place={item}
            onUnsave={unsave}
            onPress={() => router.push({
              pathname: '/place/[id]',
              params: { id: item.google_place_id },
            })}
            token={token}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1F2937"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  cardContent: {
    padding: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardAddress: {
    fontSize: 14,
    color: '#6B7280',
  },
  unsaveButton: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 10,
    alignItems: 'center',
  },
  unsaveText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
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
    color: '#EF4444',
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
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

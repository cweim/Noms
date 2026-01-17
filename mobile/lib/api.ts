import { supabase } from './supabase';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

interface PlaceSearchParams {
  lat: number;
  lng: number;
  radius?: number;
  query?: string;
}

interface PlaceSearchResponse {
  places: Array<{
    id?: string;
    google_place_id: string;
    name: string;
    address?: string;
    location: { lat: number; lng: number };
    photo_reference?: string;
    types?: string[];
    rating?: number;
    price_level?: number;
    open_now?: boolean;
  }>;
  count: number;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

export async function searchPlaces({
  lat,
  lng,
  radius = 1000,
  query = 'restaurant',
}: PlaceSearchParams): Promise<PlaceSearchResponse> {
  const headers = await getAuthHeaders();
  const params = new URLSearchParams({
    q: query,
    lat: lat.toString(),
    lng: lng.toString(),
    radius: radius.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/api/places/search?${params}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  return response.json();
}

// Types for saves
export interface SavedPlace {
  id: string;
  place_id: string;
  google_place_id: string;
  name: string;
  address: string | null;
  photo_reference: string | null;
  saved_at: string;
  list_id: string | null;
}

export interface SavedPlacesResponse {
  places: SavedPlace[];
  count: number;
}

// Save a place
export async function savePlace(googlePlaceId: string): Promise<SavedPlace> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/saves/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ google_place_id: googlePlaceId }),
  });

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error('Already saved');
    }
    throw new Error('Failed to save place');
  }

  return response.json();
}

// Get saved places
export async function getSavedPlaces(): Promise<SavedPlacesResponse> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/saves/`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch saved places');
  }

  return response.json();
}

// Unsave a place
export async function unsavePlace(saveId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/saves/${saveId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok && response.status !== 204) {
    throw new Error('Failed to unsave place');
  }
}

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

// Journal types
export interface JournalEntry {
  id: string;
  photo_url: string;
  place_id: string | null;
  google_place_id: string | null;
  place_name: string | null;
  rating: number | null;
  note: string | null;
  eaten_at: string;
  created_at: string;
}

export interface JournalEntriesResponse {
  entries: JournalEntry[];
  count: number;
}

export interface CreateJournalEntryRequest {
  photo_url: string;
  google_place_id?: string;
  rating?: number;
  note?: string;
  eaten_at?: string;
}

export async function createJournalEntry(
  data: CreateJournalEntryRequest
): Promise<JournalEntry> {
  const response = await fetch(`${API_BASE_URL}/api/journal/`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create journal entry');
  }

  return response.json();
}

export async function getJournalEntries(): Promise<JournalEntriesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/journal/`, {
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch journal entries');
  }

  return response.json();
}

export async function deleteJournalEntry(entryId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/journal/${entryId}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });

  if (!response.ok && response.status !== 404) {
    throw new Error('Failed to delete journal entry');
  }
}

// Get current auth token for use in image URLs
export async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// Generate authenticated photo URL
export function getPhotoUrl(googlePlaceId: string, token: string, maxWidth: number = 400): string {
  return `${API_BASE_URL}/api/places/${googlePlaceId}/photo?max_width=${maxWidth}&token=${encodeURIComponent(token)}`;
}

// Generate photo URL from photo_reference (for gallery photos)
export function getPhotoUrlFromReference(photoReference: string, token: string, maxWidth: number = 800): string {
  return `${API_BASE_URL}/api/places/photo?photo_reference=${encodeURIComponent(photoReference)}&max_width=${maxWidth}&token=${encodeURIComponent(token)}`;
}

// Place details types
export interface PlaceDetails {
  place_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  rating: number | null;
  price_level: number | null;
  opening_hours: {
    open_now: boolean | null;
    weekday_text: string[] | null;
  } | null;
  photos: Array<{
    photo_reference: string;
    height: number | null;
    width: number | null;
  }>;
  types: string[];
  lat: number | null;
  lng: number | null;
}

// Get comprehensive place details
export async function getPlaceDetails(googlePlaceId: string): Promise<PlaceDetails> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/places/${googlePlaceId}/details`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch place details');
  }

  return response.json();
}

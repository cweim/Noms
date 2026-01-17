import { supabase } from './supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

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

  const response = await fetch(`${API_URL}/api/places/search?${params}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  return response.json();
}

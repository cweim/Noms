import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';
import 'react-native-url-polyfill/auto';

export interface PhotoUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Request camera permissions
 */
export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

/**
 * Request media library permissions
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

/**
 * Pick an image from the device's media library
 */
export async function pickImage(): Promise<ImagePicker.ImagePickerResult> {
  // Request permission first to avoid post-selection dialog
  await requestMediaLibraryPermission();

  return ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
}

/**
 * Take a photo with the camera
 */
export async function takePhoto(): Promise<ImagePicker.ImagePickerResult> {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    return { canceled: true, assets: null };
  }

  return ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
}

/**
 * Upload an image to Supabase Storage
 * @param uri Local file URI from image picker
 * @param userId User ID for organizing uploads
 */
export async function uploadPhoto(uri: string, userId: string): Promise<PhotoUploadResult> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${userId}/${timestamp}.${extension}`;

    // Fetch the image as a blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Convert blob to ArrayBuffer for Supabase
    const arrayBuffer = await new Response(blob).arrayBuffer();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('journal-photos')
      .upload(filename, arrayBuffer, {
        contentType: `image/${extension}`,
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('journal-photos')
      .getPublicUrl(data.path);

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error('Photo upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Delete a photo from Supabase Storage
 * @param url Public URL of the photo
 */
export async function deletePhoto(url: string): Promise<boolean> {
  try {
    // Extract path from URL
    const urlParts = url.split('/journal-photos/');
    if (urlParts.length < 2) return false;

    const path = urlParts[1];
    const { error } = await supabase.storage
      .from('journal-photos')
      .remove([path]);

    return !error;
  } catch {
    return false;
  }
}

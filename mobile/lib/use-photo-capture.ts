import { useState, useCallback } from 'react';
import {
  pickImage,
  takePhoto,
  uploadPhoto,
  PhotoUploadResult,
} from './photo-upload';
import { supabase } from './supabase';

export interface UsePhotoCaptureResult {
  photoUri: string | null;
  photoUrl: string | null;
  uploading: boolean;
  error: string | null;
  selectFromLibrary: () => Promise<void>;
  captureWithCamera: () => Promise<void>;
  uploadSelectedPhoto: () => Promise<PhotoUploadResult>;
  clearPhoto: () => void;
}

export function usePhotoCapture(): UsePhotoCaptureResult {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectFromLibrary = useCallback(async () => {
    setError(null);
    const result = await pickImage();

    if (!result.canceled && result.assets?.[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoUrl(null); // Clear any previous upload
    }
  }, []);

  const captureWithCamera = useCallback(async () => {
    setError(null);
    const result = await takePhoto();

    if (!result.canceled && result.assets?.[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoUrl(null);
    }
  }, []);

  const uploadSelectedPhoto = useCallback(async (): Promise<PhotoUploadResult> => {
    if (!photoUri) {
      return { success: false, error: 'No photo selected' };
    }

    setUploading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const err = 'Must be logged in to upload';
        setError(err);
        return { success: false, error: err };
      }

      const result = await uploadPhoto(photoUri, user.id);

      if (result.success && result.url) {
        setPhotoUrl(result.url);
      } else {
        setError(result.error || 'Upload failed');
      }

      return result;
    } finally {
      setUploading(false);
    }
  }, [photoUri]);

  const clearPhoto = useCallback(() => {
    setPhotoUri(null);
    setPhotoUrl(null);
    setError(null);
  }, []);

  return {
    photoUri,
    photoUrl,
    uploading,
    error,
    selectFromLibrary,
    captureWithCamera,
    uploadSelectedPhoto,
    clearPhoto,
  };
}

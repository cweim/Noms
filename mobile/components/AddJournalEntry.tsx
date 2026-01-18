import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { usePhotoCapture } from '../lib/use-photo-capture';
import { CreateJournalEntryRequest } from '../lib/api';

interface AddJournalEntryProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateJournalEntryRequest) => Promise<boolean>;
}

const RATINGS = [1, 2, 3, 4, 5];

export function AddJournalEntry({ visible, onClose, onSubmit }: AddJournalEntryProps) {
  const {
    photoUri,
    photoUrl,
    uploading,
    error: photoError,
    selectFromLibrary,
    captureWithCamera,
    uploadSelectedPhoto,
    clearPhoto,
  } = usePhotoCapture();

  const [rating, setRating] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    clearPhoto();
    setRating(null);
    setNote('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!photoUri) {
      Alert.alert('Photo required', 'Please select or take a photo');
      return;
    }

    setSubmitting(true);

    try {
      // Upload photo first
      const uploadResult = await uploadSelectedPhoto();
      if (!uploadResult.success || !uploadResult.url) {
        Alert.alert('Upload failed', uploadResult.error || 'Could not upload photo');
        return;
      }

      // Create entry
      const success = await onSubmit({
        photo_url: uploadResult.url,
        rating: rating || undefined,
        note: note.trim() || undefined,
      });

      if (success) {
        handleClose();
      } else {
        Alert.alert('Error', 'Failed to save journal entry');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = uploading || submitting;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} disabled={isLoading}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>New Entry</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={isLoading || !photoUri}>
            <Text style={[styles.saveText, (!photoUri || isLoading) && styles.disabled]}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Photo Section */}
          <View style={styles.photoSection}>
            {photoUri ? (
              <View style={styles.photoPreview}>
                <Image source={{ uri: photoUri }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.changePhotoButton}
                  onPress={selectFromLibrary}
                  disabled={isLoading}
                >
                  <Text style={styles.changePhotoText}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoButtons}>
                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={captureWithCamera}
                  disabled={isLoading}
                >
                  <Text style={styles.photoButtonText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={selectFromLibrary}
                  disabled={isLoading}
                >
                  <Text style={styles.photoButtonText}>Choose from Library</Text>
                </TouchableOpacity>
              </View>
            )}
            {photoError && <Text style={styles.errorText}>{photoError}</Text>}
          </View>

          {/* Rating Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>How was it? (optional)</Text>
            <View style={styles.ratingRow}>
              {RATINGS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.ratingButton, rating === r && styles.ratingSelected]}
                  onPress={() => setRating(rating === r ? null : r)}
                  disabled={isLoading}
                >
                  <Text style={[styles.ratingText, rating === r && styles.ratingTextSelected]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Note Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Note (optional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="What did you have?"
              placeholderTextColor="#9CA3AF"
              value={note}
              onChangeText={setNote}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
          </View>
        </ScrollView>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#1F2937" />
            <Text style={styles.loadingText}>
              {uploading ? 'Uploading photo...' : 'Saving entry...'}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  disabled: {
    color: '#9CA3AF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  photoSection: {
    marginBottom: 24,
  },
  photoButtons: {
    gap: 12,
  },
  photoButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  photoPreview: {
    alignItems: 'center',
  },
  photo: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  changePhotoButton: {
    marginTop: 12,
    padding: 8,
  },
  changePhotoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 12,
  },
  ratingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  ratingSelected: {
    backgroundColor: '#1F2937',
    borderColor: '#1F2937',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  ratingTextSelected: {
    color: '#FFFFFF',
  },
  noteInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
});

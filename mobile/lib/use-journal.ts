import { useState, useEffect, useCallback } from 'react';
import {
  JournalEntry,
  getJournalEntries,
  createJournalEntry,
  deleteJournalEntry,
  CreateJournalEntryRequest,
} from './api';

export interface UseJournalResult {
  entries: JournalEntry[];
  loading: boolean;
  error: string | null;
  create: (data: CreateJournalEntryRequest) => Promise<boolean>;
  remove: (entryId: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useJournal(): UseJournalResult {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getJournalEntries();
      setEntries(response.entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load journal');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const create = useCallback(async (data: CreateJournalEntryRequest): Promise<boolean> => {
    try {
      const newEntry = await createJournalEntry(data);
      // Add to beginning of list (most recent first)
      setEntries((prev) => [newEntry, ...prev]);
      return true;
    } catch (err) {
      console.error('Create entry failed:', err);
      return false;
    }
  }, []);

  const remove = useCallback(async (entryId: string): Promise<boolean> => {
    // Optimistic update
    const previousEntries = entries;
    setEntries((prev) => prev.filter((e) => e.id !== entryId));

    try {
      await deleteJournalEntry(entryId);
      return true;
    } catch (err) {
      // Rollback on error
      setEntries(previousEntries);
      console.error('Delete entry failed:', err);
      return false;
    }
  }, [entries]);

  return {
    entries,
    loading,
    error,
    create,
    remove,
    refetch: fetchEntries,
  };
}

export type { JournalEntry };

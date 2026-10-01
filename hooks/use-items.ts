import { useUserId } from '@/contexts/user-context';
import { errorMessage, itemsApi } from '@/lib/api';
import type { Item, ItemCounts, ItemFilter, ItemUpdate } from '@/models';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

const EMPTY_COUNTS: ItemCounts = { today: 0, notes: 0, all: 0, completed: 0 };

export function useItems(filter: ItemFilter) {
  const userId = useUserId();
  const [items, setItems] = useState<Item[]>([]);
  const [counts, setCounts] = useState<ItemCounts>(EMPTY_COUNTS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const refetch = useCallback(
    async (mode: 'initial' | 'refresh' | 'silent' = 'silent') => {
      const id = ++requestId.current;
      if (mode === 'initial') setLoading(true);
      if (mode === 'refresh') setRefreshing(true);

      try {
        const [list, nextCounts] = await Promise.all([
          itemsApi.list(userId, filter),
          itemsApi.counts(userId),
        ]);

        if (id !== requestId.current) return;

        setItems(list);
        setCounts(nextCounts);
        setError(null);
      } catch (err) {
        if (id !== requestId.current) return;

        setError(errorMessage(err));
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [userId, filter],
  );

  useFocusEffect(
    useCallback(() => {
      void refetch(items.length === 0 ? 'initial' : 'silent');
      // Only re-run when the user or filter changes, not on every items update.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetch]),
  );

  const updateItem = useCallback(
    async (id: string, patch: ItemUpdate) => {
      const updated = await itemsApi.update(userId, id, patch);
      setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
      // Counts (completed, today) may have shifted.
      itemsApi
        .counts(userId)
        .then(setCounts)
        .catch(() => undefined);
      return updated;
    },
    [userId],
  );

  return { items, counts, loading, refreshing, error, refetch, updateItem };
}

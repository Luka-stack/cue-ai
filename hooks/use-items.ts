import { useUserId } from '@/contexts/user-context';
import { errorMessage, itemsApi } from '@/lib/api';
import type { Item, ItemFilter, ItemUpdate } from '@/models';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

export function useItems<T extends Item>(filter: ItemFilter) {
  const userId = useUserId();
  const [items, setItems] = useState<T[]>([]);
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
        const list = (await itemsApi.list(userId, filter)) as T[];

        if (id !== requestId.current) return;

        setItems(list);
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
      const updated = (await itemsApi.update(userId, id, patch)) as T;
      setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
      return updated;
    },
    [userId],
  );

  return { items, loading, refreshing, error, refetch, updateItem };
}

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useUserId } from '@/contexts/user-context';
import { errorMessage, itemsApi } from '@/lib/api';
import { formatDateTime, formatMinutes } from '@/lib/format';
import { X } from '@/lib/icons';
import type { Item } from '@/models';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ItemDetailScreen() {
  const router = useRouter();
  const userId = useUserId();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    itemsApi
      .get(userId, id)
      .then((fetched) => {
        if (!cancelled) setItem(fetched);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, id]);

  const date = item?.type === 'todo' ? formatDateTime(item.date) : null;
  const effort =
    item?.type === 'todo' ? formatMinutes(item.time_to_complete) : null;
  const solutions =
    item?.type === 'todo' ? (item.solutions ?? []).filter(Boolean) : [];

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-row items-center px-4 pb-4 pt-2">
        <Button
          onPress={() => router.back()}
          variant="outline"
          className="size-10 rounded-full border-slate-100 bg-slate-100"
          accessibilityLabel="Back to list"
        >
          <X size={24} className="text-slate-600" />
        </Button>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#6366f1" />
        </View>
      ) : item ? (
        <ScrollView
          className="flex-1 px-5"
          contentContainerClassName="gap-3 pb-10"
        >
          <Text className="text-3xl font-extrabold tracking-tight">
            {item.title ?? 'Untitled'}
          </Text>

          {item.type === 'todo' ? (
            <View className="gap-1">
              {date ? <Text variant="muted">Due {date}</Text> : null}
              <Text variant="muted" className="capitalize">
                {item.status ?? (item.completed ? 'done' : 'not started')}
              </Text>
              {effort ? <Text variant="muted">Estimated {effort}</Text> : null}
            </View>
          ) : null}

          {item.content ? (
            <Text variant="p">{item.content}</Text>
          ) : (
            <Text variant="muted">No description.</Text>
          )}

          {solutions.length > 0 ? (
            <View className="mt-4 gap-1">
              <Text className="text-lg font-semibold">Ideas</Text>
              {solutions.map((solution, i) => (
                <Text key={i}>• {solution}</Text>
              ))}
            </View>
          ) : null}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-5">
          <Text variant="muted">{error ?? 'Item not found.'}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

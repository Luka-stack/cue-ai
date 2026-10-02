import { useFloatingTabBarInset } from '@/components/floating-tab-bar';
import { GradientTile } from '@/components/gradient-tile';
import { ItemTile } from '@/components/item-tile';

import { Text } from '@/components/ui/text';
import { useItems } from '@/hooks/use-items';
import { CalendarDays, Check, Inbox } from '@/lib/icons';
import type { ItemFilter } from '@/models';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from 'react-native';

const TILES = [
  {
    id: 'today',
    label: 'Today',
    icon: CalendarDays,
    colors: ['#4CB8F0', '#1F84E4'],
  },
  {
    id: 'all',
    label: 'All',
    icon: Inbox,
    colors: ['#5A5A5E', '#1C1C1E'],
  },
  {
    id: 'completed',
    label: 'Completed',
    icon: Check,
    colors: ['#B0B8C1', '#707C8A'],
  },
] as const satisfies readonly { id: ItemFilter; [key: string]: unknown }[];

type TodoFilter = (typeof TILES)[number]['id'];

const EMPTY_TEXT: Record<TodoFilter, string> = {
  all: 'Nothing captured yet. Tell the chat what is on your mind.',
  today: 'Nothing due today.',
  completed: 'Nothing completed yet.',
};

export default function TodosScreen() {
  const [filter, setFilter] = useState<TodoFilter>('all');
  const tabBarInset = useFloatingTabBarInset();
  const { items, counts, loading, refreshing, error, refetch, updateItem } =
    useItems(filter);

  return (
    <View
      className="flex-1 gap-3 px-3 pt-4"
    >
      <View className="flex-row gap-3">
        {TILES.map((tile) => (
          <GradientTile
            key={tile.id}
            {...tile}
            count={counts[tile.id]}
            active={filter === tile.id}
            onPress={() => setFilter(tile.id)}
          />
        ))}
      </View>

      {error ? (
        <View className="bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          <Text className="text-sm text-red-600">{error}</Text>
        </View>
      ) : null}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={items}
          contentContainerStyle={{ paddingBottom: tabBarInset }}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ItemTile
              item={item}
              onToggleCompleted={(completed) =>
                updateItem(item.id, { completed })
              }
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => refetch('refresh')}
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Text variant="muted" className="text-center">
                {EMPTY_TEXT[filter]}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

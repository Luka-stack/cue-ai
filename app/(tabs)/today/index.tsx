import { FLOATING_TAB_BAR_HEIGHT } from '@/components/floating-tab-bar';
import { GradientTile } from '@/components/gradient-tile';
import { ItemTile } from '@/components/item-tile';

import { Text } from '@/components/ui/text';
import { useItems } from '@/hooks/use-items';
import { CalendarClock, CalendarDays, Check, Inbox } from '@/lib/icons';
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
    id: 'notes',
    label: 'Notes',
    icon: CalendarClock,
    colors: ['#FF8A8A', '#EF4E5B'],
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

const EMPTY_TEXT: Record<ItemFilter, string> = {
  all: 'Nothing captured yet. Tell the chat what is on your mind.',
  today: 'Nothing due today.',
  notes: 'No notes yet.',
  completed: 'Nothing completed yet.',
};

export default function TodayScreen() {
  const [filter, setFilter] = useState<ItemFilter>('all');
  const { items, counts, loading, refreshing, error, refetch, updateItem } =
    useItems(filter);

  const renderTile = (index: number) => {
    const tile = TILES[index];
    return (
      <GradientTile
        {...tile}
        count={counts[tile.id]}
        active={filter === tile.id}
        onPress={() => setFilter(tile.id)}
      />
    );
  };

  return (
    <View
      className="flex-1 gap-3 px-3 pt-4"
      style={{ paddingBottom: FLOATING_TAB_BAR_HEIGHT }}
    >
      <View className="flex-row gap-3">
        {renderTile(0)}
        {renderTile(1)}
      </View>
      <View className="flex-row gap-3">
        {renderTile(2)}
        {renderTile(3)}
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

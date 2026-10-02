import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from 'react-native';

import { useFloatingTabBarInset } from '@/components/floating-tab-bar';
import { ItemTile } from '@/components/item-tile';
import { Text } from '@/components/ui/text';
import { useItems } from '@/hooks/use-items';

export default function NotesScreen() {
  const { items, loading, refreshing, error, refetch } = useItems('notes');
  const tabBarInset = useFloatingTabBarInset();

  return (
    <View className="flex-1 gap-3 px-3 pt-4">
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
          renderItem={({ item }) => <ItemTile item={item} />}
          contentContainerStyle={{ paddingBottom: tabBarInset }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => refetch('refresh')}
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Text variant="muted" className="text-center">
                No notes yet. Tell the chat what is on your mind.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

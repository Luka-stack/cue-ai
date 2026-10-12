import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from 'react-native';

import { useFloatingTabBarInset } from '@/components/floating-tab-bar';
import { NoteCard } from '@/components/note-card';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { useItems } from '@/hooks/use-items';
import { Plus } from '@/lib/icons';
import { Note } from '@/models';
import { useRouter } from 'expo-router';

export default function NotesScreen() {
  const router = useRouter();
  const { items, loading, refreshing, error, refetch } =
    useItems<Note>('notes');
  const tabBarInset = useFloatingTabBarInset();

  const subtitle = `${items.length} ${items.length === 1 ? 'note' : 'notes'}`;

  return (
    <View className="flex-1">
      <View className="flex-row items-start justify-between px-5 pt-3 pb-4">
        <View>
          <Text className="text-3xl font-bold tracking-tight">Notes</Text>
          <Text className="text-sm text-muted-foreground">{subtitle}</Text>
        </View>

        {/* <OverflowMenu
          items={[{ label: 'New Note', onPress: () => router.push('/note/new') }]}
        /> */}
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
        <>
          <FlatList
            data={items}
            keyExtractor={(note) => note.id}
            renderItem={({ item }) => <NoteCard note={item} />}
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingBottom: tabBarInset,
            }}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View className="h-2" />}
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

          <PressableScale
            onPress={() => router.push('/note/new')}
            scaleTo={0.9}
            accessibilityRole="button"
            accessibilityLabel="New note"
            containerStyle={{ position: 'absolute', bottom: 96, right: 16 }}
            className="h-12 w-12 items-center justify-center rounded-full bg-[#4F46E5] active:bg-[#3730A3]"
          >
            <Icon as={Plus} size={24} className="stroke-white" />
          </PressableScale>
        </>
      )}
    </View>
  );
}

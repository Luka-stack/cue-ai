import { useFloatingTabBarInset } from '@/components/floating-tab-bar';
import { TodoCard } from '@/components/todo-card';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { useItems } from '@/hooks/use-items';
import { groupTodos } from '@/lib/todos';
import type { ToDo } from '@/models';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  View,
} from 'react-native';

type Section = { key: 'open' | 'completed'; data: ToDo[] };

export default function TodosScreen() {
  const router = useRouter();
  const tabBarInset = useFloatingTabBarInset();
  const { items, loading, refreshing, error, refetch, updateItem } =
    useItems<ToDo>('todos');

  const { open, completed } = useMemo(() => groupTodos(items), [items]);

  const sections = useMemo<Section[]>(
    () =>
      [
        { key: 'open' as const, data: open },
        { key: 'completed' as const, data: completed },
      ].filter((section) => section.data.length > 0),
    [open, completed],
  );

  const subtitle = `${open.length} ${open.length === 1 ? 'to-do' : 'to-dos'}`;

  return (
    <View className="flex-1">
      <View className="flex-row items-start justify-between px-5 pt-3 pb-4">
        <View>
          <Text className="text-3xl font-bold tracking-tight">To-dos</Text>
          <Text className="text-sm text-muted-foreground">{subtitle}</Text>
        </View>

        {/* <OverflowMenu
          items={[
            {
              label: 'New to-do',
              icon: Plus,
              onPress: () => router.push('/todo/new'),
            },
          ]}
        /> */}
      </View>

      {error ? (
        <View className="mx-3 mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
          <Text className="text-sm text-red-600">{error}</Text>
        </View>
      ) : null}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#6366f1" />
        </View>
      ) : (
        <>
          <SectionList
            sections={sections}
            keyExtractor={(todo) => todo.id}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingBottom: tabBarInset,
            }}
            ItemSeparatorComponent={() => <View className="h-2" />}
            renderItem={({ item }) => (
              <TodoCard
                todo={item}
                onToggleCompleted={(done) =>
                  updateItem(item.id, { completed: done })
                }
              />
            )}
            renderSectionHeader={({ section }) =>
              section.key === 'completed' ? (
                <Text className="px-2 pt-6 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Completed · {section.data.length}
                </Text>
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => refetch('refresh')}
              />
            }
            ListEmptyComponent={
              <View className="items-center justify-center py-12">
                <Text variant="muted" className="text-center">
                  No to-dos yet. Tell the chat what you need to get done.
                </Text>
              </View>
            }
          />

          <PressableScale
            onPress={() => router.push('/todo/new')}
            scaleTo={0.9}
            accessibilityRole="button"
            accessibilityLabel="New to-do"
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

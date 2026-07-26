import { FLOATING_TAB_BAR_HEIGHT } from '@/components/floating-tab-bar';
import { GradientTile } from '@/components/gradient-tile';
import { ItemTile } from '@/components/item-tile';
import { useGetItems } from '@/hooks/use-get-items';
import { CalendarClock, CalendarDays, Check, Inbox } from '@/lib/icons';
import { FlatList, View } from 'react-native';

const TILES = [
  {
    id: 'today',
    label: 'Today',
    count: 0,
    icon: CalendarDays,
    colors: ['#4CB8F0', '#1F84E4'],
  },
  {
    id: 'notes',
    label: 'Notes',
    count: 0,
    icon: CalendarClock,
    colors: ['#FF8A8A', '#EF4E5B'],
  },
  {
    id: 'all',
    label: 'All',
    count: 0,
    icon: Inbox,
    colors: ['#5A5A5E', '#1C1C1E'],
  },
  {
    id: 'completed',
    label: 'Completed',
    count: 0,
    icon: Check,
    colors: ['#B0B8C1', '#707C8A'],
  },
] as const;

export default function TodayScreen() {
  const { items } = useGetItems();

  return (
    <View
      className="flex-1 gap-3 px-3 pt-4"
      style={{ paddingBottom: FLOATING_TAB_BAR_HEIGHT }}
    >
      <View className="flex-row gap-3">
        <GradientTile {...TILES[0]} onPress={() => console.log(TILES[0].id)} />
        <GradientTile {...TILES[1]} onPress={() => console.log(TILES[1].id)} />
      </View>
      <View className="flex-row gap-3">
        <GradientTile {...TILES[2]} onPress={() => console.log(TILES[2].id)} />
        <GradientTile {...TILES[3]} onPress={() => console.log(TILES[3].id)} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ItemTile item={item} />}
      />
    </View>
  );
}

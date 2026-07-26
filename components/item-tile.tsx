import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Square } from '@/lib/icons';
import { Item, Note, ToDo } from '@/models';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Checkbox } from './ui/checkbox';

type ItemTileProps = {
  item: Item;
};

function useOpenItem(id: string) {
  const router = useRouter();
  return () => router.push({ pathname: '/item/[id]', params: { id } });
}

function NoteTile({ item }: { item: Note }) {
  const openItem = useOpenItem(item.id);

  return (
    <Pressable
      onPress={openItem}
      accessibilityRole="button"
      className="flex-row items-start gap-4 active:opacity-70"
    >
      <Square size={14} color="#EF4E5B" fill="#EF4E5B" className="mt-1.5 ml-1" />

      <View className="flex-1">
        <Text className="font-bold text-lg">{item.title}</Text>
      </View>
    </Pressable>
  );
}

function ToDoTile({ item }: { item: ToDo }) {
  const [isChecked, setIsChecked] = useState(item.completed ?? false);
  const openItem = useOpenItem(item.id);

  return (
    <View className="flex-row items-start gap-4">
      <Checkbox
        checked={isChecked}
        onCheckedChange={(checked) => setIsChecked(checked)}
        className="mt-1 ml-px"
      />

      <Pressable
        onPress={openItem}
        accessibilityRole="button"
        className="flex-1 active:opacity-70"
      >
        <Text className="font-bold">{item.title}</Text>
        {item.date && (
          <Text className="text-sm text-muted-foreground">
            {new Date(item.date).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            })}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

export function ItemTile({ item }: ItemTileProps) {
  return (
    <View className="p-4 bg-card rounded-xl my-2 shadow shadow-black/5">
      {item.type === 'note' ? (
        <NoteTile item={item} />
      ) : item.type === 'todo' ? (
        <ToDoTile item={item} />
      ) : null}
    </View>
  );
}

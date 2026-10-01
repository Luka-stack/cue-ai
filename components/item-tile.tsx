import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { formatDateTime } from '@/lib/format';
import { Square } from '@/lib/icons';
import { Item, Note, ToDo } from '@/models';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Checkbox } from './ui/checkbox';

type ItemTileProps = {
  item: Item;
  onToggleCompleted?: (completed: boolean) => Promise<unknown> | void;
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
      <Square
        size={14}
        color="#EF4E5B"
        fill="#EF4E5B"
        className="mt-1.5 ml-1"
      />

      <View className="flex-1">
        <Text className="font-bold text-lg">{item.title ?? 'Untitled'}</Text>
        {!item.title && item.content ? (
          <Text className="text-sm text-muted-foreground" numberOfLines={2}>
            {item.content}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function ToDoTile({
  item,
  onToggleCompleted,
}: {
  item: ToDo;
  onToggleCompleted?: ItemTileProps['onToggleCompleted'];
}) {
  const [isChecked, setIsChecked] = useState(item.completed ?? false);
  const openItem = useOpenItem(item.id);

  useEffect(() => {
    setIsChecked(item.completed ?? false);
  }, [item.completed]);

  const handleToggle = async (checked: boolean) => {
    setIsChecked(checked);
    try {
      await onToggleCompleted?.(checked);
    } catch {
      setIsChecked(!checked);
    }
  };

  const date = formatDateTime(item.date);

  return (
    <View className="flex-row items-start gap-4">
      <Checkbox
        checked={isChecked}
        onCheckedChange={handleToggle}
        className="mt-1 ml-px"
      />

      <Pressable
        onPress={openItem}
        accessibilityRole="button"
        className="flex-1 active:opacity-70"
      >
        <Text
          className={
            isChecked
              ? 'font-bold line-through text-muted-foreground'
              : 'font-bold'
          }
        >
          {item.title}
        </Text>
        {date ? (
          <Text className="text-sm text-muted-foreground">{date}</Text>
        ) : null}
      </Pressable>
    </View>
  );
}

export function ItemTile({ item, onToggleCompleted }: ItemTileProps) {
  return (
    <View className="p-4 bg-card rounded-xl my-2 shadow shadow-black/5">
      {item.type === 'note' ? (
        <NoteTile item={item} />
      ) : item.type === 'todo' ? (
        <ToDoTile item={item} onToggleCompleted={onToggleCompleted} />
      ) : null}
    </View>
  );
}

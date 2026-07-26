import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Square } from '@/lib/icons';
import { Item, Note, ToDo } from '@/models';
import { useState } from 'react';
import { Checkbox } from './ui/checkbox';

type ItemTileProps = {
  item: Item;
};

function NoteTile({ item }: { item: Note }) {
  return (
    <View className="flex-row items-start gap-4">
      <Square
        size={14}
        color="#EF4E5B"
        fill="#EF4E5B"
        className="mt-1.5 ml-1"
      />

      <View className="flex-1">
        <Text className="font-bold text-lg">{item.title}</Text>
      </View>
    </View>
  );
}

function ToDoTile({ item }: { item: ToDo }) {
  const [isChecked, setIsChecked] = useState(item.completed ?? false);

  return (
    <View className="flex-row items-start gap-4">
      <Checkbox
        checked={isChecked}
        onCheckedChange={(checked) => setIsChecked(checked)}
        className="mt-1 ml-px"
      />

      <View>
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
      </View>
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

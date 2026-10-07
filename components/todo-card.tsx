import { Checkbox } from '@/components/ui/checkbox';
import { Text } from '@/components/ui/text';
import { formatShortDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ToDo } from '@/models';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

type TodoCardProps = {
  todo: ToDo;
  onToggleCompleted: (completed: boolean) => Promise<unknown>;
};

export function TodoCard({ todo, onToggleCompleted }: TodoCardProps) {
  const router = useRouter();
  const [pending, setPending] = useState<boolean | null>(null);
  const checked = pending ?? todo.completed ?? false;

  const toggle = async (next: boolean) => {
    setPending(next);
    try {
      await onToggleCompleted(next);
    } catch {
      // Swallowed: clearing `pending` reverts the checkbox.
    } finally {
      setPending(null);
    }
  };

  const date = formatShortDateTime(todo.date);

  return (
    <View className="flex-row items-start gap-3 rounded-2xl bg-card px-4 py-3.5">
      <Checkbox
        checked={checked}
        onCheckedChange={toggle}
        accessibilityLabel={checked ? 'Mark as not done' : 'Mark as done'}
        className="mt-0.5"
      />

      <Pressable
        onPress={() =>
          router.push({ pathname: '/todo/[id]', params: { id: todo.id } })
        }
        accessibilityRole="button"
        className="flex-1 active:opacity-70"
      >
        <Text
          numberOfLines={2}
          className={cn(
            'text-base font-medium leading-snug',
            checked && 'text-muted-foreground line-through',
          )}
        >
          {todo.title}
        </Text>

        {date ? (
          <Text className="mt-1.5 text-[11px] text-muted-foreground">
            {date}
          </Text>
        ) : null}
      </Pressable>
    </View>
  );
}

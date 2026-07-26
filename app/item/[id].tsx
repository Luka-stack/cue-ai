import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { getItemById } from '@/hooks/use-get-items';
import { Check } from '@/lib/icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ItemDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = getItemById(id);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-row items-center px-4 pb-4 pt-2">
        <Button
          onPress={() => router.back()}
          variant="outline"
          className="size-10 rounded-full border-slate-100 bg-slate-100"
          accessibilityLabel="Back to list"
        >
          <Check size={24} className="text-slate-600" />
        </Button>
      </View>

      {item ? (
        <ScrollView
          className="flex-1 px-5"
          contentContainerClassName="gap-3 pb-10"
        >
          <Text className="text-3xl font-extrabold tracking-tight">
            {item.title ?? 'Untitled'}
          </Text>

          {item.type === 'todo' && item.date ? (
            <Text variant="muted">
              {new Date(item.date).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
              })}
            </Text>
          ) : null}

          {item.type === 'todo' ? (
            <Text variant="muted">
              {item.completed ? 'Completed' : 'Not completed'}
            </Text>
          ) : null}

          {item.content ? (
            <Text variant="p">{item.content}</Text>
          ) : (
            <Text variant="muted">No description.</Text>
          )}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-5">
          <Text variant="muted">Item not found.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

import { Plus, Sparkle } from '@/lib/icons';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button } from './ui/button';
import { Text } from './ui/text';

export function Header() {
  const router = useRouter();

  return (
    <View className="flex flex-row justify-between items-center">
      <View className="flex flex-row items-center gap-2">
        <View className="flex items-center justify-center p-2 rounded-md bg-indigo-500">
          <Sparkle size={20} color="white" fill="white" strokeWidth={1} />
        </View>

        <Text variant={'h3'}>Cue</Text>
      </View>

      <Button
        onPress={() => router.push('/modal')}
        className="rounded-lg size-9 bg-slate-100 border-slate-100"
        variant="outline"
      >
        <Plus size={20} className="text-foreground" />
      </Button>
    </View>
  );
}

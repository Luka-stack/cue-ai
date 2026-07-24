import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TodayScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 items-center justify-center gap-2 p-5">
        <Text variant="h3">Today</Text>
        <Text variant="muted">Nothing here yet.</Text>
      </View>
    </SafeAreaView>
  );
}

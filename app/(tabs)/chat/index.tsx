import { Header } from '@/components/header';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 gap-4 p-5">
        <Header />
        <Text variant="muted">Chat Screen</Text>
      </View>
    </SafeAreaView>
  );
}

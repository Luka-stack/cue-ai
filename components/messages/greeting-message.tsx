import { useUserId } from '@/contexts/user-context';
import { Pressable, Text, View } from 'react-native';

export function GreetingMessage() {
  const userId = useUserId();

  return (
    <View className="mt-20">
      <Text className="text-2xl font-bold text-center">
        {userId ? `Welcome back, ${userId}` : 'Hello!'}
      </Text>
      <Text className="mt-2 text-lg text-center">
        Tell me what's on your mind {'\n'} I'll help you organize it.
      </Text>

      <View className="gap-4 mt-4">
        <View className="flex-row gap-4 justify-center">
          <Pressable className="bg-card rounded-xl p-2 border-hairline">
            <Text>Tell me what I need to do.</Text>
          </Pressable>
          <Pressable className="bg-card rounded-xl p-2 border-hairline">
            <Text>Anything urgent today?</Text>
          </Pressable>
        </View>
        <View className="flex-row space-x-2 justify-center">
          <Pressable className="bg-card rounded-xl p-2 border-hairline">
            <Text>Summarize my notes.</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

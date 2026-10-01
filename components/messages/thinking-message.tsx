import { Sparkle } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

/** Placeholder bubble shown while the agent is working on a turn. */
export function ThinkingMessage() {
  return (
    <View className="flex-row items-end gap-2 mt-4">
      <View className="flex items-center justify-center p-1 rounded-md bg-indigo-500">
        <Sparkle size={16} color="white" fill="white" strokeWidth={1} />
      </View>

      <View className="bg-card rounded-2xl px-5 py-4 shadow shadow-black/5 rounded-bl-none mb-2">
        <ActivityIndicator size="small" color="#6366f1" />
      </View>
    </View>
  );
}

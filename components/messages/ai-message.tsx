import { Sparkle } from 'lucide-react-native';
import { View } from 'react-native';
import type { AiMessage as AiMessageType } from '../../models';
import { Text } from '../ui/text';

export function AiMessage({ message }: { message: AiMessageType }) {
  return (
    <View className="flex-row items-end gap-2 mt-4">
      <View className="flex items-center justify-center p-1 rounded-md bg-indigo-500">
        <Sparkle size={16} color="white" fill="white" strokeWidth={1} />
      </View>

      <View className="bg-card rounded-2xl p-4 shadow shadow-black/5 rounded-bl-none mb-2 shrink">
        <Text>{message.content}</Text>
      </View>
    </View>
  );
}

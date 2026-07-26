import { View } from 'react-native';
import type { UserMessage } from '../../models';
import { Text } from '../ui/text';

export function UserMessage({ message }: { message: UserMessage }) {
  return (
    <View className="items-end mt-4">
      <View className="bg-indigo-500 rounded-2xl p-4 shadow shadow-black/5 rounded-br-none mb-2 shrink">
        <Text className="text-white">{message.content}</Text>
      </View>
    </View>
  );
}

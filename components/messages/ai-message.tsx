import { View } from 'react-native';
import type { AiMessage as AiMessageType } from '../../models';
import { Text } from '../ui/text';

export function AiMessage({ message }: { message: AiMessageType }) {
  return (
    <View className="flex-row items-end gap-2 mt-4">
      <Text>{message.content}</Text>
    </View>
  );
}

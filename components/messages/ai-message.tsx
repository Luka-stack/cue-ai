import { View } from 'react-native';
import type { AiMessage as AiMessageType } from '../../models';
import { Markdown } from '../markdown';

export function AiMessage({ message }: { message: AiMessageType }) {
  return (
    <View className="flex-row items-end gap-2 mt-4">
      <Markdown className="flex-1">{message.content}</Markdown>
    </View>
  );
}

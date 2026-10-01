import { View } from 'react-native';
import type { ErrorMessage as ErrorMessageType } from '../../models';
import { Text } from '../ui/text';

export function ErrorMessage({ message }: { message: ErrorMessageType }) {
  return (
    <View className="items-center mt-3 mb-2 px-4">
      <View className="bg-red-50 border border-red-200 rounded-xl px-3 py-2">
        <Text className="text-sm text-red-600 text-center">{message.content}</Text>
      </View>
    </View>
  );
}

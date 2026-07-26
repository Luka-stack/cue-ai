import { FLOATING_TAB_BAR_HEIGHT } from '@/components/floating-tab-bar';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';

export default function ChatScreen() {
  return (
    <View
      className="flex-1 gap-4 px-5 pt-4"
      style={{ paddingBottom: FLOATING_TAB_BAR_HEIGHT }}
    >
      <Text variant="muted">Chat Screen</Text>
    </View>
  );
}

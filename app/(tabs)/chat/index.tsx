import { FLOATING_TAB_BAR_HEIGHT } from '@/components/floating-tab-bar';
import { Message } from '@/components/messages/message';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useGetMessages } from '@/hooks/use-get-messages';
import { ArrowUp } from 'lucide-react-native';

import { FlatList, TextInput, View } from 'react-native';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

const useGradualAnimation = () => {
  const height = useSharedValue(0);

  useKeyboardHandler(
    {
      onMove: (event) => {
        'worklet';
        height.value = Math.max(event.height, 0);
      },
    },
    [],
  );
  return { height };
};

export default function ChatScreen() {
  const messages = useGetMessages();
  const { height } = useGradualAnimation();

  const fakeView = useAnimatedStyle(() => {
    return {
      height: Math.abs(height.value),
    };
  }, []);

  return (
    <View
      className="flex-1 px-5 pt-4"
      style={{ paddingBottom: FLOATING_TAB_BAR_HEIGHT }}
    >
      <FlatList
        className="flex-1"
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Message message={item} />}
      />

      <View className="bg-card flex-row rounded-full px-2 items-center justify-between py-2 shadow shadow-black/5 gap-3 mt-2">
        <TextInput
          placeholder="What do you want to add?"
          className="ml-2 flex-1"
        />

        <Button className="rounded-full p-3 bg-indigo-500">
          <Icon as={ArrowUp} className="text-white" size={16} strokeWidth={3} />
        </Button>
      </View>

      <Animated.View style={fakeView} />
    </View>
  );
}

import { FLOATING_TAB_BAR_HEIGHT } from '@/components/floating-tab-bar';
import { Message } from '@/components/messages/message';
import { ThinkingMessage } from '@/components/messages/thinking-message';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useChat } from '@/contexts/chat-context';
import { cn } from '@/lib/utils';
import { ArrowUp } from 'lucide-react-native';
import { useRef, useState } from 'react';
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
  const { messages, pendingReview, busy, starting, submit } = useChat();
  const { height } = useGradualAnimation();
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList>(null);

  const fakeView = useAnimatedStyle(() => {
    return {
      height: Math.max(height.value + 8, FLOATING_TAB_BAR_HEIGHT),
    };
  }, []);

  const canSend = draft.trim().length > 0 && !busy && !starting;

  const handleSend = () => {
    if (!canSend) return;
    const text = draft;
    setDraft('');
    void submit(text);
  };

  const placeholder = starting
    ? 'Starting a new chat…'
    : pendingReview
      ? 'accept, reject, or revise: …'
      : 'What do you want to add?';

  return (
    <View className="flex-1 px-5 pt-4">
      <FlatList
        ref={listRef}
        className="flex-1"
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Message message={item} />}
        ListFooterComponent={busy ? <ThinkingMessage /> : null}
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: true })
        }
        keyboardShouldPersistTaps="handled"
      />

      <View className="bg-card flex-row rounded-full px-2 items-center justify-between py-2 shadow shadow-black/5 gap-3 mt-2">
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          editable={!starting}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          submitBehavior="submit"
          accessibilityLabel="Message"
          className="ml-2 flex-1 text-foreground"
        />

        <Button
          onPress={handleSend}
          disabled={!canSend}
          accessibilityLabel="Send"
          className={cn('rounded-full p-3 bg-indigo-500')}
        >
          <Icon as={ArrowUp} className="text-white" size={16} strokeWidth={3} />
        </Button>
      </View>

      <Animated.View style={fakeView} />
    </View>
  );
}

import { useChat } from '@/contexts/chat-context';
import { Plus, Sparkle, SquarePen } from '@/lib/icons';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button } from './ui/button';
import { Text } from './ui/text';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { newChat, starting, busy } = useChat();

  // On Chat the action starts a fresh conversation; elsewhere it adds an item.
  const onChat = pathname === '/chat';
  const disabled = onChat && (starting || busy);

  const onPress = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (onChat) void newChat();
    else router.push('/modal');
  };

  return (
    <View className="flex flex-row justify-between items-center">
      <View className="flex flex-row items-center gap-2">
        <View className="flex items-center justify-center p-2 rounded-md bg-indigo-500">
          <Sparkle size={20} color="white" fill="white" strokeWidth={1} />
        </View>

        <Text variant={'h3'}>Cue</Text>
      </View>

      <Button
        onPress={onPress}
        disabled={disabled}
        accessibilityLabel={onChat ? 'New chat' : 'Add item'}
        className={cn(
          'rounded-lg size-9 bg-slate-100 border-slate-100',
          disabled && 'opacity-50',
        )}
        variant="outline"
      >
        {onChat ? (
          <SquarePen size={18} className="text-foreground" />
        ) : (
          <Plus size={20} className="text-foreground" />
        )}
      </Button>
    </View>
  );
}

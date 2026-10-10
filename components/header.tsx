import { AppLogo } from '@/components/app-logo';
import { Icon } from '@/components/ui/icon';
import { useChat } from '@/contexts/chat-context';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import { MessageCirclePlus, Plus } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
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
    else if (pathname === '/notes') router.push('/note/new');
    else router.push('/modal');
  };

  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-2.5">
        <AppLogo size={32} />
        <Text className="text-xl font-semibold tracking-tight">Cue AI</Text>
      </View>

      <Pressable
        onPress={onPress}
        disabled={disabled}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={onChat ? 'New chat' : 'Add item'}
        className={cn(
          'size-9 items-center justify-center rounded-xl active:opacity-70 active:bg-black/5',
          disabled && 'opacity-40',
        )}
      >
        <Icon as={onChat ? MessageCirclePlus : Plus} size={20} />
      </Pressable>
    </View>
  );
}

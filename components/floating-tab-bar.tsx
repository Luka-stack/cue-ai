import { Text } from '@/components/ui/text';
import { THEME } from '@/constants/theme';
import { useChat } from '@/contexts/chat-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { List, MessageCircle, Plus } from '@/lib/icons';
import { cn } from '@/lib/utils';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';
import { Fragment, useEffect, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Approx. pill height + margin — screens use this to pad content clear of the bar. */
export const FLOATING_TAB_BAR_HEIGHT = 72;

/** Maps each route to its Lucide icon. Swap these to change the glyphs. */
const ICONS: Record<string, LucideIcon> = {
  'chat/index': MessageCircle,
  'today/index': List,
};

const CHAT_ROUTE = 'chat/index';

type ItemLayout = { x: number; width: number };

function haptic() {
  if (process.env.EXPO_OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const theme = THEME[useColorScheme() ?? 'light'];
  const { newChat, starting, busy } = useChat();
  const [layouts, setLayouts] = useState<Record<number, ItemLayout>>({});

  const left = useSharedValue(0);
  const width = useSharedValue(0);
  const ready = useSharedValue(0);
  const positioned = useRef(false);

  // Move the highlight to the focused tab: snap into place the first time its
  // size is known, then slide smoothly on subsequent tab switches.
  useEffect(() => {
    const layout = layouts[state.index];
    if (!layout) return;
    if (positioned.current) {
      left.value = withTiming(layout.x, { duration: 220 });
      width.value = withTiming(layout.width, { duration: 220 });
    } else {
      positioned.current = true;
      left.value = layout.x;
      width.value = layout.width;
      ready.value = 1;
    }
  }, [state.index, layouts, left, width, ready]);

  const highlightStyle = useAnimatedStyle(() => ({
    left: left.value,
    width: width.value,
    opacity: ready.value,
  }));

  // Start a fresh conversation and show it.
  const onNewChat = () => {
    haptic();
    void newChat();
    const chatIndex = state.routes.findIndex((r) => r.name === CHAT_ROUTE);
    if (chatIndex !== -1 && state.index !== chatIndex) {
      navigation.navigate(CHAT_ROUTE);
    }
  };

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        paddingBottom: Platform.select({
          ios: insets.bottom,
          default: insets.bottom + 8,
        }),
        pointerEvents: 'box-none',
      }}
    >
      <View className="flex-row items-center bg-background">
        {/* Track shares the highlight's coordinate space (no padding of its own). */}
        <View style={{ position: 'relative', flexDirection: 'row', alignItems: 'center' }}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                bottom: 0,
                borderRadius: 9999,
                backgroundColor: theme.primary,
                pointerEvents: 'none',
              },
              highlightStyle,
            ]}
          />

          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const { options } = descriptors[route.key];
            const label = (options.title ?? route.name) as string;
            const Icon = ICONS[route.name];

            const onLayout = (e: LayoutChangeEvent) => {
              const { x, width: w } = e.nativeEvent.layout;
              setLayouts((prev) =>
                prev[index]?.x === x && prev[index]?.width === w
                  ? prev
                  : { ...prev, [index]: { x, width: w } },
              );
            };

            const onPress = () => {
              haptic();
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <Fragment key={route.key}>
                {/* The "new chat" button sits between the tabs: <Chat <+> List>. */}
                {index > 0 ? (
                  <Pressable
                    onPress={onNewChat}
                    disabled={starting || busy}
                    accessibilityRole="button"
                    accessibilityLabel="New chat"
                    hitSlop={8}
                    className={cn(
                      'mx-1 size-9 items-center justify-center rounded-full bg-indigo-500 active:opacity-80',
                      (starting || busy) && 'opacity-50',
                    )}
                  >
                    <Plus size={20} color="white" strokeWidth={2.5} />
                  </Pressable>
                ) : null}

                <Pressable
                  onLayout={onLayout}
                  onPress={onPress}
                  accessibilityRole="button"
                  accessibilityState={focused ? { selected: true } : {}}
                  accessibilityLabel={label}
                  className="flex-row items-center gap-2 rounded-full px-6 py-2"
                >
                  {Icon ? (
                    <Icon
                      size={20}
                      className={cn(
                        'text-muted-foreground',
                        focused && 'text-primary-foreground',
                      )}
                    />
                  ) : null}
                  <Text
                    className={cn(
                      'text-sm font-medium text-muted-foreground',
                      focused && 'text-primary-foreground',
                    )}
                  >
                    {label}
                  </Text>
                </Pressable>
              </Fragment>
            );
          })}
        </View>
      </View>
    </View>
  );
}

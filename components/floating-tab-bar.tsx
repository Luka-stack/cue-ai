import * as Haptics from 'expo-haptics';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import type { LucideIcon } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withSpring,
  type SharedValue,
  type WithSpringConfig,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { THEME } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ListTodo, MessageCircle, NotebookPen } from '@/lib/icons';

/** Maps each route to its Lucide icon. Swap these to change the glyphs. */
const ICONS: Record<string, LucideIcon> = {
  'chat/index': MessageCircle,
  'todos/index': ListTodo,
  'notes/index': NotebookPen,
};

const ITEM_HEIGHT = 52;
const BAR_PADDING = 6;
/** Horizontal gap between the bubble and the edges of its tab slot. */
const BUBBLE_INSET = 8;
const BAR_HEIGHT = ITEM_HEIGHT + BAR_PADDING * 2;
/** Breathing room between the bar and the content scrolled above it. */
const CONTENT_GAP = 12;

/**
 * The bubble's edges move on different springs: the edge facing the
 * destination leads, the other one trails — so the bubble stretches toward
 * the new tab and snaps back to its normal size when it lands.
 */
const LEAD_SPRING: WithSpringConfig = {
  stiffness: 380,
  damping: 30,
  mass: 0.8,
};
const TRAIL_SPRING: WithSpringConfig = { stiffness: 170, damping: 22, mass: 1 };

/**
 * The bar extends under the home indicator. Items may overlap the top part of
 * the inset (the indicator itself is a thin line near the very bottom), which
 * keeps the gap below the icons tight.
 */
function useBarBottomPadding() {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom - 18, 4);
}

/** Bottom space a screen must leave so its content clears the tab bar. */
export function useFloatingTabBarInset() {
  return useBarBottomPadding() + BAR_HEIGHT + CONTENT_GAP;
}

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const paddingBottom = useBarBottomPadding();
  const theme = THEME[useColorScheme() ?? 'light'];
  const reduceMotion = useReducedMotion();

  // Bubble edges in tab-slot units (tab i spans i..i+1); scaled to pixels by
  // the measured slot width, since tabs share the full screen width.
  const leftEdge = useSharedValue(state.index);
  const rightEdge = useSharedValue(state.index + 1);
  const slotWidth = useSharedValue(0);
  const prevIndex = useRef(state.index);

  useEffect(() => {
    const from = prevIndex.current;
    const to = state.index;

    if (from === to) return;

    prevIndex.current = to;
    const left = to;
    const right = to + 1;

    if (reduceMotion) {
      leftEdge.value = left;
      rightEdge.value = right;
      return;
    }

    const movingRight = to > from;
    leftEdge.value = withSpring(left, movingRight ? TRAIL_SPRING : LEAD_SPRING);
    rightEdge.value = withSpring(
      right,
      movingRight ? LEAD_SPRING : TRAIL_SPRING,
    );
  }, [state.index, reduceMotion, leftEdge, rightEdge]);

  const bubbleStyle = useAnimatedStyle(() => ({
    left: leftEdge.value * slotWidth.value + BUBBLE_INSET,
    width: Math.max(
      (rightEdge.value - leftEdge.value) * slotWidth.value - BUBBLE_INSET * 2,
      0,
    ),
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    slotWidth.value = e.nativeEvent.layout.width / state.routes.length;
  };

  return (
    <View
      className="bg-card"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: BAR_PADDING,
        paddingBottom,
        paddingHorizontal: BAR_PADDING,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.border,
      }}
    >
      <View
        accessibilityRole="tablist"
        onLayout={onLayout}
        className="flex-row"
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              height: ITEM_HEIGHT,
              borderRadius: 16,
              borderCurve: 'continuous',
              backgroundColor: theme.primarySoft,
              pointerEvents: 'none',
            },
            bubbleStyle,
          ]}
        />

        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              if (process.env.EXPO_OS === 'ios') Haptics.selectionAsync();
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <TabItem
              key={route.key}
              index={index}
              label={(options.title ?? route.name) as string}
              icon={ICONS[route.name]}
              focused={focused}
              onPress={onPress}
              leftEdge={leftEdge}
              rightEdge={rightEdge}
              activeColor={theme.primary}
              inactiveColor={theme.mutedForeground}
            />
          );
        })}
      </View>
    </View>
  );
}

type TabItemProps = {
  index: number;
  label: string;
  icon?: LucideIcon;
  focused: boolean;
  onPress: () => void;
  leftEdge: SharedValue<number>;
  rightEdge: SharedValue<number>;
  activeColor: string;
  inactiveColor: string;
};

function TabItem({
  index,
  label,
  icon: Icon,
  focused,
  onPress,
  leftEdge,
  rightEdge,
  activeColor,
  inactiveColor,
}: TabItemProps) {
  const pressed = useSharedValue(0);

  // How much the bubble covers this tab (0..1), so the active tint fades in
  // as the bubble arrives rather than flipping the moment the tab is tapped.
  const coverage = useDerivedValue(() => {
    const center = (leftEdge.value + rightEdge.value) / 2 - 0.5;
    return interpolate(
      Math.abs(center - index),
      [0, 0.6],
      [1, 0],
      Extrapolation.CLAMP,
    );
  });
  const activeStyle = useAnimatedStyle(() => ({ opacity: coverage.value }));
  const inactiveStyle = useAnimatedStyle(() => ({
    opacity: 1 - coverage.value,
  }));

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed.value ? 0.9 : 1, LEAD_SPRING) }],
  }));

  const content = (color: string, weight: 'font-medium' | 'font-semibold') => (
    <>
      {Icon ? <Icon size={22} color={color} strokeWidth={2} /> : null}
      <Text className={`text-[11px] ${weight}`} style={{ color }}>
        {label}
      </Text>
    </>
  );

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => (pressed.value = 1)}
      onPressOut={() => (pressed.value = 0)}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      style={{ flex: 1, height: ITEM_HEIGHT }}
    >
      <Animated.View style={[{ flex: 1 }, pressStyle]}>
        <Animated.View style={[styles.layer, inactiveStyle]}>
          {content(inactiveColor, 'font-medium')}
        </Animated.View>
        <Animated.View style={[styles.layer, styles.overlay, activeStyle]}>
          {content(activeColor, 'font-semibold')}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  layer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    pointerEvents: 'none',
  },
});

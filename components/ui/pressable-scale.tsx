import type { ComponentProps } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const SPRING = { stiffness: 380, damping: 30, mass: 0.8 };

type PressableScaleProps = ComponentProps<typeof Pressable> & {
  scaleTo?: number;
  containerStyle?: StyleProp<ViewStyle>;
};

/**
 * A Pressable that springs down while held. Use `active:` classes on it for
 * the pressed colour; the scale lives on a wrapper so className styling on
 * the Pressable keeps working on every platform.
 */
export function PressableScale({
  scaleTo = 0.95,
  containerStyle,
  onPressIn,
  onPressOut,
  ...props
}: PressableScaleProps) {
  const pressed = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  const style = useAnimatedStyle(() => ({
    transform: [
      {
        scale: reduceMotion
          ? 1
          : withSpring(pressed.value ? scaleTo : 1, SPRING),
      },
    ],
  }));

  return (
    <Animated.View style={[containerStyle, style]}>
      <Pressable
        {...props}
        onPressIn={(e) => {
          pressed.value = 1;
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          pressed.value = 0;
          onPressOut?.(e);
        }}
      />
    </Animated.View>
  );
}

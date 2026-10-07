import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { EllipsisVertical, type LucideIcon } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';

export type OverflowMenuItem = {
  label: string;
  icon?: LucideIcon;
  /** Renders the item in the destructive color (e.g. Delete). */
  destructive?: boolean;
  onPress: () => void;
};

type Anchor = { top: number; right: number };

const MENU_WIDTH = 220;

/** Round "⋯" button that opens a small popover menu anchored under it. */
export function OverflowMenu({ items }: { items: OverflowMenuItem[] }) {
  const buttonRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  const open = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      const windowWidth = Dimensions.get('window').width;
      setAnchor({ top: y + height + 8, right: windowWidth - (x + width) });
    });
  };

  const close = () => setAnchor(null);

  return (
    <>
      <Pressable
        ref={buttonRef}
        onPress={open}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="More options"
        className="size-9 items-center justify-center rounded-xl active:opacity-70 active:bg-black/5"
      >
        <Icon as={EllipsisVertical} size={24} />
      </Pressable>

      <Modal
        visible={anchor !== null}
        transparent
        animationType="none"
        onRequestClose={close}
        statusBarTranslucent
      >
        <Pressable
          className="flex-1"
          onPress={close}
          accessibilityLabel="Close menu"
        >
          {anchor ? (
            // Positioned by a plain View: Reanimated's web layout animations
            // overwrite `left` on the animated node, which breaks `right`.
            <View
              style={{
                position: 'absolute',
                top: anchor.top,
                right: anchor.right,
                width: MENU_WIDTH,
              }}
            >
              <Animated.View
                entering={ZoomIn.duration(160).withInitialValues({
                  transform: [{ scale: 0.92 }],
                })}
                exiting={FadeOut.duration(120)}
                style={{ transformOrigin: 'top right' }}
              >
                {/* Classes live on a plain View: NativeWind drops them on Animated views. */}
                <View
                  className="overflow-hidden rounded-2xl bg-card py-1"
                  style={{ boxShadow: '0 12px 32px rgba(15, 23, 42, 0.16)' }}
                >
                  {items.map((item, index) => (
                    <Pressable
                      key={item.label}
                      onPress={() => {
                        close();
                        item.onPress();
                      }}
                      accessibilityRole="menuitem"
                      className="flex-row items-center justify-between gap-6 border-border px-4 py-3 active:bg-muted"
                      style={
                        index > 0
                          ? { borderTopWidth: StyleSheet.hairlineWidth }
                          : undefined
                      }
                    >
                      <Text
                        className={cn(
                          'text-base',
                          item.destructive && 'text-destructive',
                        )}
                      >
                        {item.label}
                      </Text>
                      {item.icon ? (
                        <Icon
                          as={item.icon}
                          size={18}
                          className={cn(item.destructive && 'text-destructive')}
                        />
                      ) : null}
                    </Pressable>
                  ))}
                </View>
              </Animated.View>
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </>
  );
}

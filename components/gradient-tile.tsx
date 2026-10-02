import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

export type GradientTileProps = {
  label: string;
  count: number;
  icon: LucideIcon;
  /** expo-linear-gradient requires at least two colors. */
  colors: readonly [string, string, ...string[]];
  active?: boolean;
  onPress?: () => void;
};

export function GradientTile({
  label,
  count,
  icon: Icon,
  colors,
  active = false,
  onPress,
}: GradientTileProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${label}, ${count}`}
      className={cn(
        'h-20 flex-1 overflow-hidden rounded-2xl active:opacity-80 border-2 border-transparent',
        active && 'border-indigo-500',
      )}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <View className="flex-1 justify-between p-3">
          <View className="flex-row items-start justify-between">
            <Icon size={26} color="white" />
            <Text className="text-2xl font-bold text-white">{count}</Text>
          </View>
          <Text
            className="text-sm font-semibold text-white"
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

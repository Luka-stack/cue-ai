import { Text } from '@/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

export type GradientTileProps = {
  label: string;
  count: number;
  icon: LucideIcon;
  /** expo-linear-gradient requires at least two colors. */
  colors: readonly [string, string, ...string[]];
  onPress?: () => void;
};

export function GradientTile({
  label,
  count,
  icon: Icon,
  colors,
  onPress,
}: GradientTileProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${count}`}
      className="h-20 flex-1 overflow-hidden rounded-2xl active:opacity-80"
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <View className="flex-row flex-1 justify-between p-3">
          <View className="flex items-start justify-between gap-1.5">
            <Icon size={32} color="white" />
            <Text className="text-base font-semibold text-white">{label}</Text>
          </View>

          <Text className="text-3xl font-bold text-white">{count}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Text } from './ui/text';

type TabButtonProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function TabButton({ active, label, onPress }: TabButtonProps) {
  return (
    <Button
      onPress={onPress}
      scaleOnPress={0.95}
      className={cn(
        'rounded-full px-3 h-7 py-0 bg-card border border-slate-400 active:bg-primary active:border-primary group',
        active && 'bg-primary border-primary',
      )}
    >
      <Text
        className={cn(
          'text-xs text-slate-400 group-active:text-primary-foreground',
          active && 'text-primary-foreground',
        )}
      >
        {label}
      </Text>
    </Button>
  );
}

export { TabButton };

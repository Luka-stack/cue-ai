import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import * as CheckboxPrimitive from '@rn-primitives/checkbox';
import { Check } from 'lucide-react-native';

const DEFAULT_HIT_SLOP = 24;

function Checkbox({
  className,
  checkedClassName,
  indicatorClassName,
  iconClassName,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  checkedClassName?: string;
  indicatorClassName?: string;
  iconClassName?: string;
}) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'border-[#1F84E4] size-5 shrink-0 rounded-[4px] border-2 shadow-sm shadow-black/5 overflow-hidden',
        // Paint the fill on the same element as the border so there's no
        // inset child and therefore no transparent seam at the rounded corners.
        props.checked && 'bg-[#1F84E4]',
        props.checked && checkedClassName,
        props.disabled && 'opacity-50',
        className,
      )}
      hitSlop={DEFAULT_HIT_SLOP}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn(
          'h-full w-full items-center justify-center',
          indicatorClassName,
        )}
      >
        <Icon
          as={Check}
          size={14}
          strokeWidth={3.5}
          className={cn('text-white', iconClassName)}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };

import { cn } from '@/lib/utils';
import * as SwitchPrimitives from '@rn-primitives/switch';

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitives.Root>) {
  return (
    <SwitchPrimitives.Root
      className={cn(
        'flex h-[1.8rem] w-[4.2rem] shrink-0 flex-row items-center rounded-full border border-transparent shadow-sm shadow-black/5',
        props.checked ? 'bg-green-500' : 'bg-slate-300',
        props.disabled && 'opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          'bg-slate-50 h-6 w-10 rounded-full transition-transform',
          props.checked
            ? 'dark:bg-primary-foreground translate-x-[1.5rem]'
            : 'dark:bg-foreground translate-x-[0.1rem]',
        )}
      />
    </SwitchPrimitives.Root>
  );
}

export { Switch };

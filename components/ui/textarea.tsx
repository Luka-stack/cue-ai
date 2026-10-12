import { cn } from '@/lib/utils';
import { Keyboard, TextInput } from 'react-native';

function Textarea({
  className,
  multiline = true,
  numberOfLines = 8,
  ...props
}: React.ComponentProps<typeof TextInput> & React.RefAttributes<TextInput>) {
  return (
    <TextInput
      className={cn(
        'text-foreground flex w-full flex-row border-none bg-transparent py-2',
        props.editable === false && 'opacity-50',
        className,
      )}
      onSubmitEditing={() => Keyboard.dismiss()}
      returnKeyType="done"
      multiline={multiline}
      numberOfLines={numberOfLines}
      placeholderTextColor="#94a3b8"
      textAlignVertical="top"
      {...props}
    />
  );
}

export { Textarea };

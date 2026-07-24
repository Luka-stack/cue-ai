import { cn } from '@/lib/utils';
import { Keyboard, TextInput } from 'react-native';

// function Textarea({
//   className,
//   multiline = true,
//   numberOfLines = 8,
//   placeholderClassName,
//   ...props
// }: React.ComponentProps<typeof TextInput> & React.RefAttributes<TextInput>) {
//   return (
//     <TextInput
//       className={cn(
//         'text-foreground border-slate-300 flex w-full flex-row rounded-md border bg-card px-3 py-2 text-base shadow-sm shadow-black/5 md:text-sm',
//         props.editable === false && 'opacity-50',
//         className,
//       )}
//       placeholderClassName={cn('text-muted-foreground', placeholderClassName)}
//       multiline={multiline}
//       numberOfLines={numberOfLines}
//       textAlignVertical="top"
//       {...props}
//     />
//   );
// }

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

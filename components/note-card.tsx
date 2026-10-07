import { formatShortDateTime } from '@/lib/format';
import { Note } from '@/models';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

type NoteCardProps = {
  note: Note;
};

export function NoteCard({ note }: NoteCardProps) {
  const router = useRouter();

  const date = formatShortDateTime(note.updated_at);

  return (
    <View className="flex-row items-start gap-3 rounded-2xl bg-card px-4 py-3.5">
      <Pressable
        onPress={() =>
          router.push({ pathname: '/note/[id]', params: { id: note.id } })
        }
        accessibilityRole="button"
        className="flex-1 active:opacity-70"
      >
        <Text numberOfLines={1} className="text-base font-medium leading-snug">
          {note.title}
        </Text>

        <Text numberOfLines={2} className="text-sm text-muted-foreground">
          {note.content}
        </Text>

        {date ? (
          <Text className="mt-1.5 text-[11px] text-muted-foreground">
            {date}
          </Text>
        ) : null}
      </Pressable>
    </View>
  );
}

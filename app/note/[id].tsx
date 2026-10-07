import { NoteEditor } from '@/components/note-editor';
import { Text } from '@/components/ui/text';
import { useUserId } from '@/contexts/user-context';
import { errorMessage, itemsApi } from '@/lib/api';
import type { Note } from '@/models';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function EditNoteScreen() {
  const userId = useUserId();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    itemsApi
      .get(userId, id)
      .then((item) => {
        if (cancelled) return;
        if (item.type === 'note') setNote(item);
        else setError('This item is not a note.');
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      });

    return () => {
      cancelled = true;
    };
  }, [userId, id]);

  if (note) return <NoteEditor note={note} />;

  return (
    <View className="flex-1 items-center justify-center bg-background px-5">
      {error ? (
        <Text variant="muted">{error}</Text>
      ) : (
        <ActivityIndicator color="#6366f1" />
      )}
    </View>
  );
}

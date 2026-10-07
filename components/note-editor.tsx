import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRouter } from 'expo-router';
import { type NavigationAction } from 'expo-router/react-navigation';
import {
  Check,
  MoveLeft,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OverflowMenu } from '@/components/overflow-menu';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useUserId } from '@/contexts/user-context';
import { errorMessage, itemsApi } from '@/lib/api';
import { formatShortDateTime } from '@/lib/format';
import type { Note } from '@/models';

type NoteEditorProps = {
  note?: Note;
};

export function NoteEditor({ note }: NoteEditorProps) {
  const router = useRouter();
  const navigation = useNavigation();
  const userId = useUserId();
  const isNew = !note;

  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [saving, setSaving] = useState(false);
  const [exit, setExit] = useState<NavigationAction | true | null>(null);
  const contentRef = useRef<TextInput>(null);

  const isEmpty = !title.trim() && !content.trim();
  const isDirty =
    title !== (note?.title ?? '') || content !== (note?.content ?? '');

  const updatedAt = isNew
    ? formatShortDateTime(new Date().toISOString())
    : formatShortDateTime(note.updated_at ?? note.created_at);

  const tap = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  useEffect(() => {
    if (exit === true) router.back();
    else if (exit) navigation.dispatch(exit);
  }, [exit, router, navigation]);

  const leave = () => setExit(true);

  const createOrUpdate = async () => {
    if (isEmpty || saving) return;

    tap();
    setSaving(true);

    try {
      if (isNew) {
        await itemsApi.create(userId, {
          type: 'note',
          title: title.trim() || undefined,
          content: content.trim() || undefined,
        });
      } else {
        await itemsApi.update(userId, note!.id, {
          title: title.trim(),
          content: content.trim(),
        });
      }

      leave();
    } catch (error) {
      Alert.alert('Could not save', errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const create = async () => {
    if (isEmpty || saving) return;

    tap();
    setSaving(true);

    try {
      await itemsApi.create(userId, {
        type: 'note',
        title: title.trim() || undefined,
        content: content.trim() || undefined,
      });
      leave();
    } catch (error) {
      Alert.alert('Could not save', errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const remove = () => {
    confirm('Delete note?', 'This cannot be undone.', 'Delete', async () => {
      try {
        await itemsApi.remove(userId, note!.id);
        leave();
      } catch (error) {
        Alert.alert('Could not delete', errorMessage(error));
      }
    });
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 pb-4 pt-2">
        <HeaderButton
          icon={isNew ? X : MoveLeft}
          label={isNew ? 'Discard note' : 'Back'}
          onPress={() => {
            tap();
            if (isNew) leave();
            else router.back();
          }}
          disabled={saving}
        />

        <View className="flex-row items-center gap-4">
          {!isNew ? (
            <OverflowMenu
              items={[
                {
                  label: 'Delete',
                  icon: Trash2,
                  destructive: true,
                  onPress: remove,
                },
              ]}
            />
          ) : null}

          {isNew || isDirty ? (
            <HeaderButton
              icon={Check}
              label="Save note"
              onPress={createOrUpdate}
              disabled={isEmpty || saving}
            />
          ) : null}
        </View>
      </View>

      <View className="mx-5 pb-3" style={styles.separator}>
        <Text className="text-xs text-muted-foreground">{updatedAt}</Text>
      </View>

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Heading"
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={1}
          submitBehavior="submit"
          returnKeyType="next"
          onSubmitEditing={() => contentRef.current?.focus()}
          autoFocus={isNew}
          accessibilityLabel="Heading"
          maxLength={30}
          className="text-2xl font-bold leading-tight text-foreground"
        />
        <TextInput
          ref={contentRef}
          value={content}
          onChangeText={setContent}
          placeholder="Start writing…"
          placeholderTextColor="#94a3b8"
          multiline
          textAlignVertical="top"
          scrollEnabled={false}
          accessibilityLabel="Content"
          className="mt-3 min-h-40 flex-1 text-base leading-relaxed text-foreground"
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

function HeaderButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      className={cn(
        'size-9 items-center justify-center rounded-xl active:opacity-70 active:bg-black/5',
        disabled && 'opacity-40',
      )}
    >
      <Icon as={icon} size={24} />
    </Pressable>
  );
}

function confirm(
  title: string,
  message: string,
  action: string,
  onConfirm: () => void,
) {
  if (process.env.EXPO_OS === 'web') {
    if (globalThis.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }

  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: action, style: 'destructive', onPress: onConfirm },
  ]);
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  separator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#cbd5e1',
  },
});

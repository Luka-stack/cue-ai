import { cn } from '@/lib/utils';
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRouter } from 'expo-router';
import { type NavigationAction } from 'expo-router/react-navigation';
import {
  Bell,
  BellOff,
  Check,
  MoveLeft,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { createElement, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardToolbar,
} from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OverflowMenu } from '@/components/overflow-menu';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useUserId } from '@/contexts/user-context';
import { errorMessage, itemsApi } from '@/lib/api';
import { formatShortDateTime } from '@/lib/format';
import { cancelReminder, syncReminder } from '@/lib/reminders';
import type { ToDo } from '@/models';

type TodoEditorProps = {
  todo?: ToDo;
};

export function TodoEditor({ todo }: TodoEditorProps) {
  const router = useRouter();
  const navigation = useNavigation();
  const userId = useUserId();
  const isNew = !todo;

  const [title, setTitle] = useState(todo?.title ?? '');
  const [content, setContent] = useState(todo?.content ?? '');
  const [deadline, setDeadline] = useState<string | null>(
    todo?.deadline ?? null,
  );
  const [saving, setSaving] = useState(false);
  const [exit, setExit] = useState<NavigationAction | true | null>(null);
  const contentRef = useRef<TextInput>(null);

  // The server requires a title for to-dos.
  const isEmpty = !title.trim();
  const isDirty =
    title !== (todo?.title ?? '') ||
    content !== (todo?.content ?? '') ||
    deadline !== (todo?.deadline ?? null);

  const updatedAt = isNew
    ? formatShortDateTime(new Date().toISOString())
    : formatShortDateTime(todo.updated_at ?? todo.created_at);

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
      const saved = isNew
        ? await itemsApi.create(userId, {
            type: 'todo',
            title: title.trim(),
            content: content.trim() || undefined,
            deadline: deadline ?? undefined,
          })
        : await itemsApi.update(userId, todo!.id, {
            title: title.trim(),
            content: content.trim(),
            deadline,
          });

      // The to-do is saved either way; a reminder that can't be scheduled
      // (e.g. notifications denied) shouldn't block leaving the editor.
      if (saved.type === 'todo') {
        await syncReminder(saved).catch(() => undefined);
      }

      leave();
    } catch (error) {
      Alert.alert('Could not save', errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const remove = () => {
    confirm('Delete to-do?', 'This cannot be undone.', 'Delete', async () => {
      try {
        await itemsApi.remove(userId, todo!.id);
        await cancelReminder(todo!.id);
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
          label={isNew ? 'Discard to-do' : 'Back'}
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
              label="Save to-do"
              onPress={createOrUpdate}
              disabled={isEmpty || saving}
            />
          ) : null}
        </View>
      </View>

      <View className="mx-5 pb-3" style={styles.separator}>
        <Text className="text-xs text-muted-foreground">{updatedAt}</Text>
      </View>

      <ReminderBar
        value={deadline}
        onChange={(next) => {
          tap();
          setDeadline(next);
        }}
        disabled={saving}
      />

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        bottomOffset={TOOLBAR_HEIGHT + 24}
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
      <KeyboardToolbar />
    </SafeAreaView>
  );
}

/** Height of `KeyboardToolbar`, so the caret stays clear of it. */
const TOOLBAR_HEIGHT = 42;

// ------------------------------------------------------------------- reminder

/**
 * Bell + selected time. Tapping the bell sets a time when there is none,
 * otherwise offers to change or remove it.
 */
function ReminderBar({
  value,
  onChange,
  disabled,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}) {
  const [iosOpen, setIosOpen] = useState(false);
  const webInput = useRef<HTMLInputElement | null>(null);
  const label = formatShortDateTime(value);

  const current = () => {
    const parsed = value ? new Date(value) : null;
    if (parsed && !Number.isNaN(parsed.getTime())) return parsed;

    // Default to the next full hour.
    const next = new Date();
    next.setHours(next.getHours() + 1, 0, 0, 0);
    return next;
  };

  const commit = (picked: Date) => {
    const next = new Date(picked);
    next.setSeconds(0, 0);
    onChange(next.toISOString());
  };

  const pick = () => {
    switch (process.env.EXPO_OS) {
      case 'android':
        // Android has no combined picker: ask for the day, then the time.
        DateTimePickerAndroid.open({
          mode: 'date',
          value: current(),
          onValueChange: (_event, day) =>
            DateTimePickerAndroid.open({
              mode: 'time',
              value: day,
              onValueChange: (_e, time) => commit(time),
            }),
        });
        break;
      case 'web':
        webInput.current?.showPicker?.();
        webInput.current?.focus();
        break;
      default:
        setIosOpen(true);
    }
  };

  const onPress = () => {
    if (!value) {
      pick();
      return;
    }

    if (process.env.EXPO_OS === 'web') {
      if (globalThis.confirm('Remove reminder?\n\nCancel to change the time.'))
        onChange(null);
      else pick();
      return;
    }

    Alert.alert('Reminder', label ?? undefined, [
      { text: 'Change time', onPress: pick },
      { text: 'Remove', style: 'destructive', onPress: () => onChange(null) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View
      className="mx-5 flex-row items-center gap-2 py-2"
      style={styles.separator}
    >
      <Pressable
        onPress={onPress}
        disabled={disabled}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={
          value ? 'Change or remove reminder' : 'Set reminder'
        }
        className={cn(
          'size-9 items-center justify-center rounded-xl active:opacity-70 active:bg-black/5',
          disabled && 'opacity-40',
        )}
      >
        <Icon
          as={value ? Bell : BellOff}
          size={20}
          className={value ? 'text-indigo-500' : 'text-muted-foreground'}
        />
      </Pressable>

      <Pressable onPress={onPress} disabled={disabled} className="flex-1">
        <Text
          className={cn(
            'text-sm',
            value ? 'font-medium text-foreground' : 'text-muted-foreground',
          )}
        >
          {label ?? 'No reminder'}
        </Text>
      </Pressable>

      {process.env.EXPO_OS === 'web'
        ? createElement('input', {
            ref: webInput,
            type: 'datetime-local',
            value: value ? toLocalInput(new Date(value)) : '',
            onChange: (e: { target: { value: string } }) => {
              if (e.target.value) commit(new Date(e.target.value));
            },
            style: {
              position: 'absolute',
              opacity: 0,
              pointerEvents: 'none',
              width: 0,
              height: 0,
            },
          })
        : null}

      {process.env.EXPO_OS === 'ios' ? (
        <IosPickerSheet
          visible={iosOpen}
          initial={current()}
          onClose={() => setIosOpen(false)}
          onDone={(picked) => {
            setIosOpen(false);
            commit(picked);
          }}
        />
      ) : null}
    </View>
  );
}

function IosPickerSheet({
  visible,
  initial,
  onClose,
  onDone,
}: {
  visible: boolean;
  initial: Date;
  onClose: () => void;
  onDone: (value: Date) => void;
}) {
  const [draft, setDraft] = useState(initial);

  useEffect(() => {
    if (visible) setDraft(initial);
    // Reset only when the sheet opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/30" onPress={onClose} />
      <SafeAreaView edges={['bottom']} className="rounded-t-3xl bg-background">
        <View className="flex-row items-center justify-between px-4 pt-3">
          <HeaderButton icon={X} label="Cancel" onPress={onClose} />
          <Text className="text-base font-semibold">Reminder</Text>
          <HeaderButton
            icon={Check}
            label="Set reminder"
            onPress={() => onDone(draft)}
          />
        </View>
        <DateTimePicker
          mode="datetime"
          display="inline"
          value={draft}
          accentColor="#6366f1"
          onValueChange={(_event, picked) => setDraft(picked)}
          style={{ alignSelf: 'center' }}
        />
      </SafeAreaView>
    </Modal>
  );
}

/** `YYYY-MM-DDTHH:mm` in local time, as `<input type="datetime-local">` expects. */
function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// --------------------------------------------------------------------- shared

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

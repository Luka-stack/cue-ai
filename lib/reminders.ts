import * as Notifications from 'expo-notifications';

/**
 * Local phone reminders for to-dos. Each to-do has at most one, scheduled
 * under an identifier derived from its id, so it can be replaced or cleared
 * without keeping a separate id map.
 */

const CHANNEL_ID = 'reminders';
const supported = process.env.EXPO_OS !== 'web';

const identifierFor = (todoId: string) => `todo-${todoId}`;

let ready: Promise<boolean> | null = null;

/** Asks for permission once and creates the Android channel. */
function ensureReady(): Promise<boolean> {
  ready ??= (async () => {
    if (process.env.EXPO_OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Reminders',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;

    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  })().catch(() => {
    ready = null;
    return false;
  });

  return ready;
}

/** Show reminders as a banner even while the app is open. */
export function configureReminders() {
  if (!supported) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function cancelReminder(todoId: string) {
  if (!supported) return;

  await Notifications.cancelScheduledNotificationAsync(
    identifierFor(todoId),
  ).catch(() => undefined);
}

/**
 * Schedules (or replaces) the reminder for a to-do. A missing, past or
 * completed date only clears the existing one.
 */
export async function syncReminder(todo: {
  id: string;
  title: string;
  deadline?: string | null;
  completed?: boolean;
}) {
  if (!supported) return;

  await cancelReminder(todo.id);

  const at = todo.deadline ? new Date(todo.deadline) : null;
  if (todo.completed || !at || Number.isNaN(at.getTime())) return;
  if (at.getTime() <= Date.now()) return;

  if (!(await ensureReady())) return;

  await Notifications.scheduleNotificationAsync({
    identifier: identifierFor(todo.id),
    content: {
      title: todo.title,
      body: 'Reminder from Cue',
      data: { todoId: todo.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: at,
      channelId: CHANNEL_ID,
    },
  });
}

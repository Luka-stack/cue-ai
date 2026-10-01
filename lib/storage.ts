import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_KEY = 'cueai.userId';

export async function loadUserId(): Promise<string | null> {
  const value = await AsyncStorage.getItem(USER_ID_KEY);
  return value?.trim() ? value.trim() : null;
}

export async function saveUserId(userId: string): Promise<void> {
  await AsyncStorage.setItem(USER_ID_KEY, userId.trim());
}

export async function clearUserId(): Promise<void> {
  await AsyncStorage.removeItem(USER_ID_KEY);
}

// The open chat thread, so the next launch can delete it before starting a new one.
const THREAD_ID_KEY = 'cueai.threadId';

export async function loadThreadId(): Promise<string | null> {
  const value = await AsyncStorage.getItem(THREAD_ID_KEY);
  return value?.trim() ? value.trim() : null;
}

export async function saveThreadId(threadId: string | null): Promise<void> {
  if (threadId) await AsyncStorage.setItem(THREAD_ID_KEY, threadId);
  else await AsyncStorage.removeItem(THREAD_ID_KEY);
}

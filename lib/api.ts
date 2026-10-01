import type {
  Item,
  ItemCounts,
  ItemCreate,
  ItemFilter,
  ItemUpdate,
  ReviewAction,
  Thread,
  Turn,
} from '@/models';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getTimeZone } from './timezone';

const SERVER_PORT = 8000;

/**
 * Where the CueAI server lives.
 *
 * 1. `EXPO_PUBLIC_API_URL` when set (see .env.example).
 * 2. Otherwise the machine running Metro, on the server's default port. A phone on
 *    the same Wi-Fi or an emulator needs this, since "localhost" would point at
 *    the device itself.
 * 3. Otherwise localhost (web).
 */
function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, '');

  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host && Platform.OS !== 'web') return `http://${host}:${SERVER_PORT}`;

  return `http://localhost:${SERVER_PORT}`;
}

export const API_BASE_URL = resolveBaseUrl();

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}

type Query = Record<string, string | number | undefined>;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Query;
};

function buildUrl(path: string, query?: Query): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }

  const qs = params.toString();

  return `${API_BASE_URL}/api/v1${path}${qs ? `?${qs}` : ''}`;
}

async function readDetail(response: Response): Promise<string> {
  try {
    const body = await response.json();
    const detail = body?.detail;

    if (typeof detail === 'string') return detail;

    // FastAPI validation errors are a list of {loc, msg, type}.
    if (Array.isArray(detail)) {
      return detail.map((d) => d?.msg ?? JSON.stringify(d)).join('; ');
    }
  } catch {
    // no JSON body
  }

  return response.statusText || `Request failed with status ${response.status}`;
}

async function request<T>(
  userId: string,
  path: string,
  { method = 'GET', body, query }: RequestOptions = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    throw new ApiError(
      0,
      `Cannot reach the server at ${API_BASE_URL} (${
        error instanceof Error ? error.message : 'network error'
      })`,
    );
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readDetail(response));
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

// ----------------------------------------------------------------------- items

export const itemsApi = {
  list: (userId: string, filter: ItemFilter = 'all') =>
    request<Item[]>(userId, '/items', { query: { filter, tz: getTimeZone() } }),

  counts: (userId: string) =>
    request<ItemCounts>(userId, '/items/counts', {
      query: { tz: getTimeZone() },
    }),

  get: (userId: string, id: string) => request<Item>(userId, `/items/${id}`),

  create: (userId: string, payload: ItemCreate) =>
    request<Item>(userId, '/items', { method: 'POST', body: payload }),

  update: (userId: string, id: string, payload: ItemUpdate) =>
    request<Item>(userId, `/items/${id}`, { method: 'PATCH', body: payload }),

  remove: (userId: string, id: string) =>
    request<void>(userId, `/items/${id}`, { method: 'DELETE' }),
};

// ------------------------------------------------------------------------ chat

export const chatApi = {
  createThread: (userId: string, title?: string) =>
    request<Thread>(userId, '/chat/threads', {
      method: 'POST',
      body: title ? { title } : undefined,
    }),

  deleteThread: (userId: string, threadId: string) =>
    request<void>(userId, `/chat/threads/${threadId}`, { method: 'DELETE' }),

  sendMessage: (userId: string, threadId: string, content: string) =>
    request<Turn>(userId, `/chat/threads/${threadId}/messages`, {
      method: 'POST',
      body: { content },
      query: { tz: getTimeZone() },
    }),

  review: (
    userId: string,
    threadId: string,
    action: ReviewAction,
    feedback?: string,
  ) =>
    request<Turn>(userId, `/chat/threads/${threadId}/review`, {
      method: 'POST',
      body: feedback ? { action, feedback } : { action },
      query: { tz: getTimeZone() },
    }),
};

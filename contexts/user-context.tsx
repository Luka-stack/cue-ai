import { clearUserId, loadUserId, saveUserId } from '@/lib/storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

type UserContextValue = {
  userId: string | null;
  loaded: boolean;
  signOut: () => Promise<void>;
  setUserId: (userId: string) => Promise<void>;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: PropsWithChildren) {
  const [userId, setUserIdState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadUserId()
      .catch(() => null)
      .then((stored) => {
        if (cancelled) return;
        setUserIdState(stored);
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setUserId = useCallback(async (next: string) => {
    const trimmed = next.trim();
    if (!trimmed) return;
    await saveUserId(trimmed);
    setUserIdState(trimmed);
  }, []);

  const signOut = useCallback(async () => {
    await clearUserId();
    setUserIdState(null);
  }, []);

  const value = useMemo(
    () => ({ userId, loaded, setUserId, signOut }),
    [userId, loaded, setUserId, signOut],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside <UserProvider>');
  return ctx;
}

export function useUserId(): string {
  const { userId } = useUser();
  if (!userId) throw new Error('useUserId called before a user was chosen');
  return userId;
}

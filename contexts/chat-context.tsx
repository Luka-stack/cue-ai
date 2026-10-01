import { chatApi, errorMessage } from '@/lib/api';
import { loadThreadId, saveThreadId } from '@/lib/storage';
import type {
  Message,
  PendingReview,
  ProposalDecision,
  ReviewAction,
  ServerMessage,
  Turn,
} from '@/models';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { useUser } from './user-context';

const GREETING =
  "Tell me what's on your mind — I'll sort it into a to-do or a note, and set up anything time-sensitive.";

type ChatContextValue = {
  messages: Message[];
  pendingReview: PendingReview | null;
  starting: boolean;
  busy: boolean;
  newChat: () => Promise<void>;
  submit: (text: string) => Promise<void>;
  decide: (action: ReviewAction, feedback?: string) => Promise<void>;
};

const ChatContext = createContext<ChatContextValue | null>(null);

let localId = 0;
const nextLocalId = (prefix: string) => `${prefix}-${Date.now()}-${localId++}`;

function greeting(): Message {
  return { id: nextLocalId('greeting'), type: 'ai', content: GREETING };
}

function fromServer(message: ServerMessage): Message | null {
  if (message.role === 'user') {
    return { id: message.id, type: 'user', content: message.content };
  }

  if (message.role === 'assistant') {
    return { id: message.id, type: 'ai', content: message.content };
  }

  return null;
}

export function parseDecision(text: string): {
  action: ReviewAction;
  feedback?: string;
} {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase().replace(/[.!]+$/, '');

  if (['accept', 'yes', 'y', 'ok', 'save'].includes(lower)) {
    return { action: 'accept' };
  }

  if (['reject', 'no', 'n', 'discard', 'cancel'].includes(lower)) {
    return { action: 'reject' };
  }

  const feedback = trimmed.replace(/^revise\s*[:\-]?\s*/i, '').trim();
  return { action: 'revise', feedback: feedback || trimmed };
}

export function ChatProvider({ children }: PropsWithChildren) {
  const { userId } = useUser();
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([greeting()]);
  const [pendingReview, setPendingReview] = useState<PendingReview | null>(
    null,
  );
  const [starting, setStarting] = useState(false);
  const [busy, setBusy] = useState(false);

  // Guards against a slow thread creation resolving after a newer one.
  const generation = useRef(0);
  // Mirrors threadId so newChat can read it without re-creating the callback
  // (the mount effect depends on newChat).
  const currentThreadId = useRef<string | null>(null);
  currentThreadId.current = threadId;

  const newChat = useCallback(async () => {
    if (!userId) return;

    const gen = ++generation.current;
    // The thread from this session, or the one left behind by the last launch.
    const previousThreadId =
      currentThreadId.current ?? (await loadThreadId().catch(() => null));
    if (gen !== generation.current) return;

    setStarting(true);
    setThreadId(null);
    setPendingReview(null);
    setMessages([greeting()]);

    try {
      const thread = await chatApi.createThread(userId);
      if (gen !== generation.current) return;

      setThreadId(thread.id);
      saveThreadId(thread.id).catch(() => undefined);

      // There is no chat history in the app, so the old thread is dead weight
      // on the server. Best effort: a failure here is invisible to the user.
      if (previousThreadId && previousThreadId !== thread.id) {
        chatApi.deleteThread(userId, previousThreadId).catch(() => undefined);
      }
    } catch (error) {
      if (gen !== generation.current) return;
      setMessages((prev) => [
        ...prev,
        {
          id: nextLocalId('error'),
          type: 'error',
          content: `Could not start a chat: ${errorMessage(error)}`,
        },
      ]);
    } finally {
      if (gen === generation.current) setStarting(false);
    }
  }, [userId]);

  // Opening the app (or switching user) always starts a fresh conversation.
  useEffect(() => {
    if (userId) void newChat();
  }, [userId, newChat]);

  const settleProposal = useCallback((decision: ProposalDecision) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.type === 'proposal' && !m.decision ? { ...m, decision } : m,
      ),
    );
  }, []);

  const applyTurn = useCallback((turn: Turn, dropOptimisticId?: string) => {
    setMessages((prev) => {
      const kept = dropOptimisticId
        ? prev.filter((m) => m.id !== dropOptimisticId)
        : prev;

      const added = turn.messages
        .map(fromServer)
        .filter((m): m is Message => m !== null);

      const proposal: Message[] = turn.pending_review
        ? [
            {
              id: nextLocalId('proposal'),
              type: 'proposal',
              review: turn.pending_review,
            },
          ]
        : [];
      return [...kept, ...added, ...proposal];
    });
    setPendingReview(turn.pending_review);
  }, []);

  const pushError = useCallback((error: unknown) => {
    setMessages((prev) => [
      ...prev,
      { id: nextLocalId('error'), type: 'error', content: errorMessage(error) },
    ]);
  }, []);

  const decide = useCallback(
    async (action: ReviewAction, feedback?: string) => {
      if (!userId || !threadId || busy || !pendingReview) return;

      setBusy(true);
      const decision: ProposalDecision =
        action === 'accept'
          ? 'accepted'
          : action === 'reject'
            ? 'rejected'
            : 'revised';

      const echoId = nextLocalId('user');
      // Echo the decision so the transcript reads naturally.
      setMessages((prev) => [
        ...prev,
        {
          id: echoId,
          type: 'user',
          content:
            action === 'revise' && feedback
              ? `Revise: ${feedback}`
              : action === 'accept'
                ? 'Accept'
                : 'Reject',
        },
      ]);

      try {
        const turn = await chatApi.review(userId, threadId, action, feedback);
        settleProposal(decision);
        applyTurn(turn);
      } catch (error) {
        pushError(error);
      } finally {
        setBusy(false);
      }
    },
    [
      userId,
      threadId,
      busy,
      pendingReview,
      settleProposal,
      applyTurn,
      pushError,
    ],
  );

  const submit = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || !userId || !threadId || busy) return;

      if (pendingReview) {
        const { action, feedback } = parseDecision(content);
        await decide(action, feedback);
        return;
      }

      setBusy(true);
      const optimisticId = nextLocalId('user');
      setMessages((prev) => [
        ...prev,
        { id: optimisticId, type: 'user', content },
      ]);

      try {
        const turn = await chatApi.sendMessage(userId, threadId, content);
        applyTurn(turn, optimisticId);
      } catch (error) {
        pushError(error);
      } finally {
        setBusy(false);
      }
    },
    [userId, threadId, busy, pendingReview, decide, applyTurn, pushError],
  );

  const value = useMemo(
    () => ({
      messages,
      pendingReview,
      starting,
      busy,
      newChat,
      submit,
      decide,
    }),
    [messages, pendingReview, starting, busy, newChat, submit, decide],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used inside <ChatProvider>');
  return ctx;
}

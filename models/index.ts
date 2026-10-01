// ----------------------------------------------------------------------- items
// Shapes mirror the server contract in server/app/schemas/item.py.

export type TodoStatus = 'not started' | 'in progress' | 'done' | 'archived';

type BaseItem = {
  id: string;
  type: 'note' | 'todo';
};

export type Note = BaseItem & {
  type: 'note';
  title?: string | null;
  content?: string | null;
};

export type ToDo = BaseItem & {
  type: 'todo';
  title: string;
  /** UTC ISO-8601 (Z suffix). */
  date?: string | null;
  content?: string | null;
  completed?: boolean;
  status?: TodoStatus;
  solutions?: string[] | null;
  /** Estimated effort in minutes. */
  time_to_complete?: number | null;
};

export type Item = Note | ToDo;

export type ItemFilter = 'all' | 'today' | 'notes' | 'completed';

export type ItemCounts = Record<ItemFilter, number>;

export type NoteCreate = {
  type: 'note';
  title?: string;
  content?: string;
};

export type ToDoCreate = {
  type: 'todo';
  title: string;
  content?: string;
  date?: string;
};

export type ItemCreate = NoteCreate | ToDoCreate;

export type ItemUpdate = Partial<{
  title: string;
  content: string;
  date: string | null;
  completed: boolean;
  status: TodoStatus;
  solutions: string[];
  time_to_complete: number;
}>;

// ------------------------------------------------------------------------ chat
// Shapes mirror server/app/schemas/chat.py.

export type Thread = {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatRole = 'user' | 'assistant' | 'tool';

export type ServerMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

/** What the agent extracted for a note (server/app/agent/schemas.py). */
export type NoteValue = {
  title: string;
  content?: string | null;
};

/** What the agent extracted for a to-do (server/app/agent/schemas.py). */
export type ToDoValue = {
  task: string;
  time_to_complete?: number | null;
  deadline?: string | null;
  solutions?: string[];
  status?: TodoStatus;
};

export type ProposalRecord = {
  /** The item id the record will be stored under once accepted. */
  doc_id: string;
  is_new: boolean;
  before: Partial<NoteValue & ToDoValue>;
  value: NoteValue | ToDoValue;
};

export type PendingReview = {
  kind: 'note' | 'todo';
  action_request: string;
  summary: string;
  help: string;
  records: ProposalRecord[];
};

export type TurnStatus = 'completed' | 'awaiting_review';

export type Turn = {
  thread: Thread;
  status: TurnStatus;
  messages: ServerMessage[];
  pending_review: PendingReview | null;
};

export type ReviewAction = 'accept' | 'reject' | 'revise';

// ----------------------------------------------------------------- UI messages
// What the chat screen renders: server turns plus local-only entries
// (the greeting, errors, resolved proposals).

type BaseMessage = {
  id: string;
  type: 'user' | 'ai' | 'proposal' | 'error';
};

export type UserMessage = BaseMessage & {
  type: 'user';
  content: string;
};

export type AiMessage = BaseMessage & {
  type: 'ai';
  content: string;
};

export type ProposalDecision = 'accepted' | 'rejected' | 'revised';

export type ProposalMessage = BaseMessage & {
  type: 'proposal';
  review: PendingReview;
  decision?: ProposalDecision;
};

export type ErrorMessage = BaseMessage & {
  type: 'error';
  content: string;
};

export type Message = UserMessage | AiMessage | ProposalMessage | ErrorMessage;

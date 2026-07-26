type BaseItem = {
  id: string;
  type: 'note' | 'todo';
};

export type Note = BaseItem & {
  type: 'note';
  title?: string;
  content?: string;
};

export type ToDo = BaseItem & {
  type: 'todo';
  title: string;
  date?: string;
  content?: string;
  completed?: boolean;
};

export type Item = Note | ToDo;

type BaseMessage = {
  id: string;
  type: 'user' | 'ai' | 'system';
};

export type UserMessage = BaseMessage & {
  type: 'user';
  content: string;
};

export type AiMessage = BaseMessage & {
  type: 'ai';
  content: string;
};

export type SystemMessage<T extends Item = Item> = BaseMessage & {
  type: 'system';
  content: string;
  item: T;
};

export type Message = UserMessage | AiMessage | SystemMessage<any>;

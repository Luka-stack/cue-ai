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

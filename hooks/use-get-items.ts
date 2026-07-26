import { Item } from '@/models';
import { useEffect, useState } from 'react';

export function useGetItems() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    // Simulate fetching items from an API or database
    const fetched = ITEMS.sort((a, b) => {
      if (a.type === 'note' && b.type === 'todo') return -1;
      if (a.type === 'todo' && b.type === 'note') return 1;
      if (a.type === 'note' && b.type === 'note') return 0;

      if (a.type === 'todo' && b.type === 'todo') {
        if (!a.date || !b.date) return 0;

        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }

      return 0;
    });
    // setItems([...fetched, ...fetched, ...fetched, ...fetched, ...fetched]);
    setItems(fetched);
  }, []);

  return { items };
}

const ITEMS: Item[] = [
  {
    id: '1',
    type: 'note',
    title: 'Note #1',
    content: 'Content for Note 1',
  },
  {
    id: '2',
    type: 'note',
    title: 'Note #2',
    content: 'Content for Note 2',
  },
  {
    id: '3',
    type: 'todo',
    title: 'ToDo #1',
    content: 'Content for ToDo 1',
    completed: false,
    date: '2026-07-26T10:00:00Z',
  },
  {
    id: '4',
    type: 'todo',
    title: 'ToDo #1',
    content: 'Content for ToDo 1',
    completed: false,
    date: '2026-07-27T10:00:00Z',
  },
  {
    id: '5',
    type: 'todo',
    title: 'ToDo #1',
    completed: false,
  },
  {
    id: '6',
    type: 'todo',
    title: 'ToDo #1',
    content: 'Content for ToDo 1',
    completed: true,
  },
];

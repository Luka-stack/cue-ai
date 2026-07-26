import { Message } from '@/models';
import { useEffect, useState } from 'react';

export function useGetMessages() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Simulate fetching messages from an API or database
    const fetchMessages = async () => {
      // Here you would typically make an API call to fetch messages
      // For demonstration, we will use a static array of messages
      const fetchedMessages: Message[] = CHAT_2; // Replace with actual API call
      setMessages(fetchedMessages);
    };

    fetchMessages();
  }, []);

  return messages;
}

const CHAT_1: Message[] = [
  {
    id: '1',
    type: 'ai',
    content:
      "Tell me what's on your mind — I'll sort it into a to-do, note, or reminder, and set up anything time-sensitive.",
  },
  {
    id: '2',
    type: 'user',
    content: 'Note: Gift ideas for mom',
  },
  {
    id: '3',
    type: 'system',
    content: "Here's what I caught - want me to add it?",
    item: {
      id: '1',
      type: 'note',
      title: 'Gift ideas for mom',
    },
  },
];

const CHAT_2: Message[] = [
  {
    id: '1',
    type: 'ai',
    content:
      "Tell me what's on your mind — I'll sort it into a to-do, note, or reminder, and set up anything time-sensitive.",
  },
  {
    id: '2',
    type: 'user',
    content: 'Note: Gift ideas for mom',
  },
  {
    id: '3',
    type: 'system',
    content: "Here's what I caught - want me to add it?",
    item: {
      id: '1',
      type: 'todo',
      title: 'Gift ideas for mom',
      date: '2023-12-01T10:00:00Z',
    },
  },
];

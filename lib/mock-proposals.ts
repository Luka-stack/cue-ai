import type { Message } from '@/models';

/**
 * Dev-only: seeds every new chat with sample proposal cards so the To-Do and
 * Note proposals can be designed without driving the agent. Flip to false
 * (or delete this file and its two call sites in chat-context) when done.
 */
export const SHOW_MOCK_PROPOSALS = __DEV__ && true;

const inTwoDays = () => {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  date.setHours(17, 0, 0, 0);
  return date.toISOString();
};

export function mockProposals(): Message[] {
  return [
    // Resolved states, as they look further up the transcript.
    {
      id: 'mock-user-1',
      type: 'user',
      content: 'Remind me to call the dentist',
    },
    {
      id: 'mock-proposal-todo-accepted',
      type: 'proposal',
      decision: 'accepted',
      review: {
        kind: 'todo',
        action_request: 'add this to-do',
        summary: 'Call the dentist',
        help: '',
        records: [
          {
            doc_id: 'mock-todo-0',
            is_new: true,
            before: {},
            value: { task: 'Call the dentist', status: 'not started' },
          },
        ],
      },
    },
    {
      id: 'mock-proposal-note-rejected',
      type: 'proposal',
      decision: 'rejected',
      review: {
        kind: 'note',
        action_request: 'save this note',
        summary: 'Wi-Fi password',
        help: '',
        records: [
          {
            doc_id: 'mock-note-0',
            is_new: false,
            before: { title: 'Wi-Fi', content: 'old password' },
            value: { title: 'Wi-Fi', content: 'Guest network: cue-guest' },
          },
        ],
      },
    },

    // A revised note with two records, then the one pending card. The server
    // waits for a decision after each proposal, so only one is ever pending.
    {
      id: 'mock-user-3',
      type: 'user',
      content: 'Gift ideas for Anna: a ceramics class, the new Murakami book',
    },
    {
      id: 'mock-proposal-note-revised',
      type: 'proposal',
      decision: 'revised',
      review: {
        kind: 'note',
        action_request: 'save this note',
        summary: 'Gift ideas for Anna',
        help: 'Reply accept, reject, or tell me what to change.',
        records: [
          {
            doc_id: 'mock-note-1',
            is_new: true,
            before: {},
            value: {
              title: 'Gift ideas for Anna',
              content:
                'A ceramics class (weekend workshop downtown) and the new Murakami book.',
            },
          },
          {
            doc_id: 'mock-note-2',
            is_new: false,
            before: { title: 'Birthdays', content: 'Anna — March 3' },
            value: {
              title: 'Birthdays',
              content: 'Anna — March 3. Gift ideas saved separately.',
            },
          },
        ],
      },
    },
    {
      id: 'mock-user-2',
      type: 'user',
      content:
        'I need to finish the quarterly report by Friday, maybe 2 hours of work',
    },
    {
      id: 'mock-proposal-todo-pending',
      type: 'proposal',
      review: {
        kind: 'todo',
        action_request: 'add this to-do',
        summary: 'Finish the quarterly report',
        help: 'Reply accept, reject, or tell me what to change.',
        records: [
          {
            doc_id: 'mock-todo-1',
            is_new: true,
            before: {},
            value: {
              task: 'Finish the quarterly report',
              deadline: inTwoDays(),
              time_to_complete: 120,
              status: 'in progress',
              solutions: [
                'Pull the Q3 numbers from the finance dashboard first',
                'Reuse last quarter’s slide template',
                'Block a 2-hour focus slot tomorrow morning',
              ],
            },
          },
        ],
      },
    },
  ];
}

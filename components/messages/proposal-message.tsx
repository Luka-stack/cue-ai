import { useChat } from '@/contexts/chat-context';
import { formatDateTime, formatMinutes } from '@/lib/format';
import { cn } from '@/lib/utils';
import type {
  NoteValue,
  ProposalDecision,
  ProposalMessage as ProposalMessageType,
  ProposalRecord,
  ToDoValue,
} from '@/models';
import { View } from 'react-native';
import { Button } from '../ui/button';
import { Text } from '../ui/text';

const COLORS = {
  todo: { accent: '#1F84E4', tint: '#1F84E41A', label: 'To-Do' },
  note: { accent: '#EF4E5B', tint: '#EF4E5B1A', label: 'Note' },
} as const;

const DECISION_LABEL: Record<ProposalDecision, string> = {
  accepted: 'Accepted',
  rejected: 'Rejected',
  revised: 'Revised',
};

function NoteRecord({ value }: { value: NoteValue }) {
  return (
    <>
      <Text className="text-lg font-semibold">{value.title}</Text>
      {value.content ? <Text className="mt-1">{value.content}</Text> : null}
    </>
  );
}

function ToDoRecord({ value }: { value: ToDoValue }) {
  const deadline = formatDateTime(value.deadline);
  const effort = formatMinutes(value.time_to_complete);
  const solutions = value.solutions?.filter(Boolean) ?? [];

  return (
    <>
      <Text className="text-lg font-semibold">{value.task}</Text>

      <View className="flex-row flex-wrap gap-x-4 gap-y-1 mt-1">
        <Text className="text-[14px] text-muted-foreground">
          {deadline ? `Due ${deadline}` : 'No deadline'}
        </Text>

        {effort ? (
          <Text className="text-[14px] text-muted-foreground">~{effort}</Text>
        ) : null}

        {value.status && value.status !== 'not started' ? (
          <Text className="text-[14px] text-muted-foreground capitalize">
            {value.status}
          </Text>
        ) : null}
      </View>

      {solutions.length > 0 ? (
        <View className="mt-3 gap-1">
          <Text className="text-sm font-semibold text-muted-foreground">
            Ideas
          </Text>
          {solutions.map((solution, i) => (
            <Text key={i} className="text-sm">
              • {solution}
            </Text>
          ))}
        </View>
      ) : null}
    </>
  );
}

function Record({
  record,
  kind,
}: {
  record: ProposalRecord;
  kind: 'note' | 'todo';
}) {
  const colors = COLORS[kind];

  return (
    <View className="mt-3">
      <View className="flex-row items-center mb-2 ml-1 gap-2">
        <Text
          style={{ backgroundColor: colors.tint, color: colors.accent }}
          className="px-3 text-[14px] rounded-sm py-px"
        >
          {colors.label}
        </Text>

        {!record.is_new ? (
          <Text className="bg-slate-200 text-slate-600 px-3 text-[14px] rounded-sm py-px">
            Update
          </Text>
        ) : null}
      </View>

      {kind === 'note' ? (
        <NoteRecord value={record.value as NoteValue} />
      ) : (
        <ToDoRecord value={record.value as ToDoValue} />
      )}
    </View>
  );
}

/**
 * The "Here's what I caught — want me to add it?" card. While the review is
 * pending it offers Accept / Reject; typing in the chat input answers it too
 * (accept, reject, or revise + feedback).
 */
export function ProposalMessage({ message }: { message: ProposalMessageType }) {
  const { decide, busy } = useChat();
  const { review, decision } = message;
  const colors = COLORS[review.kind];
  const pending = !decision;

  return (
    <View
      style={{ borderLeftColor: colors.accent }}
      className={cn(
        'flex rounded-2xl bg-card shadow shadow-black/5 border-l-4 p-4 mt-4',
        !pending && 'opacity-70',
      )}
    >
      <View className="flex-row items-start justify-between gap-3">
        <Text className="text-muted-foreground shrink">
          {pending
            ? `Here's what I caught — want me to ${review.action_request}?`
            : `I proposed to ${review.action_request}.`}
        </Text>

        {decision ? (
          <Text
            className={cn(
              'text-[13px] font-semibold px-2 py-px rounded-sm',
              decision === 'accepted' && 'bg-emerald-100 text-emerald-700',
              decision === 'rejected' && 'bg-slate-200 text-slate-600',
              decision === 'revised' && 'bg-amber-100 text-amber-700',
            )}
          >
            {DECISION_LABEL[decision]}
          </Text>
        ) : null}
      </View>

      {review.records.map((record) => (
        <Record key={record.doc_id} record={record} kind={review.kind} />
      ))}

      {pending ? (
        <>
          <View className="flex-row gap-3 mt-5">
            <Button
              onPress={() => decide('accept')}
              disabled={busy}
              accessibilityLabel="Accept"
              style={{ backgroundColor: colors.accent }}
              className="flex-1"
            >
              <Text className="font-semibold text-lg text-white">Accept</Text>
            </Button>
            <Button
              onPress={() => decide('reject')}
              disabled={busy}
              variant="outline"
              accessibilityLabel="Reject"
              className="flex-1 border-slate-300 bg-transparent shadow-none"
            >
              <Text className="font-semibold text-lg text-slate-600">
                Reject
              </Text>
            </Button>
          </View>

          <Text className="text-xs text-muted-foreground mt-3 text-center">
            Or type what to change and I&apos;ll revise it.
          </Text>
        </>
      ) : null}
    </View>
  );
}

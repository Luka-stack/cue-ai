import type { ProposalMessage as ProposalMessageType } from '@/models';
import { View } from 'react-native';
import { Text } from '../ui/text';

const COLORS = {
  todo: { accent: '#1F84E4', tint: '#1F84E41A', label: 'To-Do' },
  note: { accent: '#EF4E5B', tint: '#EF4E5B1A', label: 'Note' },
} as const;

export function ProposalMessage2({
  message,
}: {
  message: ProposalMessageType;
}) {
  const { review, decision } = message;
  const colors = COLORS[review.kind];
  const pending = !decision;

  return (
    <View className="mt-4">
      <Text className="font-semibold">Here's what I caught:</Text>

      <View className="mt-2 mb-4 border-hairline rounded-2xl p-4">
        <View className="flex-row items-center mb-2 ml-1 gap-2">
          <Text
            style={{ backgroundColor: colors.tint, color: colors.accent }}
            className="px-3 text-[14px] rounded-sm py-px"
          >
            {colors.label}
          </Text>

          {!pending ? (
            <Text className="bg-slate-200 text-slate-600 px-3 text-[14px] rounded-sm py-px">
              Update
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

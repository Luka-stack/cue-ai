import { PressableScale } from "@/components/ui/pressable-scale";
import { Text } from "@/components/ui/text";
import { useChat } from "@/contexts/chat-context";
import { useUserId } from "@/contexts/user-context";
import { View } from "react-native";

/** Each one is sent to the agent as the first message. */
const SUGGESTIONS = [
  "Tell me what I need to do.",
  "Anything urgent today?",
  "Summarize my notes.",
];

function Suggestion({ text }: { text: string }) {
  const { submit, starting, busy } = useChat();

  return (
    <PressableScale
      onPress={() => void submit(text)}
      disabled={starting || busy}
      accessibilityRole="button"
      accessibilityLabel={text}
      containerStyle={{ maxWidth: "100%" }}
      className="rounded-xl border-hairline border-border bg-card px-3 py-2 active:bg-indigo-100 dark:active:bg-indigo-950"
    >
      <Text>{text}</Text>
    </PressableScale>
  );
}

export function GreetingMessage() {
  const userId = useUserId();

  return (
    <View className="mt-20">
      <Text className="text-2xl font-bold text-center">
        {userId ? `Welcome back, ${userId}` : "Hello!"}
      </Text>
      <Text className="mt-2 text-lg text-center">
        Tell me what&apos;s on your mind {"\n"} I&apos;ll help you organize it.
      </Text>

      {/* Wraps instead of overflowing, so no chip gets cut off on narrow screens. */}
      <View className="mt-4 flex-row flex-wrap justify-center gap-3">
        {SUGGESTIONS.map((text) => (
          <Suggestion key={text} text={text} />
        ))}
      </View>
    </View>
  );
}

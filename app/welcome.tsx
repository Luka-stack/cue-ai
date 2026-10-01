import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useUser } from '@/contexts/user-context';
import { Sparkle } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

const MAX_LENGTH = 128; // the server caps X-User-Id at 128 characters

export default function WelcomeScreen() {
  const { setUserId } = useUser();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue = name.trim().length > 0 && !saving;

  const handleContinue = async () => {
    if (!canContinue) return;

    setSaving(true);
    setError(null);

    try {
      await setUserId(name);
      // The root layout swaps this screen for the tabs once the user is set.
    } catch {
      setError('Could not save your username. Please try again.');
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1 justify-center px-6 gap-6"
      >
        <View className="items-center gap-3">
          <View className="items-center justify-center p-3 rounded-2xl bg-indigo-500">
            <Sparkle size={32} color="white" fill="white" strokeWidth={1} />
          </View>
          <Text variant="h3">Welcome to Cue</Text>
          <Text variant="muted" className="text-center">
            Pick a username. Your notes, to-dos and chats are kept under it.
          </Text>
        </View>

        <View className="gap-3">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Username"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            maxLength={MAX_LENGTH}
            returnKeyType="done"
            onSubmitEditing={handleContinue}
            accessibilityLabel="Username"
            className="bg-card rounded-2xl px-4 py-4 text-lg text-foreground shadow shadow-black/5"
          />

          {error ? (
            <Text className="text-sm text-red-500 ml-1">{error}</Text>
          ) : null}

          <Button
            onPress={handleContinue}
            disabled={!canContinue}
            className={cn('rounded-2xl h-14 bg-indigo-500')}
            accessibilityLabel="Continue"
          >
            <Text className="text-white text-lg font-semibold">
              {saving ? 'Saving…' : 'Continue'}
            </Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

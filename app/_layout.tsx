import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeProvider } from 'expo-router/react-navigation';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';
import '../global.css';

import { NAV_THEME } from '@/constants/theme';
import { ChatProvider } from '@/contexts/chat-context';
import { UserProvider, useUser } from '@/contexts/user-context';
import { Platform } from 'react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Keep the splash up until we know whether a username is stored.
SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootNavigator() {
  const { userId, loaded } = useUser();
  const hasUser = loaded && !!userId;

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => undefined);
  }, [loaded]);

  if (!loaded) return null;

  return (
    <Stack>
      {/* First launch: ask for a username before anything else. */}
      <Stack.Protected guard={!hasUser}>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={hasUser}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{
            presentation: Platform.OS === 'ios' ? 'modal' : 'formSheet',
            headerShown: false,
            sheetAllowedDetents: [0.85],
            sheetInitialDetentIndex: 0,
            sheetCornerRadius: 32,
          }}
        />
        <Stack.Screen name="item/[id]" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const statusScheme = colorScheme === 'dark' ? 'light' : 'dark';

  return (
    <ThemeProvider value={NAV_THEME[colorScheme]}>
      <UserProvider>
        <ChatProvider>
          <KeyboardProvider>
            <RootNavigator />
            <StatusBar style={statusScheme} />
            <PortalHost />
          </KeyboardProvider>
        </ChatProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

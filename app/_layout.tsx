import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';
import '../global.css';

import { NAV_THEME } from '@/constants/theme';
import { Platform } from 'react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const statusScheme = colorScheme === 'dark' ? 'light' : 'dark';

  return (
    <ThemeProvider value={NAV_THEME[colorScheme]}>
      <KeyboardProvider>
        <Stack>
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
        </Stack>
        <StatusBar style={statusScheme} />
        <PortalHost />
      </KeyboardProvider>
    </ThemeProvider>
  );
}

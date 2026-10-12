import { FloatingTabBar } from '@/components/floating-tab-bar';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import type { BottomTabNavigationOptions } from 'expo-router/js-tabs';
import React from 'react';
import { Dimensions, Easing, StyleSheet } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Soft indigo wash: tinted at the top, near-white in the middle. */
const BACKGROUND_GRADIENT = {
  light: ['#DDE3FF', '#EEF1FF', '#F8F9FF', '#EEF0FF'],
  dark: ['#1E1B4B', '#110F2A', '#0A0A0F', '#0F0D24'],
} as const;

/**
 * Every tab paints its own gradient. Inactive tabs stay mounted underneath the
 * focused one, so each scene must be opaque or the others would show through.
 */
function ScreenBackground({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme() ?? 'light';

  return (
    <LinearGradient
      colors={BACKGROUND_GRADIENT[scheme]}
      locations={[0, 0.3, 0.7, 1]}
      style={StyleSheet.absoluteFill}
    >
      <SafeAreaView className="flex-1" edges={['top']}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

/**
 * Full-width slide between tabs: the new tab pushes the old one off-screen in
 * the direction of travel (progress is -1 left of the active tab, 1 right).
 */
const slide: BottomTabNavigationOptions['sceneStyleInterpolator'] = ({ current }) => {
  const width = Dimensions.get('window').width;

  return {
    sceneStyle: {
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [-width, 0, width],
          }),
        },
      ],
    },
  };
};

export default function TabLayout() {
  return (
    <KeyboardProvider>
      <Tabs
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenLayout={({ children }) => (
          <ScreenBackground>{children}</ScreenBackground>
        )}
        screenOptions={{
          headerShown: false,
          sceneStyleInterpolator: slide,
          transitionSpec: {
            animation: 'timing',
            config: { duration: 280, easing: Easing.out(Easing.cubic) },
          },
        }}
      >
        <Tabs.Screen name="chat/index" options={{ title: 'Chat' }} />
        <Tabs.Screen name="todos/index" options={{ title: 'To-dos' }} />
        <Tabs.Screen name="notes/index" options={{ title: 'Notes' }} />
      </Tabs>
    </KeyboardProvider>
  );
}

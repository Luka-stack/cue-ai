import { FloatingTabBar } from '@/components/floating-tab-bar';
import { Header } from '@/components/header';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-5 pt-5 pb-1">
        <Header />
      </View>

      <KeyboardProvider>
        <Tabs
          tabBar={(props) => <FloatingTabBar {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Tabs.Screen name="chat/index" options={{ title: 'Chat' }} />
          <Tabs.Screen name="today/index" options={{ title: 'Today' }} />
        </Tabs>
      </KeyboardProvider>
    </SafeAreaView>
  );
}

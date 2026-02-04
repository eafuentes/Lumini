import React from 'react';
import { Stack } from 'expo-router';

/**
 * Root layout with expo-router stack navigator
 */
export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Lumini' }} />
      <Stack.Screen name="activity" options={{ title: 'Activity' }} />
    </Stack>
  );
}

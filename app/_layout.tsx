import { Stack } from "expo-router";

// This file defines the root navigator (Stack)
export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* This Stack will contain the (tabs) group which is our bottom tab navigator */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

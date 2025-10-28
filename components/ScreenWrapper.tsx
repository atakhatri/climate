import React from "react";
import { StatusBar, StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenWrapperProps {
  children: React.ReactNode;
  backgroundColor: string;
  style?: ViewStyle;
}

/**
 * Ensures consistent safe area handling and applies a theme background.
 * Uses a SafeAreaView from the top edge only, allowing content to bleed below the tab bar.
 */
export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  backgroundColor,
  style,
}) => {
  // Set status bar based on background luminosity
  const isDark = parseInt(backgroundColor.slice(1, 7), 16) > 0xffffff / 2;
  const barStyle = isDark ? "dark-content" : "light-content";

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor }]}
    >
      <StatusBar barStyle={barStyle} />
      <View style={[styles.container, style]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    // Add consistent padding or remove based on how components handle spacing
  },
});

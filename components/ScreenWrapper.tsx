import { LinearGradient } from "expo-linear-gradient";
import React, { FC, ReactNode } from "react";
import { StatusBar, StyleSheet, ViewStyle } from "react-native"; // Import StatusBar
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../styles/theme"; // Import COLORS

interface ScreenWrapperProps {
  children: ReactNode;
  style?: ViewStyle;
  // Make gradientColors optional, provide default in the component
  gradientColors?: [string, string];
}

/**
 * A wrapper for all screens providing safe area handling and a dynamic linear gradient background.
 * Also sets the status bar style.
 */
export const ScreenWrapper: FC<ScreenWrapperProps> = ({
  children,
  style,
  // Provide default gradient colors here
  gradientColors = [COLORS.blueDark, COLORS.blueLight],
}) => {
  // Determine status bar style based on the primary gradient color (simple brightness check)
  // This is a basic example; more sophisticated logic might be needed
  const isDarkBackground =
    gradientColors[0].startsWith("#") &&
    parseInt(gradientColors[0].substring(1, 3), 16) < 100; // Rough check if first color is dark
  const statusBarStyle = isDarkBackground ? "light-content" : "dark-content";

  return (
    // Use the provided or default gradient colors
    <LinearGradient colors={gradientColors} style={[styles.container, style]}>
      {/* Set status bar style */}
      <StatusBar barStyle={statusBarStyle} />
      {/* Apply edges prop to SafeAreaView to control safe area insets */}
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {/* Removed the inner View, children are directly inside SafeAreaView */}
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  // Removed content style as it's no longer needed
});

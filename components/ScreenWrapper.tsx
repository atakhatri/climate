import { LinearGradient } from "expo-linear-gradient";
import React, { FC, ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenWrapperProps {
  children: ReactNode;
  style?: ViewStyle;
  // Set a safe default value for gradientColors just in case, though the hook should handle it.
  // The structure `gradientColors: [string, string] | undefined` forces default handling here.
  gradientColors: [string, string];
}

/**
 * A wrapper for all screens providing safe area handling and a dynamic linear gradient background.
 */
export const ScreenWrapper: FC<ScreenWrapperProps> = ({
  children,
  style,
  // Add a defensive default fallback (though TypeScript should enforce this)
  gradientColors = ["#00a6ffff", "#cdf7ffff"],
}) => {
  return (
    // Check for null/undefined just to be absolutely safe, though we rely on TS to guarantee it.
    <LinearGradient
      // Ensure colors is always an array with at least two elements
      colors={gradientColors}
      style={[styles.container, style]}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>{children}</View>
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
  content: {
    flex: 1,
  },
});

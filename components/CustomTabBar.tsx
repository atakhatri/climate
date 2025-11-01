import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
// --- Import Reanimated hooks and context ---
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
// -------------------------------------------
import { useSafeAreaInsets } from "react-native-safe-area-context";
// --- Import ScrollContext ---
import { useScroll } from "./ScrollContext";
// ----------------------------
import { COLORS, SPACING } from "../styles/theme";

// Define which routes we explicitly want to show in the tab bar
const VISIBLE_ROUTES = ["index", "cities"];

// --- Define Tab Bar Height (approximate) ---
// This is used to calculate how much to translate the bar off-screen
const TAB_BAR_HEIGHT = 60 + SPACING.lg; // fab height (60) + container paddingBottom (24)
// ------------------------------------------

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { bottom } = useSafeAreaInsets(); // Get bottom safe area padding

  // --- Consume scroll context ---
  const { scrollY } = useScroll();
  // ----------------------------

  // --- Store previous scroll value to detect direction ---
  const lastScrollY = useSharedValue(0);
  // `isVisible` tracks the desired state (visible or hidden)
  const isVisible = useSharedValue(true);
  // ---------------------------------------------------

  // Filter the routes to only include the ones we want
  const visibleRoutes = state.routes.filter((route) =>
    VISIBLE_ROUTES.includes(route.name)
  );

  // --- Animated style for the tab bar container ---
  const animatedContainerStyle = useAnimatedStyle(() => {
    // Determine scroll direction
    const diff = scrollY.value - lastScrollY.value;
    lastScrollY.value = scrollY.value; // Update lastScrollY for the next event

    // A small threshold to prevent hiding on minor scrolls or overscroll bounce
    const SCROLL_THRESHOLD = 10;

    if (scrollY.value <= 40) {
      // Always show when near the top
      isVisible.value = true;
    } else if (diff > SCROLL_THRESHOLD) {
      // Scrolling down, hide it
      isVisible.value = false;
    } else if (diff < -SCROLL_THRESHOLD) {
      // Scrolling up, show it
      isVisible.value = true;
    }

    // Calculate the target `translateY` value
    // When hidden, we move it down by its height + safe area + bottom spacing
    const targetTranslateY = isVisible.value
      ? 0
      : TAB_BAR_HEIGHT + bottom + SPACING.sm;

    // Apply animations
    const translateY = withTiming(targetTranslateY, {
      duration: 250,
    });

    // Fade out faster than sliding
    const opacity = withTiming(isVisible.value ? 1 : 0, {
      duration: 200,
    });

    return {
      opacity,
      transform: [{ translateY }],
      // We also add the safe area bottom inset to the container's bottom style
      // This ensures it sits correctly above the home indicator
      bottom: bottom + SPACING.sm,
    };
  });
  // ----------------------------------------------

  return (
    // --- Use Animated.View for the container ---
    <Animated.View
      style={[
        styles.container,
        animatedContainerStyle, // Apply animated style
      ]}
    >
      {visibleRoutes.map((route, index) => {
        // Map over the filtered routes
        const { options } = descriptors[route.key];

        // Find the "real" index of this route in the original state
        const isFocused =
          state.index === state.routes.findIndex((r) => r.key === route.key);

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const iconName = route.name === "index" ? "cloud" : "search";

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            style={[
              styles.fab,
              {
                backgroundColor: isFocused
                  ? COLORS.tabActiveTint
                  : COLORS.slate,
              },
            ]}
          >
            <Ionicons name={iconName as any} size={28} color={COLORS.white} />
          </TouchableOpacity>
        );
      })}
    </Animated.View>
    // -----------------------------------------
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg, // This contributes to the total height
    // `bottom` is now applied dynamically by the animated style
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

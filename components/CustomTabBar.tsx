import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SPACING } from "../styles/theme";

// Define which routes we explicitly want to show in the tab bar
const VISIBLE_ROUTES = ["index", "cities"];

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { bottom } = useSafeAreaInsets(); // Get bottom safe area padding

  // Filter the routes to only include the ones we want
  const visibleRoutes = state.routes.filter((route) =>
    VISIBLE_ROUTES.includes(route.name)
  );

  return (
    <View style={[styles.container, { bottom: bottom + SPACING.sm }]}>
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
    </View>
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
    paddingBottom: SPACING.lg,
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

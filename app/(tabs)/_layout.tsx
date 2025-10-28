import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { COLORS } from "../../styles/theme"; // Import centralized colors

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const tabBackground =
    colorScheme === "dark"
      ? COLORS.tabBackgroundDark
      : COLORS.tabBackgroundLight;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.tabActiveTint,
        tabBarInactiveTintColor: COLORS.tabInactiveTint,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tabBackground,
          borderTopWidth: 0,
          elevation: 10, // Shadow for Android
          shadowColor: COLORS.black, // Shadow for iOS
          shadowOpacity: 0.1,
          shadowRadius: 5,
        },
      }}
    >
      {/* Home Screen Tab (Current Weather) */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "cloud" : "cloud-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
      {/* Cities/Search Screen Tab */}
      <Tabs.Screen
        name="cities"
        options={{
          title: "Cities",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "list" : "list-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

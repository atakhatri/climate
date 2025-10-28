// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { CustomTabBar } from "../../components/CustomTabBar";

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />}>
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false, // Hide header for the index page
          title: "Home",
          // The icon is now handled by CustomTabBar, but we can keep this for accessibility
          tabBarIcon: ({ color }) => (
            <Ionicons name="cloud" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cities" // Changed to cities
        options={{
          title: "Search", // Changed title
          headerShown: false, // No header for search screen, we'll manage it internally
          // The icon is now handled by CustomTabBar
          tabBarIcon: ({ color }) => (
            <Ionicons name="search" size={24} color={color} /> // Changed icon
          ),
        }}
      />
    </Tabs>
  );
}

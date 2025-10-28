import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { getIconNameFromCondition } from "../app/services/weatherService"; // Import the centralized function
import { HourlyData, WeatherIcon } from "../app/utils/types";
import { COLORS, SPACING } from "../styles/theme";

// REMOVED getIconName and getIconColor - using centralized versions

// A helper function to map the weather condition to a specific icon color
const getIconColor = (condition: WeatherIcon): string => {
  // Simple color mapping, can be expanded
  switch (condition) {
    case "sunny":
      return COLORS.yellow;
    case "clear": // Night clear
      return COLORS.white; // Or a pale yellow
    case "rainy":
    case "stormy":
      return COLORS.blueDark;
    case "snowy":
      return COLORS.white;
    case "windy":
      return COLORS.slate;
    case "cloudy":
    case "partly cloudy":
    default:
      return COLORS.white;
  }
};

interface HourlyForecastProps {
  data: HourlyData[];
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ data }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hourly Forecast</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {data.map((item, index) => (
          <View key={index} style={styles.hourItem}>
            <Text style={styles.timeText}>{item.time}</Text>
            <Ionicons
              name={getIconNameFromCondition(item.icon)} // Use centralized function
              size={SPACING.lg}
              style={styles.icon}
              color={getIconColor(item.icon)} // Use color function
            />
            <Text style={styles.tempText}>{item.temp}°</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: SPACING.md, // Horizontal padding for the title section
    marginBottom: SPACING.lg,
    // Removed background/shadow - let ScreenWrapper handle background
  },
  title: {
    fontSize: 18, // Slightly smaller title
    fontWeight: "700", // Bolder title
    color: COLORS.textLight, // White text for contrast
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.xs, // Minimal left padding for title
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scrollContent: {
    paddingVertical: SPACING.md, // Vertical padding for the scroll area
    paddingLeft: SPACING.xs, // Start padding for the first item
    paddingRight: SPACING.md, // End padding for the last item
  },
  hourItem: {
    alignItems: "center", // Center items vertically
    marginHorizontal: SPACING.sm, // Spacing between items
    minWidth: 60, // Ensure items have some minimum width
    paddingVertical: SPACING.xs,
    // Add a subtle background to each item if needed, e.g.,
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',
    // borderRadius: SPACING.sm,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "500", // Medium weight for time
    color: COLORS.textLight, // White text
    marginBottom: SPACING.xs, // Reduced margin
  },
  icon: {
    marginBottom: SPACING.xs, // Reduced margin
  },
  tempText: {
    fontSize: 18, // Larger temp text
    fontWeight: "600", // Semi-bold temp
    color: COLORS.textLight, // White text
  },
});

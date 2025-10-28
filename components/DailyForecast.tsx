import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { getIconNameFromCondition } from "../app/services/weatherService"; // Import the centralized function
import { DailyData, WeatherIcon } from "../app/utils/types";
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

interface DailyForecastProps {
  data: DailyData[];
}

export const DailyForecast: React.FC<DailyForecastProps> = ({ data }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>7-Day Forecast</Text>
      <View style={styles.list}>
        {data.map((item, index) => (
          <View
            key={index}
            style={[
              styles.dayItem,
              index === data.length - 1 && styles.lastItem, // Remove border for last item
            ]}
          >
            <Text style={styles.dayText}>{item.day}</Text>

            <View style={styles.iconContainer}>
              <Ionicons
                name={getIconNameFromCondition(item.icon)} // Use centralized function
                size={SPACING.lg}
                color={getIconColor(item.icon)} // Use color function
              />
            </View>

            <View style={styles.tempContainer}>
              <Text style={styles.highTemp}>{item.high}°</Text>
              <View style={styles.tempBarContainer}>
                {/* Basic bar representation - can be enhanced */}
                <View
                  style={[styles.tempBar, { width: `${item.low + 50}%` }]}
                />
              </View>
              <Text style={styles.lowTemp}>{item.low}°</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: SPACING.md, // Horizontal padding for the whole container
    // Removed background/shadow - let ScreenWrapper handle background
    marginTop: SPACING.sm, // Add some top margin
  },
  title: {
    fontSize: 18, // Slightly smaller title
    fontWeight: "700", // Bolder title
    color: COLORS.textLight, // White text for contrast
    marginBottom: SPACING.md, // More margin below title
    paddingLeft: SPACING.xs, // Minimal left padding for title
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  list: {
    width: "100%",
    // Add a subtle background and padding if desired for the list area
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',
    // borderRadius: SPACING.md,
    // padding: SPACING.sm,
  },
  dayItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm, // Reduced vertical padding
    borderBottomWidth: StyleSheet.hairlineWidth, // Use hairline width for divider
    borderBottomColor: "rgba(255, 255, 255, 0.3)", // Lighter divider color
  },
  lastItem: {
    borderBottomWidth: 0, // No border for the last item
  },
  dayText: {
    fontSize: 16, // Slightly smaller day text
    fontWeight: "500", // Medium weight
    color: COLORS.textLight, // White text
    flex: 1.5, // Give day text slightly more space
  },
  iconContainer: {
    flex: 1,
    alignItems: "center",
  },
  tempContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 3, // Give temps more space
    justifyContent: "flex-end",
  },
  highTemp: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textLight, // White text
    minWidth: 35, // Ensure space
    textAlign: "right",
    marginRight: SPACING.sm,
  },
  tempBarContainer: {
    // Container for the bar
    flex: 1, // Allow bar to take up available space
    height: 4, // Height of the bar background
    backgroundColor: "rgba(255, 255, 255, 0.2)", // Faint background
    borderRadius: 2,
    marginHorizontal: SPACING.sm,
    overflow: "hidden", // Ensure bar stays within bounds
  },
  tempBar: {
    // The actual temperature range bar
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.6)", // Semi-transparent white bar
    borderRadius: 2,
  },
  lowTemp: {
    fontSize: 16,
    fontWeight: "500", // Medium weight for low temp
    color: "rgba(255, 255, 255, 0.7)", // Slightly dimmer white
    minWidth: 35, // Ensure space
    textAlign: "right",
    marginLeft: SPACING.sm,
  },
});

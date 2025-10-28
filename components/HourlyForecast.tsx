import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { HourlyData } from "../app/utils/types";
import { SPACING } from "../styles/theme";
import { WeatherIconComponent } from "./WeatherIcon"; // Import the new component

// Remove getIconName and getIconColor

interface HourlyForecastProps {
  data: HourlyData[];
  textColor: string;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({
  data,
  textColor,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>Hourly Forecast</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {data.map((item, index) => (
          <View key={index} style={styles.hourItem}>
            <Text style={[styles.timeText, { color: textColor }]}>
              {item.time}
            </Text>
            {/* Use WeatherIconComponent */}
            <WeatherIconComponent
              condition={item.icon}
              isDay={item.isDay} // Pass isDay flag
              size={SPACING.xxl + 4} // Adjust size
              style={styles.icon}
            />
            <Text style={[styles.tempText, { color: textColor }]}>
              {item.temp}°
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: SPACING.sm, // Reduced vertical padding
    paddingHorizontal: SPACING.md,
    // backgroundColor: "rgba(255, 255, 255, 0.1)", // Optional subtle background
    borderRadius: SPACING.md,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 20, // Slightly smaller title
    fontWeight: "900", // Bolder
    // color: COLORS.textDark, // Ensure contrast
    marginBottom: SPACING.xs,
    paddingLeft: SPACING.xs,
  },
  scrollContent: {
    paddingVertical: SPACING.sm, // Add vertical padding
  },
  hourItem: {
    alignItems: "center", // Center items vertically
    paddingHorizontal: SPACING.md,
    minWidth: 65, // Adjust width if needed
  },
  timeText: {
    fontSize: 16,
    // color: COLORS.textDark, // Ensure contrast
    marginBottom: SPACING.xs, // Reduce margin
    fontWeight: "700",
  },
  icon: {
    marginBottom: SPACING.lg, // Reduce margin
    height: SPACING.lg + 4, // Explicit height can help alignment
  },
  tempText: {
    fontSize: 18, // Slightly smaller temp
    fontWeight: "800",
    // color: COLORS.indigo, // Ensure contrast
  },
});

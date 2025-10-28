import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DailyData } from "../app/utils/types";
import { SPACING } from "../styles/theme";
import { WeatherIconComponent } from "./WeatherIcon"; // Import the new component

// Remove getIconName and getIconColor

interface DailyForecastProps {
  data: DailyData[];
  textColor: string;
}

export const DailyForecast: React.FC<DailyForecastProps> = ({
  data,
  textColor,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>7-Day Forecast</Text>
      <View style={styles.list}>
        {data.map((item, index) => (
          <View
            key={index}
            style={[
              styles.dayItem,
              index === data.length - 1 && styles.lastItem, // Keep last item style
            ]}
          >
            <Text style={[styles.dayText, { color: textColor }]}>
              {item.day}
            </Text>

            <View style={styles.iconContainer}>
              {/* Use WeatherIconComponent, assume isDay=true for daily */}
              <WeatherIconComponent
                condition={item.icon}
                isDay={true} // Assume day icon for daily forecast
                size={SPACING.xxl + 2} // Adjust size
              />
            </View>

            <View style={styles.tempContainer}>
              <Text style={[styles.tempTextHigh, { color: textColor }]}>
                {item.high}°
              </Text>
              <Text
                style={[styles.tempTextLow, { color: textColor, opacity: 0.7 }]}
              >
                {item.low}°
              </Text>
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
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    // color: COLORS.textDark, // Ensure contrast
    marginBottom: SPACING.sm, // Increased margin
    paddingLeft: SPACING.xs,
  },
  list: {
    width: "100%",
  },
  dayItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm + 2, // Adjusted padding
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)", // Darker, less opaque border
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  dayText: {
    fontSize: 18, // Slightly smaller
    fontWeight: "800",
    // color: COLORS.textDark, // Ensure contrast
    flex: 1.2, // Give day text slightly more space
  },
  iconContainer: {
    flex: 1,
    alignItems: "center",
    // backgroundColor: 'red', // For debugging alignment
    paddingRight: SPACING.md, // Add padding
  },
  tempContainer: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center", // Align temps vertically
  },
  tempTextHigh: {
    // Combined high/low styles
    fontSize: 18,
    fontWeight: "800",
    // color: COLORS.textDark, // Ensure contrast
    minWidth: 35, // Ensure space
    textAlign: "right",
    marginRight: SPACING.sm, // Add space between high and low
  },
  tempTextLow: {
    // Combined high/low styles
    fontSize: 18,
    fontWeight: "800", // Slightly less bold
    // color: COLORS.indigo, // Use a different color for low temp
    minWidth: 35, // Ensure space
    textAlign: "right",
  },
});

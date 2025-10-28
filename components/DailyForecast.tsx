import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DailyData, WeatherIcon } from "../app/utils/types";
import { COLORS, SPACING } from "../styles/theme";

// A helper function to map the weather condition to a specific icon
const getDailySymbol = (condition: WeatherIcon): any => {
  switch (condition) {
    case "sunny":
      return "sun.max.fill";
    case "clear":
      return "moon.stars.fill";
    case "cloudy":
      return "cloud.fill";
    case "rainy":
      return "cloud.rain.fill";
    case "windy":
      return "wind";
    case "stormy":
      return "cloud.bolt.fill";
    case "snowy":
      return "snow";
    default:
      return "cloud";
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
              index === data.length - 1 && styles.lastItem,
            ]}
          >
            <Text style={styles.dayText}>{item.day}</Text>

            <View style={styles.iconContainer}>
              <Ionicons
                name={getDailySymbol(item.icon)}
                type="system"
                size={SPACING.lg}
                tint={COLORS.white}
              />
            </View>

            <View style={styles.tempContainer}>
              <Text style={styles.highTemp}>{item.high}°</Text>
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
    width: "90%",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.xl,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
    paddingBottom: SPACING.sm,
    paddingLeft: SPACING.xs,
  },
  list: {
    width: "100%",
    paddingHorizontal: SPACING.sm,
  },
  dayItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textLight,
    flex: 1,
  },
  iconContainer: {
    flex: 1,
    alignItems: "center",
  },
  tempContainer: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "flex-end",
  },
  highTemp: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textLight,
    minWidth: 40,
    textAlign: "right",
  },
  lowTemp: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.6)",
    minWidth: 40,
    textAlign: "right",
  },
});

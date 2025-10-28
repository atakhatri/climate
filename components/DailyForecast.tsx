import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DailyData, WeatherIcon } from "../app/utils/types";
import { COLORS, SPACING } from "../styles/theme";

// A helper function to map the weather condition to a specific icon
const getIconName = (condition: WeatherIcon): any => {
  switch (condition) {
    case "sunny":
      return "sunny";
    case "clear":
      return "moon";
    case "cloudy":
      return "cloudy";
    case "rainy":
      return "rainy";
    case "windy":
      return "flag-outline";
    case "stormy":
      return "thunderstorm";
    case "snowy":
      return "snow";
    default:
      return "cloud";
  }
};

const getIconColor = (condition: WeatherIcon): string => {
  switch (condition) {
    case "sunny":
      return COLORS.yellow;
    case "windy":
      return COLORS.indigo;
    case "rainy":
      return COLORS.blueDark;
    case "stormy":
      return COLORS.slate;
    case "clear":
      return COLORS.white;
    case "snowy":
      return COLORS.white;
    case "cloudy":
      return COLORS.white;
    case "partly cloudy":
      return COLORS.white;
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
              index === data.length - 1 && styles.lastItem,
            ]}
          >
            <Text style={styles.dayText}>{item.day}</Text>

            <View style={styles.iconContainer}>
              <Ionicons
                name={getIconName(item.icon)}
                size={SPACING.lg}
                color={getIconColor(item.icon)}
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
    width: "100%",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    paddingLeft: SPACING.sm,
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
    borderBottomColor: "rgba(255, 255, 255, 0.5)",
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  dayText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
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
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(255, 204, 0, 1)",
    minWidth: 40,
    textAlign: "right",
  },
  lowTemp: {
    fontSize: 18,
    fontWeight: "500",
    color: "rgba(0, 102, 255, 1)",
    minWidth: 40,
    textAlign: "right",
  },
});

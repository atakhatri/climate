import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { HourlyData, WeatherIcon } from "../app/utils/types";
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
    case "partly cloudy":
      return "partly-sunny";
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

// A helper function to map the weather condition to a specific icon color
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
              name={getIconName(item.icon)}
              size={SPACING.lg}
              style={styles.icon}
              color={getIconColor(item.icon)}
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
    width: "90%",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.xl,
    // backgroundColor: "rgba(255, 255, 255, 0.15)", // Semi-transparent card
    marginBottom: SPACING.lg,
    // shadowColor: COLORS.black,
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.25,
    // shadowRadius: 5,
    // elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    paddingLeft: SPACING.sm,
  },
  scrollContent: {
    // paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    borderBottomColor: "black",
    borderBottomWidth: 1,
  },
  hourItem: {
    alignItems: "baseline",
    paddingHorizontal: SPACING.md,
    minWidth: 70,
  },
  timeText: {
    fontSize: 14,
    color: "#000000",
    marginBottom: SPACING.sm,
  },
  icon: {
    marginBottom: SPACING.sm,
  },
  tempText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
  },
});

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { CurrentWeather, WeatherIcon } from "../app/utils/types";
import { COLORS, SPACING } from "../styles/theme";

const { width } = Dimensions.get("window");

// A function to map our mock string condition to a system symbol name
const getSymbolName = (condition: WeatherIcon): any => {
  switch (condition) {
    case "sunny":
      return "sun.max.fill";
    case "clear":
      return "moon.stars.fill";
    case "cloudy":
      return "cloud.fill";
    case "partly cloudy":
      return "cloud.sun.fill";
    case "rainy":
      return "cloud.rain.fill";
    case "stormy":
      return "cloud.bolt.fill";
    case "snowy":
      return "cloud.snow.fill";
    case "windy":
      return "wind";
    default:
      return "cloud.sun.fill";
  }
};

// Interface for the data passed to the card
interface CardData extends Omit<CurrentWeather, "hourly" | "daily"> {}

interface CurrentWeatherCardProps {
  data: CardData;
  themePrimaryColor: string; // Passed from the parent using useWeatherTheme
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  data,
  themePrimaryColor,
}) => {
  const colorScheme = useColorScheme() ?? "light";

  // Use a slightly lighter/more transparent version of the theme color for the details row
  const detailBorderColor = `rgba(255, 255, 255, 0.2)`;
  const detailTextColor = COLORS.textLight;

  return (
    <View style={styles.card}>
      {/* Location */}
      <Text style={styles.location}>{data.location}</Text>

      {/* Icon and Temperature */}
      <View style={styles.mainInfo}>
        {/* Use a prominent icon size and color */}
        <Ionicons
          name={getSymbolName(data.icon)}
          type="system"
          size={width * 0.2}
          tint={data.icon === "sunny" ? COLORS.blueLight : COLORS.white}
          style={styles.icon}
        />
        <Text style={styles.temperature}>{data.temperature}°</Text>
      </View>

      {/* Condition & High/Low */}
      <Text style={styles.condition}>{data.condition}</Text>
      <Text style={styles.highLow}>
        H: {data.high}° L: {data.low}°
      </Text>

      {/* Detail Row */}
      <View style={[styles.detailRow, { borderTopColor: detailBorderColor }]}>
        <DetailItem
          icon="wind"
          label={`${data.windSpeed} m/s`}
          textColor={detailTextColor}
        />
        <DetailItem
          icon="humidity.fill"
          label={`${data.humidity}%`}
          textColor={detailTextColor}
        />
        <DetailItem
          icon="sun.max"
          label={`UV ${data.uvIndex}`}
          textColor={detailTextColor}
        />
      </View>
    </View>
  );
};

interface DetailItemProps {
  icon: any;
  label: string;
  textColor: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, textColor }) => (
  <View style={styles.detailItem}>
    <Ionicons name={icon} type="system" size={SPACING.md} tint={textColor} />
    <Text style={[styles.detailText, { color: textColor }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    width: width * 0.9,
    padding: SPACING.xl,
    borderRadius: SPACING.xl,
    backgroundColor: "rgba(255, 255, 255, 0.15)", // Semi-transparent card effect
    alignItems: "center",
    marginBottom: SPACING.xl,
    marginTop: SPACING.xxl * 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)", // Subtle border for definition
  },
  location: {
    fontSize: SPACING.lg,
    fontWeight: "600",
    color: COLORS.textLight,
    marginBottom: SPACING.xl,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  mainInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  temperature: {
    fontSize: width * 0.25,
    fontWeight: "200",
    color: COLORS.textLight,
    lineHeight: width * 0.25,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  condition: {
    fontSize: SPACING.lg,
    fontWeight: "500",
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  highLow: {
    fontSize: SPACING.md,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: SPACING.xl,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingTop: SPACING.md,
    borderTopWidth: 1,
  },
  detailItem: {
    alignItems: "center",
  },
  detailText: {
    fontSize: 14,
    marginTop: SPACING.xs,
    fontWeight: "500",
  },
});
